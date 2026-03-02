from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.question import Question
from app.schemas.assessment import (
    AssessmentGenerateRequest,
    AssessmentResponse,
    QuestionResponse,
    QuestionDetailResponse,
)
from app.services.assessment_generator import generate_assessment

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.post("/generate", response_model=AssessmentResponse, status_code=201)
async def create_assessment(
    payload: AssessmentGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        assessment = await generate_assessment(str(payload.job_id), db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = await db.execute(
        select(Assessment).where(Assessment.id == assessment.id)
    )
    assessment = result.scalar_one()

    result = await db.execute(
        select(Question).where(Question.assessment_id == assessment.id).order_by(Question.order_index)
    )
    questions = result.scalars().all()

    return AssessmentResponse(
        id=assessment.id,
        job_id=assessment.job_id,
        version=assessment.version,
        time_limit_minutes=assessment.time_limit_minutes,
        total_questions=assessment.total_questions,
        status=assessment.status,
        created_at=assessment.created_at,
        questions=[
            QuestionResponse(
                id=q.id,
                order_index=q.order_index,
                question_type=q.question_type.value,
                question_text=q.question_text,
                options=q.options,
                max_score=q.max_score,
                difficulty=q.difficulty,
                skill_tags=q.skill_tags,
            )
            for q in questions
        ],
    )


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    result = await db.execute(
        select(Question).where(Question.assessment_id == assessment.id).order_by(Question.order_index)
    )
    questions = result.scalars().all()

    return AssessmentResponse(
        id=assessment.id,
        job_id=assessment.job_id,
        version=assessment.version,
        time_limit_minutes=assessment.time_limit_minutes,
        total_questions=assessment.total_questions,
        status=assessment.status,
        created_at=assessment.created_at,
        questions=[
            QuestionResponse(
                id=q.id,
                order_index=q.order_index,
                question_type=q.question_type.value,
                question_text=q.question_text,
                options=q.options,
                max_score=q.max_score,
                difficulty=q.difficulty,
                skill_tags=q.skill_tags,
            )
            for q in questions
        ],
    )


@router.get("/job/{job_id}", response_model=list[AssessmentResponse])
async def list_assessments_for_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assessment).where(Assessment.job_id == job_id).order_by(Assessment.created_at.desc())
    )
    assessments = result.scalars().all()

    response = []
    for assessment in assessments:
        result = await db.execute(
            select(Question).where(Question.assessment_id == assessment.id).order_by(Question.order_index)
        )
        questions = result.scalars().all()
        response.append(AssessmentResponse(
            id=assessment.id,
            job_id=assessment.job_id,
            version=assessment.version,
            time_limit_minutes=assessment.time_limit_minutes,
            total_questions=assessment.total_questions,
            status=assessment.status,
            created_at=assessment.created_at,
            questions=[
                QuestionResponse(
                    id=q.id,
                    order_index=q.order_index,
                    question_type=q.question_type.value,
                    question_text=q.question_text,
                    options=q.options,
                    max_score=q.max_score,
                    difficulty=q.difficulty,
                    skill_tags=q.skill_tags,
                )
                for q in questions
            ],
        ))

    return response


@router.get("/questions/{question_id}", response_model=QuestionDetailResponse)
async def get_question_detail(question_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return QuestionDetailResponse(
        id=question.id,
        order_index=question.order_index,
        question_type=question.question_type.value,
        question_text=question.question_text,
        options=question.options,
        max_score=question.max_score,
        difficulty=question.difficulty,
        skill_tags=question.skill_tags,
        ideal_answer=question.ideal_answer,
        correct_option_index=question.correct_option_index,
        scoring_rubric_accuracy_weight=question.scoring_rubric_accuracy_weight,
        scoring_rubric_depth_weight=question.scoring_rubric_depth_weight,
        scoring_rubric_practical_weight=question.scoring_rubric_practical_weight,
        scoring_rubric_communication_weight=question.scoring_rubric_communication_weight,
    )
