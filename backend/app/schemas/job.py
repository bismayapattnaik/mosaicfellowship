from __future__ import annotations

from typing import List, Optional
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
    parsed_role_title: Optional[str]
    parsed_seniority: Optional[str]
    parsed_domain: Optional[str]
    parsed_experience_range: Optional[str]
    parsed_hard_skills: Optional[List[str]]
    parsed_soft_skills: Optional[List[str]]
    parsed_responsibilities: Optional[List[str]]
    parsed_evaluation_priority: Optional[List[str]]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
