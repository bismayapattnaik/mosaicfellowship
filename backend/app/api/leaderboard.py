from __future__ import annotations

import csv
import io
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.score import LeaderboardResponse
from app.services.leaderboard_service import get_leaderboard

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/{job_id}", response_model=LeaderboardResponse)
async def leaderboard(
    job_id: UUID,
    sort_by: str = "overall_score",
    filter_recommendation: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await get_leaderboard(
            str(job_id),
            db,
            sort_by=sort_by,
            filter_recommendation=filter_recommendation,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.get("/{job_id}/export")
async def export_leaderboard_csv(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await get_leaderboard(str(job_id), db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank",
        "Name",
        "Email",
        "Overall Score",
        "Accuracy",
        "Depth",
        "Practical Reasoning",
        "Communication",
        "Recommendation",
        "Confidence",
        "Strengths",
        "Weaknesses",
        "Override",
        "Time Spent (seconds)",
        "Submitted At",
    ])

    for idx, entry in enumerate(result.entries, 1):
        dims = entry.dimension_scores
        writer.writerow([
            idx,
            entry.candidate_name,
            entry.candidate_email,
            round(entry.overall_score, 2),
            round(dims.get("accuracy", 0), 2),
            round(dims.get("depth", 0), 2),
            round(dims.get("practical_reasoning", 0), 2),
            round(dims.get("communication", 0), 2),
            entry.recommendation,
            round(entry.confidence, 2),
            "; ".join(entry.strengths),
            "; ".join(entry.weaknesses),
            entry.override_recommendation or "",
            entry.time_spent_total,
            entry.submitted_at.isoformat() if entry.submitted_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leaderboard_{job_id}.csv"},
    )
