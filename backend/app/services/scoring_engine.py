import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.candidate import Candidate, CandidateStatus
from app.models.question import Question, QuestionType
from app.models.response import Response
from app.models.score import Score, Recommendation
from app.services.llm_client import llm_call
from app.prompts.registry import (
    SCORING_SYSTEM,
    SCORING_PROMPT_VERSION,
    AGGREGATE_SCORING_SYSTEM,
    AGGREGATE_SCORING_PROMPT_VERSION,
)


def grade_mcq(response: Response, question: Question) -> dict:
    is_correct = response.selected_option_index == question.correct_option_index
    score = 100.0 if is_correct else 0.0
    return {
        "accuracy_score": score,
        "depth_score": score,
        "practical_score": score,
        "communication_score": score,
        "reasoning": (
            f"MCQ auto-graded. Selected option index: {response.selected_option_index}. "
            f"Correct option index: {question.correct_option_index}. "
            f"{'Correct' if is_correct else 'Incorrect'}."
        ),
    }


async def grade_open_response(
    response: Response,
    question: Question,
    db: AsyncSession,
) -> dict:
    answer_text = (response.answer_text or "").strip()

    if not answer_text:
        return {
            "accuracy_score": 0.0,
            "depth_score": 0.0,
            "practical_score": 0.0,
            "communication_score": 0.0,
            "reasoning": "No answer provided. All dimensions scored 0.",
        }

    user_prompt = json.dumps({
        "question": question.question_text,
        "ideal_answer": question.ideal_answer,
        "candidate_answer": answer_text,
        "question_type": question.question_type.value,
        "scoring_weights": {
            "accuracy": question.scoring_rubric_accuracy_weight,
            "depth": question.scoring_rubric_depth_weight,
            "practical_thinking": question.scoring_rubric_practical_weight,
            "communication": question.scoring_rubric_communication_weight,
        },
    }, indent=2)

    result = await llm_call(
        system_prompt=SCORING_SYSTEM,
        user_prompt=user_prompt,
        prompt_name="scoring",
        prompt_version=SCORING_PROMPT_VERSION,
        db=db,
    )

    for key in ["accuracy_score", "depth_score", "practical_score", "communication_score"]:
        val = float(result.get(key, 0))
        result[key] = max(0.0, min(100.0, val))

    if "reasoning" not in result:
        result["reasoning"] = "Score generated without detailed reasoning."

    return result


def compute_weighted_score(scores: dict, question: Question) -> float:
    weighted = (
        scores["accuracy_score"] * question.scoring_rubric_accuracy_weight
        + scores["depth_score"] * question.scoring_rubric_depth_weight
        + scores["practical_score"] * question.scoring_rubric_practical_weight
        + scores["communication_score"] * question.scoring_rubric_communication_weight
    )
    return round(weighted, 2)


async def score_candidate(candidate_id: str, db: AsyncSession) -> Score:
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise ValueError(f"Candidate {candidate_id} not found")

    if candidate.status != CandidateStatus.SUBMITTED:
        raise ValueError(f"Candidate must be in 'submitted' status to score. Current: {candidate.status}")

    result = await db.execute(
        select(Response).where(Response.candidate_id == candidate_id)
    )
    responses = result.scalars().all()

    if not responses:
        raise ValueError(f"No responses found for candidate {candidate_id}")

    question_ids = [r.question_id for r in responses]
    result = await db.execute(select(Question).where(Question.id.in_(question_ids)))
    questions = {q.id: q for q in result.scalars().all()}

    per_question_scores = []

    for resp in responses:
        question = questions.get(resp.question_id)
        if not question:
            continue

        if question.question_type == QuestionType.MCQ:
            scores = grade_mcq(resp, question)
        else:
            scores = await grade_open_response(resp, question, db)

        resp.score_accuracy = scores["accuracy_score"]
        resp.score_depth = scores["depth_score"]
        resp.score_practical = scores["practical_score"]
        resp.score_communication = scores["communication_score"]
        resp.weighted_score = compute_weighted_score(scores, question)
        resp.grading_reasoning = scores["reasoning"]
        db.add(resp)

        per_question_scores.append({
            "question_id": str(question.id),
            "question_type": question.question_type.value,
            "question_text": question.question_text[:200],
            "weighted_score": resp.weighted_score,
            "accuracy": scores["accuracy_score"],
            "depth": scores["depth_score"],
            "practical": scores["practical_score"],
            "communication": scores["communication_score"],
        })

    await db.flush()

    aggregate_input = json.dumps({
        "candidate_name": candidate.name,
        "total_questions": len(per_question_scores),
        "question_scores": per_question_scores,
    }, indent=2)

    aggregate_result = await llm_call(
        system_prompt=AGGREGATE_SCORING_SYSTEM,
        user_prompt=aggregate_input,
        prompt_name="aggregate_scoring",
        prompt_version=AGGREGATE_SCORING_PROMPT_VERSION,
        db=db,
    )

    overall_score = float(aggregate_result.get("overall_score", 0))
    overall_score = max(0.0, min(100.0, overall_score))

    recommendation_str = aggregate_result.get("recommendation", "consider").lower()
    recommendation_map = {
        "advance": Recommendation.ADVANCE,
        "consider": Recommendation.CONSIDER,
        "reject": Recommendation.REJECT,
    }
    recommendation = recommendation_map.get(recommendation_str, Recommendation.CONSIDER)

    confidence = float(aggregate_result.get("confidence", 0.5))
    confidence = max(0.0, min(1.0, confidence))

    score = Score(
        candidate_id=candidate.id,
        overall_score=overall_score,
        dimension_scores=aggregate_result.get("dimension_scores", {}),
        recommendation=recommendation,
        confidence=confidence,
        strengths=aggregate_result.get("strengths", []),
        weaknesses=aggregate_result.get("weaknesses", []),
        reasoning_text=aggregate_result.get("summary", ""),
        scoring_version=SCORING_PROMPT_VERSION,
    )
    db.add(score)

    candidate.status = CandidateStatus.SCORED
    db.add(candidate)

    await db.flush()

    return score
