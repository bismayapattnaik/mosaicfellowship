import json
import logging
import time
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)
from app.core.config import get_settings
from app.models.prompt_log import PromptLog

settings = get_settings()


def _is_mock_mode() -> bool:
    key = (settings.OPENAI_API_KEY or "").strip()
    return not key or key.startswith("sk-placeholder") or len(key) < 20


def _extract_skills_from_text(text: str) -> list[str]:
    common_skills = [
        "Python", "JavaScript", "SQL", "Data Analysis", "Project Management",
        "Communication", "Leadership", "Excel", "Financial Modeling", "Java",
        "React", "AWS", "Machine Learning", "Product Strategy", "Agile",
        "Stakeholder Management", "Problem Solving", "Strategic Thinking",
    ]
    found = [s for s in common_skills if s.lower() in text.lower()]
    return found if found else ["Analysis", "Communication", "Problem Solving"]


def _mock_jd_parse(user_prompt: str) -> dict:
    text = user_prompt.lower()
    skills = _extract_skills_from_text(user_prompt)

    seniority = "Mid-Level"
    for level in ["senior", "lead", "manager", "director", "vp", "intern", "junior", "entry"]:
        if level in text:
            seniority_map = {
                "senior": "Senior", "lead": "Lead", "manager": "Manager",
                "director": "Director", "vp": "VP", "intern": "Intern",
                "junior": "Entry-Level", "entry": "Entry-Level",
            }
            seniority = seniority_map.get(level, "Mid-Level")
            break

    domain = "General"
    for d, keywords in {
        "Engineering": ["engineer", "developer", "software", "backend", "frontend"],
        "Product": ["product manager", "product owner", "roadmap"],
        "Data": ["data scientist", "data analyst", "analytics", "ml"],
        "Finance": ["finance", "financial", "accounting"],
        "Marketing": ["marketing", "growth", "seo", "content"],
        "Design": ["designer", "ux", "ui", "figma"],
        "Sales": ["sales", "account executive", "business development"],
        "HR": ["human resources", "recruiter", "talent"],
    }.items():
        if any(k in text for k in keywords):
            domain = d
            break

    return {
        "role_title": "Product Manager" if "product" in text else "Analyst",
        "seniority": seniority,
        "domain": domain,
        "experience_range": "3-5 years",
        "hard_skills": skills[:6] if len(skills) > 6 else skills,
        "soft_skills": ["Communication", "Teamwork", "Problem Solving", "Leadership"],
        "responsibilities": [
            "Define and execute strategy for key initiatives",
            "Collaborate with cross-functional teams",
            "Analyze data to drive decisions",
            "Present findings to stakeholders",
            "Manage project timelines and deliverables",
        ],
        "evaluation_priority": skills[:4] if len(skills) > 4 else skills,
    }


