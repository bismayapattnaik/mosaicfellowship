import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job import Job
from app.schemas.job import ParsedJD
from app.services.llm_client import llm_call
from app.prompts.registry import (
    JD_PARSE_SYSTEM,
    JD_PARSE_PROMPT_VERSION,
)


REQUIRED_FIELDS = {"role_title", "seniority", "domain", "experience_range", "hard_skills", "soft_skills", "responsibilities", "evaluation_priority"}

VALID_SENIORITY = {"Intern", "Entry-Level", "Mid-Level", "Senior", "Lead", "Manager", "Director", "VP", "C-Level"}

VALID_DOMAINS = {"Engineering", "Finance", "Marketing", "HR", "Operations", "Design", "Sales", "Data", "Product", "Legal", "General"}


def validate_parsed_jd(data: dict) -> ParsedJD:
    missing = REQUIRED_FIELDS - set(data.keys())
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    if not isinstance(data["hard_skills"], list) or len(data["hard_skills"]) == 0:
        raise ValueError("hard_skills must be a non-empty list")

    if data["seniority"] not in VALID_SENIORITY:
        data["seniority"] = "Mid-Level"

    if data["domain"] not in VALID_DOMAINS:
        data["domain"] = "General"

    return ParsedJD(**data)


async def parse_jd(job_id: str, db: AsyncSession) -> ParsedJD:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise ValueError(f"Job {job_id} not found")

    jd_text = job.jd_text.strip()
    if len(jd_text) < 50:
        raise ValueError("Job description is too vague. Please provide a more detailed description (minimum 50 characters).")

    user_prompt = f"Parse the following job description and extract structured metadata:\n\n{jd_text}"

    raw_result = await llm_call(
        system_prompt=JD_PARSE_SYSTEM,
        user_prompt=user_prompt,
        prompt_name="jd_parse",
        prompt_version=JD_PARSE_PROMPT_VERSION,
        db=db,
    )

    parsed = validate_parsed_jd(raw_result)

    job.parsed_role_title = parsed.role_title
    job.parsed_seniority = parsed.seniority
    job.parsed_domain = parsed.domain
    job.parsed_experience_range = parsed.experience_range
    job.parsed_hard_skills = parsed.hard_skills
    job.parsed_soft_skills = parsed.soft_skills
    job.parsed_responsibilities = parsed.responsibilities
    job.parsed_evaluation_priority = parsed.evaluation_priority
    job.status = "parsed"

    db.add(job)
    await db.flush()

    return parsed
