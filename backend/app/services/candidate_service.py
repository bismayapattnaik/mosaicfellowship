from __future__ import annotations

import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.candidate import Candidate, CandidateStatus
from app.models.assessment import Assessment
from app.models.question import Question
from app.models.response import Response
from app.models.job import Job
from app.core.security import generate_session_token, hash_ip
from app.schemas.candidate import (
    CandidateInvite,
    AnswerSubmission,
    CandidateTestView,
    TestQuestionView,
)


async def invite_candidate(invite: CandidateInvite, db: AsyncSession) -> Candidate:
    result = await db.execute(select(Job).where(Job.id == invite.job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise ValueError(f"Job {invite.job_id} not found")

    result = await db.execute(
        select(Candidate).where(
            Candidate.job_id == invite.job_id,
            Candidate.email == invite.email,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise ValueError(f"Candidate {invite.email} already invited for this job")

    candidate = Candidate(
        job_id=invite.job_id,
        email=invite.email,
        name=invite.name,
        session_token=generate_session_token(),
        status=CandidateStatus.INVITED,
    )
    db.add(candidate)
    await db.flush()
    return candidate


async def start_test(session_token: str, ip_address: str | None, db: AsyncSession) -> CandidateTestView:
    result = await db.execute(
        select(Candidate).where(Candidate.session_token == session_token)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise ValueError("Invalid session token")

    if candidate.status not in (CandidateStatus.INVITED, CandidateStatus.IN_PROGRESS):
        raise ValueError(f"Test cannot be started. Current status: {candidate.status}")

    result = await db.execute(select(Job).where(Job.id == candidate.job_id))
    job = result.scalar_one_or_none()

    result = await db.execute(
        select(Assessment).where(Assessment.job_id == candidate.job_id, Assessment.status == "active")
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise ValueError("No active assessment found for this job")

    result = await db.execute(
        select(Question).where(Question.assessment_id == assessment.id).order_by(Question.order_index)
    )
    questions = list(result.scalars().all())

    if candidate.status == CandidateStatus.INVITED:
        random.shuffle(questions)
        candidate.question_order = ",".join(str(q.id) for q in questions)
        candidate.status = CandidateStatus.IN_PROGRESS
        candidate.started_at = datetime.utcnow()
        if ip_address:
            candidate.ip_hash = hash_ip(ip_address)
        db.add(candidate)
        await db.flush()
    else:
        if candidate.question_order:
            order_map = {uid: idx for idx, uid in enumerate(candidate.question_order.split(","))}
            questions.sort(key=lambda q: order_map.get(str(q.id), 999))

    question_views = [
        TestQuestionView(
            id=q.id,
            order_index=idx,
            question_type=q.question_type.value,
            question_text=q.question_text,
            options=q.options,
            max_score=q.max_score,
        )
        for idx, q in enumerate(questions)
    ]

    return CandidateTestView(
        candidate_id=candidate.id,
        candidate_name=candidate.name,
        job_title=job.title if job else "Unknown",
        time_limit_minutes=assessment.time_limit_minutes,
        questions=question_views,
        started_at=candidate.started_at,
    )


async def autosave_answers(session_token: str, answers: list[AnswerSubmission], db: AsyncSession) -> int:
    result = await db.execute(
        select(Candidate).where(Candidate.session_token == session_token)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise ValueError("Invalid session token")

    if candidate.status != CandidateStatus.IN_PROGRESS:
        raise ValueError("Cannot autosave: test is not in progress")

    saved = 0
    for answer in answers:
        result = await db.execute(
            select(Response).where(
                Response.candidate_id == candidate.id,
                Response.question_id == answer.question_id,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.answer_text = answer.answer_text
            existing.selected_option_index = answer.selected_option_index
            existing.time_spent_seconds = answer.time_spent_seconds
            existing.is_autosaved = True
            existing.updated_at = datetime.utcnow()
            db.add(existing)
        else:
            response = Response(
                candidate_id=candidate.id,
                question_id=answer.question_id,
                answer_text=answer.answer_text,
                selected_option_index=answer.selected_option_index,
                time_spent_seconds=answer.time_spent_seconds,
                is_autosaved=True,
            )
            db.add(response)
        saved += 1

    await db.flush()
    return saved


async def submit_test(
    session_token: str,
    answers: list[AnswerSubmission],
    copy_paste_detected: bool,
    db: AsyncSession,
) -> Candidate:
    result = await db.execute(
        select(Candidate).where(Candidate.session_token == session_token)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise ValueError("Invalid session token")

    if candidate.status != CandidateStatus.IN_PROGRESS:
        raise ValueError(f"Cannot submit: current status is {candidate.status}")

    for answer in answers:
        result = await db.execute(
            select(Response).where(
                Response.candidate_id == candidate.id,
                Response.question_id == answer.question_id,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.answer_text = answer.answer_text
            existing.selected_option_index = answer.selected_option_index
            existing.time_spent_seconds = answer.time_spent_seconds
            existing.is_autosaved = False
            existing.updated_at = datetime.utcnow()
            db.add(existing)
        else:
            response = Response(
                candidate_id=candidate.id,
                question_id=answer.question_id,
                answer_text=answer.answer_text,
                selected_option_index=answer.selected_option_index,
                time_spent_seconds=answer.time_spent_seconds,
                is_autosaved=False,
            )
            db.add(response)

    candidate.status = CandidateStatus.SUBMITTED
    candidate.submitted_at = datetime.utcnow()
    candidate.copy_paste_detected = copy_paste_detected
    db.add(candidate)

    await db.flush()
    return candidate
