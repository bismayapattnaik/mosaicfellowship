import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job import Job
from app.models.assessment import Assessment
from app.models.question import Question, QuestionType
from app.schemas.assessment import QuestionGenerated
from app.services.llm_client import llm_call
from app.prompts.registry import (
    ASSESSMENT_GENERATE_SYSTEM,
    ASSESSMENT_GENERATE_PROMPT_VERSION,
)


QUESTION_TYPE_MAP = {
    "mcq": QuestionType.MCQ,
    "short_answer": QuestionType.SHORT_ANSWER,
    "scenario": QuestionType.SCENARIO,
    "mini_case": QuestionType.MINI_CASE,
}

SENIORITY_TIME_MAP = {
    "Intern": 30,
    "Entry-Level": 45,
    "Mid-Level": 60,
    "Senior": 75,
    "Lead": 90,
    "Manager": 90,
    "Director": 90,
    "VP": 90,
    "C-Level": 90,
}


def validate_questions(data: list[dict]) -> list[QuestionGenerated]:
    if not isinstance(data, list):
        raise ValueError("Assessment output must be a JSON array of questions")

    if len(data) < 12 or len(data) > 20:
        raise ValueError(f"Expected 12-20 questions, got {len(data)}")

    validated = []
    type_counts = {"mcq": 0, "short_answer": 0, "scenario": 0, "mini_case": 0}

    for q in data:
        qtype = q.get("type", "").lower()
        if qtype not in type_counts:
            raise ValueError(f"Invalid question type: {qtype}")
        type_counts[qtype] += 1

        rubric = q.get("scoring_rubric", {})
        total = sum(rubric.values())
        if abs(total - 1.0) > 0.05:
            factor = 1.0 / total if total > 0 else 0.25
            rubric = {k: round(v * factor, 2) for k, v in rubric.items()}

        if qtype == "mcq":
            if not q.get("options") or len(q["options"]) != 4:
                raise ValueError(f"MCQ question {q.get('question_id')} must have exactly 4 options")
            if q.get("correct_option_index") is None or q["correct_option_index"] not in range(4):
                raise ValueError(f"MCQ question {q.get('question_id')} must have valid correct_option_index (0-3)")

        validated.append(QuestionGenerated(
            question_id=q["question_id"],
            type=qtype,
            question_text=q["question_text"],
            options=q.get("options"),
            correct_option_index=q.get("correct_option_index"),
            ideal_answer=q["ideal_answer"],
            scoring_rubric=rubric,
            skill_tags=q.get("skill_tags", []),
            difficulty=q.get("difficulty", "medium"),
        ))

    return validated


async def generate_assessment(job_id: str, db: AsyncSession) -> Assessment:
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise ValueError(f"Job {job_id} not found")

    if not job.parsed_hard_skills:
        raise ValueError("Job must be parsed before generating assessment. Call parse endpoint first.")

    parsed_context = json.dumps({
        "role_title": job.parsed_role_title,
        "seniority": job.parsed_seniority,
        "domain": job.parsed_domain,
        "experience_range": job.parsed_experience_range,
        "hard_skills": job.parsed_hard_skills,
        "soft_skills": job.parsed_soft_skills,
        "responsibilities": job.parsed_responsibilities,
        "evaluation_priority": job.parsed_evaluation_priority,
    }, indent=2)

    user_prompt = (
        f"Generate a hiring assessment for the following role:\n\n{parsed_context}\n\n"
        f"Create 15 questions with the specified distribution. "
        f"Ensure questions directly test the hard_skills and responsibilities listed. "
        f"Calibrate difficulty to {job.parsed_seniority} level."
    )

    raw_result = await llm_call(
        system_prompt=ASSESSMENT_GENERATE_SYSTEM,
        user_prompt=user_prompt,
        prompt_name="assessment_generate",
        prompt_version=ASSESSMENT_GENERATE_PROMPT_VERSION,
        db=db,
        max_tokens=8192,
    )

    questions_data = raw_result if isinstance(raw_result, list) else raw_result.get("questions", raw_result)
    if isinstance(questions_data, dict):
        for key in questions_data:
            if isinstance(questions_data[key], list):
                questions_data = questions_data[key]
                break

    validated_questions = validate_questions(questions_data)

    time_limit = SENIORITY_TIME_MAP.get(job.parsed_seniority, 60)

    assessment = Assessment(
        job_id=job.id,
        version=1,
        time_limit_minutes=time_limit,
        total_questions=len(validated_questions),
        status="active",
    )
    db.add(assessment)
    await db.flush()

    for idx, vq in enumerate(validated_questions):
        question = Question(
            assessment_id=assessment.id,
            order_index=idx,
            question_type=QUESTION_TYPE_MAP[vq.type],
            question_text=vq.question_text,
            options=vq.options,
            correct_option_index=vq.correct_option_index,
            ideal_answer=vq.ideal_answer,
            scoring_rubric_accuracy_weight=vq.scoring_rubric.accuracy,
            scoring_rubric_depth_weight=vq.scoring_rubric.depth,
            scoring_rubric_practical_weight=vq.scoring_rubric.practical_thinking,
            scoring_rubric_communication_weight=vq.scoring_rubric.communication,
            max_score=100.0,
            skill_tags=vq.skill_tags,
            difficulty=vq.difficulty,
        )
        db.add(question)

    await db.flush()

    job.status = "assessment_generated"
    db.add(job)
    await db.flush()

    return assessment