def _mock_assessment_generate(user_prompt: str) -> list[dict]:
    skills = _extract_skills_from_text(user_prompt)
    skill1 = skills[0] if skills else "Analysis"
    skill2 = skills[1] if len(skills) > 1 else "Communication"
    skill3 = skills[2] if len(skills) > 2 else "Problem Solving"

    questions = [
        {
            "question_id": 1, "type": "mcq",
            "question_text": f"Which of the following best describes the primary purpose of {skill1} in a professional context?",
            "options": [
                f"To automate all {skill1} processes without human oversight",
                "To systematically gather, analyze and interpret information for decision-making",
                "To replace traditional methods entirely",
                "To focus solely on quantitative metrics",
            ],
            "correct_option_index": 1,
            "ideal_answer": f"{skill1} in a professional context is primarily about systematically gathering, analyzing and interpreting information to support decision-making.",
            "scoring_rubric": {"accuracy": 0.5, "depth": 0.15, "practical_thinking": 0.2, "communication": 0.15},
            "skill_tags": [skill1], "difficulty": "easy",
        },
        {
            "question_id": 2, "type": "mcq",
            "question_text": f"When prioritizing tasks in a project involving {skill2}, which approach is most effective?",
            "options": [
                "Complete tasks in the order they were received",
                "Focus on the easiest tasks first to build momentum",
                "Prioritize based on impact, urgency and stakeholder needs",
                "Delegate all tasks equally among team members",
            ],
            "correct_option_index": 2,
            "ideal_answer": "Effective prioritization considers impact, urgency and stakeholder needs to maximize value delivery.",
            "scoring_rubric": {"accuracy": 0.4, "depth": 0.2, "practical_thinking": 0.25, "communication": 0.15},
            "skill_tags": [skill2, "Prioritization"], "difficulty": "medium",
        },
        {
            "question_id": 3, "type": "mcq",
            "question_text": "What is the most important factor when communicating project updates to senior stakeholders?",
            "options": [
                "Including every technical detail for completeness",
                "Using industry jargon to demonstrate expertise",
                "Focusing on key metrics, risks and decisions needed",
                "Keeping updates as brief as possible regardless of content",
            ],
            "correct_option_index": 2,
            "ideal_answer": "Senior stakeholders need focused updates covering key metrics, risks and actionable decisions.",
            "scoring_rubric": {"accuracy": 0.35, "depth": 0.15, "practical_thinking": 0.2, "communication": 0.3},
            "skill_tags": ["Communication", "Stakeholder Management"], "difficulty": "medium",
        },
        {
            "question_id": 4, "type": "mcq",
            "question_text": f"Which metric is most useful for measuring the effectiveness of a {skill1} initiative?",
            "options": [
                "Number of hours spent on the initiative",
                "Outcome-based KPIs aligned with business objectives",
                "Number of meetings held to discuss progress",
                "Volume of documentation produced",
            ],
            "correct_option_index": 1,
            "ideal_answer": "Outcome-based KPIs aligned with business objectives directly measure real impact.",
            "scoring_rubric": {"accuracy": 0.45, "depth": 0.2, "practical_thinking": 0.2, "communication": 0.15},
            "skill_tags": [skill1, "Metrics"], "difficulty": "medium",
        },
        {
            "question_id": 5, "type": "mcq",
            "question_text": "In a cross-functional team, what is the best approach to resolve conflicting priorities?",
            "options": [
                "Escalate immediately to senior management",
                "Let each team pursue their own priorities independently",
                "Facilitate alignment through shared goals and data-driven trade-off discussions",
                "Rotate priorities weekly to give each team equal attention",
            ],
            "correct_option_index": 2,
            "ideal_answer": "Facilitating alignment through shared goals ensures buy-in and data-driven decisions.",
            "scoring_rubric": {"accuracy": 0.3, "depth": 0.2, "practical_thinking": 0.3, "communication": 0.2},
            "skill_tags": ["Leadership", "Collaboration"], "difficulty": "hard",
        },
        {
            "question_id": 6, "type": "short_answer",
            "question_text": f"Explain how you would approach learning a new {skill1} tool or framework that you have no prior experience with.",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Research documentation, set up sandbox environment, identify key use cases, connect with experienced colleagues, create structured learning plan, apply to a small project.",
            "scoring_rubric": {"accuracy": 0.25, "depth": 0.3, "practical_thinking": 0.3, "communication": 0.15},
            "skill_tags": [skill1, "Learning Agility"], "difficulty": "easy",
        },
        {
            "question_id": 7, "type": "short_answer",
            "question_text": f"Describe three key metrics you would track to measure the success of a {skill2} project.",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Three specific, measurable metrics covering efficiency, quality, and impact dimensions, with rationale connecting to business outcomes.",
            "scoring_rubric": {"accuracy": 0.35, "depth": 0.25, "practical_thinking": 0.25, "communication": 0.15},
            "skill_tags": [skill2, "Metrics"], "difficulty": "medium",
        },
        {
            "question_id": 8, "type": "short_answer",
            "question_text": "What is the difference between leading and managing a team? Provide a specific example of each.",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Leading involves setting vision and inspiring people. Managing involves planning and controlling resources. Example: Leading - rallying team around new vision. Managing - creating sprint plans.",
            "scoring_rubric": {"accuracy": 0.3, "depth": 0.25, "practical_thinking": 0.2, "communication": 0.25},
            "skill_tags": ["Leadership", "Management"], "difficulty": "medium",
        },
        {
            "question_id": 9, "type": "short_answer",
            "question_text": f"How would you explain a complex {skill3} concept to a non-technical stakeholder?",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Use analogies, focus on business impact, use visual aids, check for understanding, adapt language to audience.",
            "scoring_rubric": {"accuracy": 0.2, "depth": 0.2, "practical_thinking": 0.25, "communication": 0.35},
            "skill_tags": [skill3, "Communication"], "difficulty": "medium",
        },
        {
            "question_id": 10, "type": "scenario",
            "question_text": f"You are 3 weeks into a critical {skill1} project when a key team member announces they are leaving. The deadline cannot be moved. How do you handle this?",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Assess impact, document departing member's knowledge, redistribute work, communicate risks to stakeholders, identify external resources if needed, adjust plan, support team morale.",
            "scoring_rubric": {"accuracy": 0.2, "depth": 0.25, "practical_thinking": 0.35, "communication": 0.2},
            "skill_tags": [skill1, "Crisis Management", "Leadership"], "difficulty": "hard",
        },
        {
            "question_id": 11, "type": "scenario",
            "question_text": "Your team delivered a feature with negative user feedback, but data shows it improves key metrics. Stakeholders want a rollback. What do you do?",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Analyze both qualitative and quantitative data, identify pain points, propose iterative improvements, present data to stakeholders, set up A/B test, create improvement timeline.",
            "scoring_rubric": {"accuracy": 0.25, "depth": 0.25, "practical_thinking": 0.3, "communication": 0.2},
            "skill_tags": ["Product Thinking", "Data Analysis", "Stakeholder Management"], "difficulty": "hard",
        },
        {
            "question_id": 12, "type": "scenario",
            "question_text": f"You discover a process error in {skill2} that has produced incorrect results for the past month. What steps do you take?",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Quantify impact, notify stakeholders, fix process, audit affected outputs, implement safeguards, document lessons learned.",
            "scoring_rubric": {"accuracy": 0.3, "depth": 0.25, "practical_thinking": 0.3, "communication": 0.15},
            "skill_tags": [skill2, "Quality Assurance"], "difficulty": "hard",
        },
        {
            "question_id": 13, "type": "scenario",
            "question_text": "Two senior stakeholders have conflicting visions for a strategic initiative. Both expect your support. How do you navigate this?",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Meet separately to understand perspectives, identify common ground, prepare data-driven trade-off analysis, facilitate joint discussion, propose compromise or phased approach.",
            "scoring_rubric": {"accuracy": 0.2, "depth": 0.2, "practical_thinking": 0.3, "communication": 0.3},
            "skill_tags": ["Stakeholder Management", "Conflict Resolution"], "difficulty": "hard",
        },
        {
            "question_id": 14, "type": "mini_case",
            "question_text": f"Evaluate investing in a new {skill1} tool: Cost $50K/year, promises 30% efficiency gains. Team of 8 spends 15 hrs/week on automatable tasks at $80/hr fully-loaded. Calculate ROI and recommend.",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Current cost: 8x15x$80x52=$4.99M/yr. 30% savings=$1.5M. Net=$1.45M. ROI=2,900%. Recommend investing. Consider implementation time, learning curve, risk.",
            "scoring_rubric": {"accuracy": 0.4, "depth": 0.25, "practical_thinking": 0.25, "communication": 0.1},
            "skill_tags": [skill1, "ROI Analysis"], "difficulty": "hard",
        },
        {
            "question_id": 15, "type": "mini_case",
            "question_text": "Review quarterly data:\nQ1: Revenue $2.1M, Costs $1.8M, CSAT 82%, Utilization 90%\nQ2: Revenue $2.3M, Costs $2.1M, CSAT 78%, Utilization 95%\nQ3: Revenue $2.0M, Costs $1.9M, CSAT 75%, Utilization 98%\nQ4: Revenue $2.5M, Costs $2.0M, CSAT 71%, Utilization 97%\n\nIdentify trends, concerns, and provide 3 recommendations.",
            "options": None, "correct_option_index": None,
            "ideal_answer": "Trends: Revenue volatile but growing, costs up, CSAT declining, utilization unsustainable. Recommendations: 1) Hire to reduce utilization to 80-85%, 2) Root cause CSAT decline, 3) Add quality metrics alongside revenue targets.",
            "scoring_rubric": {"accuracy": 0.3, "depth": 0.3, "practical_thinking": 0.25, "communication": 0.15},
            "skill_tags": ["Data Analysis", "Strategic Thinking"], "difficulty": "hard",
        },
    ]
    return questions


