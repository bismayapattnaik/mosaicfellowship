from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.candidate import Candidate
from app.models.score import Score, Recommendation
from app.models.override import Override
from app.models.audit_log import AuditLog
from app.schemas.score import OverrideRequest


RECOMMENDATION_MAP = {
    "advance": Recommendation.ADVANCE,
    "consider": Recommendation.CONSIDER,
    "reject": Recommendation.REJECT,
}


async def create_override(request: OverrideRequest, db: AsyncSession) -> Override:
    result = await db.execute(select(Candidate).where(Candidate.id == request.candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise ValueError(f"Candidate {request.candidate_id} not found")

    result = await db.execute(select(Score).where(Score.candidate_id == request.candidate_id))
    score = result.scalar_one_or_none()
    if not score:
        raise ValueError(f"No score found for candidate {request.candidate_id}")

    new_rec = RECOMMENDATION_MAP.get(request.new_recommendation)
    if not new_rec:
        raise ValueError(f"Invalid recommendation: {request.new_recommendation}")

    override = Override(
        candidate_id=request.candidate_id,
        recruiter_id=request.recruiter_id,
        original_recommendation=score.recommendation,
        new_recommendation=new_rec,
        reason=request.reason,
    )
    db.add(override)

    audit = AuditLog(
        actor_id=str(request.recruiter_id),
        action="override_recommendation",
        entity_type="candidate",
        entity_id=str(request.candidate_id),
        details={
            "original": score.recommendation.value,
            "new": request.new_recommendation,
            "reason": request.reason,
        },
    )
    db.add(audit)

    await db.flush()
    return override
