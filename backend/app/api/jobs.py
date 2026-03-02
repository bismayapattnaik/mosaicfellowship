from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse, JobListResponse
from app.services.jd_parser import parse_jd

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(payload: JobCreate, db: AsyncSession = Depends(get_db)):
    job = Job(
        recruiter_id=payload.recruiter_id,
        title=payload.title,
        jd_text=payload.jd_text,
        status="draft",
    )
    db.add(job)
    await db.flush()
    return job


@router.get("", response_model=JobListResponse)
async def list_jobs(
    recruiter_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Job)
    if recruiter_id:
        query = query.where(Job.recruiter_id == recruiter_id)
    query = query.order_by(Job.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().all()
    return JobListResponse(jobs=jobs, total=len(jobs))


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/{job_id}/parse", response_model=JobResponse)
async def parse_job_description(job_id: UUID, db: AsyncSession = Depends(get_db)):
    try:
        await parse_jd(str(job_id), db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    return job
