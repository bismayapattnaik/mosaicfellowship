from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recruiter_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    jd_text: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_role_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    parsed_seniority: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    parsed_domain: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    parsed_experience_range: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    parsed_hard_skills: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    parsed_soft_skills: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    parsed_responsibilities: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    parsed_evaluation_priority: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    recruiter = relationship("User", back_populates="jobs", lazy="selectin")
    assessments = relationship("Assessment", back_populates="job", lazy="selectin")
    candidates = relationship("Candidate", back_populates="job", lazy="selectin")
