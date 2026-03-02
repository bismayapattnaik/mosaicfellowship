from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import (
    CandidateInvite,
    CandidateBulkInvite,
    CandidateResponse,
    AutosaveRequest,
    SubmitTestRequest,
    CandidateTestView,
)
from app.services.candidate_service import (
    invite_candidate,
    start_test,
    autosave_answers,
    submit_test,
)

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.post("/invite", response_model=CandidateResponse, status_code=201)
async def invite(payload: CandidateInvite, db: AsyncSession = Depends(get_db)):
    try:
        candidate = await invite_candidate(payload, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return candidate


@router.post("/invite/bulk", response_model=list[CandidateResponse], status_code=201)
async def invite_bulk(payload: CandidateBulkInvite, db: AsyncSession = Depends(get_db)):
    results = []
    errors = []
    for invite_data in payload.candidates:
        try:
            candidate = await invite_candidate(invite_data, db)
            results.append(candidate)
        except ValueError as e:
            errors.append({"email": invite_data.email, "error": str(e)})
    if errors and not results:
        raise HTTPException(status_code=400, detail={"errors": errors})
    return results


@router.post("/start", response_model=CandidateTestView)
async def start_candidate_test(
    session_token: str = Query(...),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    try:
        test_view = await start_test(session_token, ip_address, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return test_view


@router.post("/autosave")
async def autosave(payload: AutosaveRequest, db: AsyncSession = Depends(get_db)):
    try:
        saved_count = await autosave_answers(payload.session_token, payload.answers, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"saved": saved_count}


@router.post("/submit", response_model=CandidateResponse)
async def submit(payload: SubmitTestRequest, db: AsyncSession = Depends(get_db)):
    try:
        candidate = await submit_test(
            payload.session_token,
            payload.answers,
            payload.copy_paste_detected,
            db,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return candidate


@router.get("/job/{job_id}", response_model=list[CandidateResponse])
async def list_candidates_for_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Candidate).where(Candidate.job_id == job_id).order_by(Candidate.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.get("/session/{session_token}", response_model=CandidateResponse)
async def get_candidate_by_session(session_token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Candidate).where(Candidate.session_token == session_token)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate
