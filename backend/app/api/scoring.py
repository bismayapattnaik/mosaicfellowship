from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.score import Score
from app.models.response import Response
from app.schemas.score import ScoreResponse
from app.services.scoring_engine import score_candidate

router = APIRouter(prefix="/scoring", tags=["scoring"])


@router.post("/{candidate_id}", response_model=ScoreResponse, status_code=201)
async def score(candidate_id: UUID, db: AsyncSession = Depends(get_db)):
    try:
        score_obj = await score_candidate(str(candidate_id), db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return score_obj


@router.get("/{candidate_id}", response_model=ScoreResponse)
async def get_score(candidate_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Score).where(Score.candidate_id == candidate_id)
    )
    score_obj = result.scalar_one_or_none()
    if not score_obj:
        raise HTTPException(status_code=404, detail="Score not found for this candidate")
    return score_obj


@router.get("/{candidate_id}/responses")
async def get_candidate_responses(candidate_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Response).where(Response.candidate_id == candidate_id)
    )
    responses = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "question_id": str(r.question_id),
            "answer_text": r.answer_text,
            "selected_option_index": r.selected_option_index,
            "time_spent_seconds": r.time_spent_seconds,
            "score_accuracy": r.score_accuracy,
            "score_depth": r.score_depth,
            "score_practical": r.score_practical,
            "score_communication": r.score_communication,
            "weighted_score": r.weighted_score,
            "grading_reasoning": r.grading_reasoning,
        }
        for r in responses
    ]