def _mock_scoring(user_prompt: str) -> dict:
    data = json.loads(user_prompt) if isinstance(user_prompt, str) else user_prompt
    answer = data.get("candidate_answer", "")
    length = len(answer.strip())

    if length == 0:
        return {"accuracy_score": 0, "depth_score": 0, "practical_score": 0, "communication_score": 0, "reasoning": "No answer provided."}

    base = min(40 + length // 5, 85)
    return {
        "accuracy_score": min(base + 5, 100),
        "depth_score": min(base, 100),
        "practical_score": max(base - 5, 0),
        "communication_score": min(base + 3, 100),
        "reasoning": f"Answer evaluated. Demonstrates {'adequate' if base < 70 else 'good'} understanding with {'moderate' if base < 70 else 'strong'} depth.",
    }


def _mock_aggregate_scoring(user_prompt: str) -> dict:
    data = json.loads(user_prompt) if isinstance(user_prompt, str) else user_prompt
    scores = data.get("question_scores", [])

    if not scores:
        return {
            "overall_score": 50, "dimension_scores": {"accuracy": 50, "depth": 50, "practical_reasoning": 50, "communication": 50},
            "recommendation": "consider", "confidence": 0.5, "strengths": ["Completed assessment"], "weaknesses": ["Limited data"], "summary": "Insufficient data.",
        }

    avg_score = sum(s.get("weighted_score", 50) for s in scores) / len(scores)
    avg_acc = sum(s.get("accuracy", 50) for s in scores) / len(scores)
    avg_dep = sum(s.get("depth", 50) for s in scores) / len(scores)
    avg_prac = sum(s.get("practical", 50) for s in scores) / len(scores)
    avg_comm = sum(s.get("communication", 50) for s in scores) / len(scores)

    rec = "advance" if avg_score >= 75 else "consider" if avg_score >= 55 else "reject"
    conf = 0.9 if avg_score >= 80 or avg_score < 40 else 0.7

    return {
        "overall_score": round(avg_score, 1),
        "dimension_scores": {
            "accuracy": round(avg_acc, 1), "depth": round(avg_dep, 1),
            "practical_reasoning": round(avg_prac, 1), "communication": round(avg_comm, 1),
        },
        "recommendation": rec, "confidence": conf,
        "strengths": ["Completed all assessment questions", "Demonstrated domain knowledge", "Clear communication style"],
        "weaknesses": ["Could provide more detailed analysis", "Room for improvement in practical application"],
        "summary": f"Candidate scored {round(avg_score, 1)} overall. {'Strong' if avg_score >= 75 else 'Adequate' if avg_score >= 55 else 'Below expectations'} performance.",
    }


MOCK_HANDLERS = {
    "jd_parse": _mock_jd_parse,
    "assessment_generate": _mock_assessment_generate,
    "scoring": _mock_scoring,
    "aggregate_scoring": _mock_aggregate_scoring,
}


client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY or "sk-mock",
    base_url=settings.OPENAI_BASE_URL,
)


