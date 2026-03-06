from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from sqlalchemy import Enum as SAEnum
from app.db.session import Base


class CandidateStatus(str, enum.Enum):
    INVITED = "invited"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    SCORED = "scored"
    EXPIRED = "expired"


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    session_token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    status: Mapped[CandidateStatus] = mapped_column(SAEnum(CandidateStatus, values_callable=lambda x: [e.value for e in x]), default=CandidateStatus.INVITED, nullable=False)
    ip_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    copy_paste_detected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    question_order: Mapped[str | None] = mapped_column(String(1000), nullable=True)  # Stored as comma-separated UUIDs
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    job = relationship("Job", back_populates="candidates", lazy="selectin")
    responses = relationship("Response", back_populates="candidate", lazy="selectin")
    score = relationship("Score", back_populates="candidate", uselist=False, lazy="selectin")
    overrides = relationship("Override", back_populates="candidate", lazy="selectin")
