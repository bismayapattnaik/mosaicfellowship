import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from sqlalchemy import Enum as SAEnum
from app.db.session import Base


class QuestionType(str, enum.Enum):
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    SCENARIO = "scenario"
    MINI_CASE = "mini_case"


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False, index=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(SAEnum(QuestionType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # For MCQ: list of option strings
    correct_option_index: Mapped[int | None] = mapped_column(Integer, nullable=True)  # For MCQ
    ideal_answer: Mapped[str] = mapped_column(Text, nullable=False)
    scoring_rubric_accuracy_weight: Mapped[float] = mapped_column(Float, default=0.4, nullable=False)
    scoring_rubric_depth_weight: Mapped[float] = mapped_column(Float, default=0.3, nullable=False)
    scoring_rubric_practical_weight: Mapped[float] = mapped_column(Float, default=0.2, nullable=False)
    scoring_rubric_communication_weight: Mapped[float] = mapped_column(Float, default=0.1, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    skill_tags: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    assessment = relationship("Assessment", back_populates="questions", lazy="selectin")
    responses = relationship("Response", back_populates="question", lazy="selectin")
