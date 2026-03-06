from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class DimensionScores(BaseModel):
    accuracy: float
    depth: float
    practical_reasoning: float
    communication: float


class ScoreResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    overall_score: float
    dimension_scores: dict
    recommendation: str
    confidence: float
    strengths: list[str]
    weaknesses: list[str]
    reasoning_text: str
    scoring_version: str
    created_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    candidate_id: UUID
    candidate_name: str
    candidate_email: str
    overall_score: float
    dimension_scores: dict
    recommendation: str
    confidence: float
    strengths: list[str]
    weaknesses: list[str]
    submitted_at: Optional[datetime]
    override_recommendation: Optional[str] = None
    time_spent_total: int = 0

    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    job_id: UUID
    job_title: str
    entries: list[LeaderboardEntry]
    total: int


class OverrideRequest(BaseModel):
    candidate_id: UUID
    recruiter_id: UUID
    new_recommendation: str = Field(..., pattern="^(advance|consider|reject)$")
    reason: str = Field(..., min_length=10)


class OverrideResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    recruiter_id: UUID
    original_recommendation: str
    new_recommendation: str
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True
