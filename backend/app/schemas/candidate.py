from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class CandidateInvite(BaseModel):
    job_id: UUID
    email: str = Field(..., min_length=5)
    name: str = Field(..., min_length=1, max_length=255)


class CandidateBulkInvite(BaseModel):
    job_id: UUID
    candidates: list[CandidateInvite]


class CandidateStartTest(BaseModel):
    session_token: str
    ip_address: str | None = None


class CandidateResponse(BaseModel):
    id: UUID
    job_id: UUID
    email: str
    name: str
    session_token: str
    status: str
    started_at: datetime | None
    submitted_at: datetime | None
    copy_paste_detected: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AnswerSubmission(BaseModel):
    question_id: UUID
    answer_text: str | None = None
    selected_option_index: int | None = None
    time_spent_seconds: int = 0


class AutosaveRequest(BaseModel):
    session_token: str
    answers: list[AnswerSubmission]


class SubmitTestRequest(BaseModel):
    session_token: str
    answers: list[AnswerSubmission]
    copy_paste_detected: bool = False


class CandidateTestView(BaseModel):
    candidate_id: UUID
    candidate_name: str
    job_title: str
    time_limit_minutes: int
    questions: list["TestQuestionView"]
    started_at: datetime | None


class TestQuestionView(BaseModel):
    id: UUID
    order_index: int
    question_type: str
    question_text: str
    options: list[str] | None
    max_score: float

    class Config:
        from_attributes = True
