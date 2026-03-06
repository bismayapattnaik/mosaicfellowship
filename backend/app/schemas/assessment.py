from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class ScoringRubric(BaseModel):
    accuracy: float = Field(0.4, ge=0, le=1)
    depth: float = Field(0.3, ge=0, le=1)
    practical_thinking: float = Field(0.2, ge=0, le=1)
    communication: float = Field(0.1, ge=0, le=1)


class QuestionGenerated(BaseModel):
    question_id: int
    type: str
    question_text: str
    options: list[str] | None = None
    correct_option_index: int | None = None
    ideal_answer: str
    scoring_rubric: ScoringRubric
    skill_tags: list[str]
    difficulty: str


class AssessmentGenerateRequest(BaseModel):
    job_id: UUID


class AssessmentResponse(BaseModel):
    id: UUID
    job_id: UUID
    version: int
    time_limit_minutes: int
    total_questions: int
    status: str
    created_at: datetime
    questions: list["QuestionResponse"] = []

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    id: UUID
    order_index: int
    question_type: str
    question_text: str
    options: list[str] | None
    max_score: float
    difficulty: str
    skill_tags: list[str] | None

    class Config:
        from_attributes = True


class QuestionDetailResponse(QuestionResponse):
    ideal_answer: str
    correct_option_index: int | None
    scoring_rubric_accuracy_weight: float
    scoring_rubric_depth_weight: float
    scoring_rubric_practical_weight: float
    scoring_rubric_communication_weight: float
