from __future__ import annotations

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.candidate import Candidate, CandidateStatus
from app.models.score import Score, Recommendation
from app.models.response import Response
from app.models.override import Override
from app.models.job import Job
from app.schemas.score import LeaderboardEntry, LeaderboardResponse


async def get_leaderboard(
    job_id: str,
    db: AsyncSession,
    sort_by: str = "overall_score",
    filter_recommendation: Optional[str] = None,
) -> LeaderboardResponse:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise ValueError(f"Job {job_id} not found")

    query = (
        select(Candidate, Score)
        .join(Score, Score.candidate_id == Candidate.id)
        .where(Candidate.job_id == job_id)
        .where(Candidate.status == CandidateStatus.SCORED)
    )

    if filter_recommendation:
        try:
            rec_enum = Recommendation(filter_recommendation)
        except ValueError:
            rec_enum = None
        if rec_enum:
            query = query.where(Score.recommendation == rec_enum)

    if sort_by == "confidence":
        query = query.order_by(Score.confidence.desc())
    else:
        query = query.order_by(Score.overall_score.desc())

    result = await db.execute(query)
    rows = result.all()

    entries = []
    for candidate, score in rows:
        time_result = await db.execute(
            select(func.sum(Response.time_spent_seconds)).where(Response.candidate_id == candidate.id)
        )
        total_time = time_result.scalar() or 0

        override_result = await db.execute(
            select(Override)
            .where(Override.candidate_id == candidate.id)
            .order_by(Override.created_at.desc())
            .limit(1)
        )
        latest_override = override_result.scalar_one_or_none()

        entries.append(LeaderboardEntry(
            candidate_id=candidate.id,
            candidate_name=candidate.name,
            candidate_email=candidate.email,
            overall_score=score.overall_score,
            dimension_scores=score.dimension_scores,
            recommendation=score.recommendation.value,
            confidence=score.confidence,
            strengths=score.strengths,
            weaknesses=score.weaknesses,
            submitted_at=candidate.submitted_at,
            override_recommendation=latest_override.new_recommendation.value if latest_override else None,
            time_spent_total=total_time,
        ))

    return LeaderboardResponse(
        job_id=job.id,
        job_title=job.title,
        entries=entries,
        total=len(entries),
    )
