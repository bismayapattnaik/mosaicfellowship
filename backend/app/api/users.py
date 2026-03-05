from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.candidate import Candidate
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


class LoginRequest(BaseModel):
    email: str


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="User with this email already exists")

    user = User(
        email=payload.email,
        name=payload.name,
        role=UserRole(payload.role),
        org_name=payload.org_name,
    )
    db.add(user)
    await db.flush()
    return user


@router.post("/login", response_model=UserResponse)
async def login_user(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    jobs_result = await db.execute(
        select(func.count()).select_from(Job).where(Job.recruiter_id == user_id)
    )
    total_jobs = jobs_result.scalar() or 0

    candidates_result = await db.execute(
        select(func.count()).select_from(Candidate)
        .join(Job, Candidate.job_id == Job.id)
        .where(Job.recruiter_id == user_id)
    )
    total_candidates = candidates_result.scalar() or 0

    scored_result = await db.execute(
        select(func.count()).select_from(Candidate)
        .join(Job, Candidate.job_id == Job.id)
        .where(Job.recruiter_id == user_id, Candidate.status == "scored")
    )
    total_scored = scored_result.scalar() or 0

    return {
        "total_jobs": total_jobs,
        "total_candidates": total_candidates,
        "total_scored": total_scored,
    }


@router.get("", response_model=list[UserResponse])
async def list_users(role: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(User)
    if role:
        query = query.where(User.role == UserRole(role))
    result = await db.execute(query.order_by(User.created_at.desc()))
    return result.scalars().all()