async def llm_call(
    system_prompt: str,
    user_prompt: str,
    prompt_name: str,
    prompt_version: str,
    db: AsyncSession,
    max_tokens: int | None = None,
) -> dict:
    start_time = time.monotonic()

    if _is_mock_mode():
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            result = handler(user_prompt)
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            raw_output = json.dumps(result)
            log = PromptLog(
                prompt_name=prompt_name,
                prompt_version=prompt_version,
                model="mock",
                temperature=0,
                input_text=user_prompt[:10000],
                output_text=raw_output[:10000],
                tokens_used=0,
                latency_ms=elapsed_ms,
            )
            db.add(log)
            await db.flush()
            return result

    try:
        response = await client.chat.completions.create(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
    except Exception as e:
        logger.warning("OpenAI API call failed (%s), falling back to mock mode", e)
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            result = handler(user_prompt)
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            raw_output = json.dumps(result)
            log = PromptLog(
                prompt_name=prompt_name, prompt_version=prompt_version,
                model="mock-fallback", temperature=0,
                input_text=user_prompt[:10000], output_text=raw_output[:10000],
                tokens_used=0, latency_ms=elapsed_ms,
            )
            db.add(log)
            await db.flush()
            return result
        raise

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    raw_output = response.choices[0].message.content
    tokens_used = response.usage.total_tokens if response.usage else 0

    log = PromptLog(
        prompt_name=prompt_name,
        prompt_version=prompt_version,
        model=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        input_text=user_prompt[:10000],
        output_text=raw_output[:10000],
        tokens_used=tokens_used,
        latency_ms=elapsed_ms,
    )
    db.add(log)
    await db.flush()

    return json.loads(raw_output)


async def llm_call_raw(
    system_prompt: str,
    user_prompt: str,
    prompt_name: str,
    prompt_version: str,
    db: AsyncSession,
    max_tokens: int | None = None,
) -> str:
    start_time = time.monotonic()

    if _is_mock_mode():
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            result = handler(user_prompt)
            raw_output = json.dumps(result) if isinstance(result, (dict, list)) else str(result)
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            log = PromptLog(
                prompt_name=prompt_name,
                prompt_version=prompt_version,
                model="mock",
                temperature=0,
                input_text=user_prompt[:10000],
                output_text=raw_output[:10000],
                tokens_used=0,
                latency_ms=elapsed_ms,
            )
            db.add(log)
            await db.flush()
            return raw_output

    try:
        response = await client.chat.completions.create(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception as e:
        logger.warning("OpenAI API call failed (%s), falling back to mock mode", e)
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            result = handler(user_prompt)
            raw_output = json.dumps(result) if isinstance(result, (dict, list)) else str(result)
            elapsed_ms = int((time.monotonic() - start_time) * 1000)
            log = PromptLog(
                prompt_name=prompt_name, prompt_version=prompt_version,
                model="mock-fallback", temperature=0,
                input_text=user_prompt[:10000], output_text=raw_output[:10000],
                tokens_used=0, latency_ms=elapsed_ms,
            )
            db.add(log)
            await db.flush()
            return raw_output
        raise

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    raw_output = response.choices[0].message.content
    tokens_used = response.usage.total_tokens if response.usage else 0

    log = PromptLog(
        prompt_name=prompt_name,
        prompt_version=prompt_version,
        model=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        input_text=user_prompt[:10000],
        output_text=raw_output[:10000],
        tokens_used=tokens_used,
        latency_ms=elapsed_ms,
    )
    db.add(log)
    await db.flush()

    return raw_output
