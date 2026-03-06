from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.override import Override
from app.schemas.score import OverrideRequest, OverrideResponse
from app.services.override_service import create_override

router = APIRouter(prefix="/overrides", tags=["overrides"])


@router.post("", response_model=OverrideResponse, status_code=201)
async def override_recommendation(
    payload: OverrideRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        override = await create_override(payload, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return override


@router.get("/candidate/{candidate_id}", response_model=list[OverrideResponse])
async def get_overrides_for_candidate(
    candidate_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Override)
        .where(Override.candidate_id == candidate_id)
        .order_by(Override.created_at.desc())
    )
    return result.scalars().all()
