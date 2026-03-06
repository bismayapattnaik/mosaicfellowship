from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False, index=True)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False, index=True)
    answer_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    selected_option_index: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # For MCQ
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    score_accuracy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    score_depth: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    score_practical: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    score_communication: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weighted_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    grading_reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_autosaved: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="responses", lazy="selectin")
    question = relationship("Question", back_populates="responses", lazy="selectin")
