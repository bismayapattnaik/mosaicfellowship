"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    userrole = sa.Enum("recruiter", "candidate", "admin", name="userrole")
    userrole.create(op.get_bind(), checkfirst=True)

    questiontype = sa.Enum("mcq", "short_answer", "scenario", "mini_case", name="questiontype")
    questiontype.create(op.get_bind(), checkfirst=True)

    candidatestatus = sa.Enum("invited", "in_progress", "submitted", "scored", "expired", name="candidatestatus")
    candidatestatus.create(op.get_bind(), checkfirst=True)

    recommendation = sa.Enum("advance", "consider", "reject", name="recommendation")
    recommendation.create(op.get_bind(), checkfirst=True)

    # Users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), unique=True, nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("role", userrole, nullable=False),
        sa.Column("org_name", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )

    # Jobs
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("jd_text", sa.Text, nullable=False),
        sa.Column("parsed_role_title", sa.String(255), nullable=True),
        sa.Column("parsed_seniority", sa.String(100), nullable=True),
        sa.Column("parsed_domain", sa.String(100), nullable=True),
        sa.Column("parsed_experience_range", sa.String(50), nullable=True),
        sa.Column("parsed_hard_skills", postgresql.JSON, nullable=True),
        sa.Column("parsed_soft_skills", postgresql.JSON, nullable=True),
        sa.Column("parsed_responsibilities", postgresql.JSON, nullable=True),
        sa.Column("parsed_evaluation_priority", postgresql.JSON, nullable=True),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )

    # Assessments
    op.create_table(
        "assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("jobs.id"), nullable=False, index=True),
        sa.Column("version", sa.Integer, nullable=False),
        sa.Column("time_limit_minutes", sa.Integer, nullable=False),
        sa.Column("total_questions", sa.Integer, nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    # Questions
    op.create_table(
        "questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("assessment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("assessments.id"), nullable=False, index=True),
        sa.Column("order_index", sa.Integer, nullable=False),
        sa.Column("question_type", questiontype, nullable=False),
        sa.Column("question_text", sa.Text, nullable=False),
        sa.Column("options", postgresql.JSON, nullable=True),
        sa.Column("correct_option_index", sa.Integer, nullable=True),
        sa.Column("ideal_answer", sa.Text, nullable=False),
        sa.Column("scoring_rubric_accuracy_weight", sa.Float, nullable=False),
        sa.Column("scoring_rubric_depth_weight", sa.Float, nullable=False),
        sa.Column("scoring_rubric_practical_weight", sa.Float, nullable=False),
        sa.Column("scoring_rubric_communication_weight", sa.Float, nullable=False),
        sa.Column("max_score", sa.Float, nullable=False),
        sa.Column("skill_tags", postgresql.JSON, nullable=True),
        sa.Column("difficulty", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    # Candidates
    op.create_table(
        "candidates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("jobs.id"), nullable=False, index=True),
        sa.Column("email", sa.String(320), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("session_token", sa.String(128), unique=True, nullable=False, index=True),
        sa.Column("status", candidatestatus, nullable=False),
        sa.Column("ip_hash", sa.String(128), nullable=True),
        sa.Column("started_at", sa.DateTime, nullable=True),
        sa.Column("submitted_at", sa.DateTime, nullable=True),
        sa.Column("copy_paste_detected", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("question_order", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    # Responses
    op.create_table(
        "responses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id"), nullable=False, index=True),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("questions.id"), nullable=False, index=True),
        sa.Column("answer_text", sa.Text, nullable=True),
        sa.Column("selected_option_index", sa.Integer, nullable=True),
        sa.Column("time_spent_seconds", sa.Integer, nullable=False, server_default="0"),
        sa.Column("score_accuracy", sa.Float, nullable=True),
        sa.Column("score_depth", sa.Float, nullable=True),
        sa.Column("score_practical", sa.Float, nullable=True),
        sa.Column("score_communication", sa.Float, nullable=True),
        sa.Column("weighted_score", sa.Float, nullable=True),
        sa.Column("grading_reasoning", sa.Text, nullable=True),
        sa.Column("is_autosaved", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )

    # Scores
    op.create_table(
        "scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id"), unique=True, nullable=False, index=True),
        sa.Column("overall_score", sa.Float, nullable=False),
        sa.Column("dimension_scores", postgresql.JSON, nullable=False),
        sa.Column("recommendation", recommendation, nullable=False),
        sa.Column("confidence", sa.Float, nullable=False),
        sa.Column("strengths", postgresql.JSON, nullable=False),
        sa.Column("weaknesses", postgresql.JSON, nullable=False),
        sa.Column("reasoning_text", sa.Text, nullable=False),
        sa.Column("scoring_version", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    # Overrides
    op.create_table(
        "overrides",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("candidates.id"), nullable=False, index=True),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("original_recommendation", recommendation, nullable=False),
        sa.Column("new_recommendation", recommendation, nullable=False),
        sa.Column("reason", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    # Audit Logs
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("actor_id", sa.String(128), nullable=False, index=True),
        sa.Column("action", sa.String(100), nullable=False, index=True),
        sa.Column("entity_type", sa.String(100), nullable=False),
        sa.Column("entity_id", sa.String(128), nullable=False),
        sa.Column("details", postgresql.JSON, nullable=True),
        sa.Column("ip_address", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    # Prompt Logs
    op.create_table(
        "prompt_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("prompt_name", sa.String(100), nullable=False, index=True),
        sa.Column("prompt_version", sa.String(50), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("temperature", sa.Float, nullable=False),
        sa.Column("input_text", sa.Text, nullable=False),
        sa.Column("output_text", sa.Text, nullable=False),
        sa.Column("tokens_used", sa.Integer, nullable=False, server_default="0"),
        sa.Column("latency_ms", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("prompt_logs")
    op.drop_table("audit_logs")
    op.drop_table("overrides")
    op.drop_table("scores")
    op.drop_table("responses")
    op.drop_table("candidates")
    op.drop_table("questions")
    op.drop_table("assessments")
    op.drop_table("jobs")
    op.drop_table("users")

    sa.Enum(name="recommendation").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="candidatestatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="questiontype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="userrole").drop(op.get_bind(), checkfirst=True)
