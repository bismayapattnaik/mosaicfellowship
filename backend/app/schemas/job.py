from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class ParsedJD(BaseModel):
    role_title: str
    seniority: str
    domain: str
    experience_range: str
    hard_skills: list[str]
    soft_skills: list[str]
    responsibilities: list[str]
    evaluation_priority: list[str]


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    jd_text: str = Field(..., min_length=50)
    recruiter_id: UUID


class JobResponse(BaseModel):
    id: UUID
    recruiter_id: UUID
    title: str
    jd_text: str
    parsed_role_title: str | None
    parsed_seniority: str | None
    parsed_domain: str | None
    parsed_experience_range: str | None
    parsed_hard_skills: list[str] | None
    parsed_soft_skills: list[str] | None
    parsed_responsibilities: list[str] | None
    parsed_evaluation_priority: list[str] | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
