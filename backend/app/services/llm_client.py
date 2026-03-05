import json
import logging
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import get_settings
from app.models.prompt_log import PromptLog

logger = logging.getLogger(__name__)
settings = get_settings()


def _is_mock_mode() -> bool:
    if settings.LLM_PROVIDER == "anthropic":
        key = (settings.ANTHROPIC_API_KEY or "").strip()
        return not key or len(key) < 20
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
            seniority_map = {"senior": "Senior", "lead": "Lead", "manager": "Manager", "director": "Director", "vp": "VP", "intern": "Intern", "junior": "Entry-Level", "entry": "Entry-Level"}
            seniority = seniority_map.get(level, "Mid-Level")
            break
    domain = "General"
    for d, keywords in {"Engineering": ["engineer", "developer", "software", "backend", "frontend"], "Product": ["product manager", "product owner", "roadmap"], "Data": ["data scientist", "data analyst", "analytics", "ml"], "Finance": ["finance", "financial", "accounting"], "Marketing": ["marketing", "growth", "seo", "content"], "Design": ["designer", "ux", "ui", "figma"], "Sales": ["sales", "account executive", "business development"], "HR": ["human resources", "recruiter", "talent"]}.items():
        if any(k in text for k in keywords):
            domain = d
            break
    return {
        "role_title": "Product Manager" if "product" in text else "Analyst",
        "seniority": seniority, "domain": domain, "experience_range": "3-5 years",
        "hard_skills": skills[:6] if len(skills) > 6 else skills,
        "soft_skills": ["Communication", "Teamwork", "Problem Solving", "Leadership"],
        "responsibilities": ["Define and execute strategy for key initiatives", "Collaborate with cross-functional teams", "Analyze data to drive decisions", "Present findings to stakeholders", "Manage project timelines and deliverables"],
        "evaluation_priority": skills[:4] if len(skills) > 4 else skills,
    }


def _mock_assessment_generate(user_prompt: str) -> list[dict]:
    skills = _extract_skills_from_text(user_prompt)
    s1, s2, s3 = skills[0] if skills else "Analysis", skills[1] if len(skills) > 1 else "Communication", skills[2] if len(skills) > 2 else "Problem Solving"
    return [
        {"question_id": 1, "type": "mcq", "question_text": f"Which best describes the primary purpose of {s1}?", "options": [f"Automate all {s1} without oversight", "Systematically gather and interpret information for decisions", "Replace traditional methods entirely", "Focus solely on quantitative metrics"], "correct_option_index": 1, "ideal_answer": f"{s1} is about systematically gathering and interpreting information for decision-making.", "scoring_rubric": {"accuracy": 0.5, "depth": 0.15, "practical_thinking": 0.2, "communication": 0.15}, "skill_tags": [s1], "difficulty": "easy"},
        {"question_id": 2, "type": "mcq", "question_text": f"When prioritizing {s2} tasks, which approach is most effective?", "options": ["Complete in order received", "Easiest tasks first", "Prioritize by impact, urgency and stakeholder needs", "Delegate all equally"], "correct_option_index": 2, "ideal_answer": "Prioritize by impact, urgency and stakeholder needs.", "scoring_rubric": {"accuracy": 0.4, "depth": 0.2, "practical_thinking": 0.25, "communication": 0.15}, "skill_tags": [s2], "difficulty": "medium"},
        {"question_id": 3, "type": "mcq", "question_text": "Most important factor for stakeholder updates?", "options": ["Every technical detail", "Industry jargon", "Key metrics, risks and decisions needed", "Brevity above all"], "correct_option_index": 2, "ideal_answer": "Focus on key metrics, risks and decisions.", "scoring_rubric": {"accuracy": 0.35, "depth": 0.15, "practical_thinking": 0.2, "communication": 0.3}, "skill_tags": ["Communication"], "difficulty": "medium"},
        {"question_id": 4, "type": "mcq", "question_text": f"Best metric for {s1} initiative effectiveness?", "options": ["Hours spent", "Outcome-based KPIs aligned with objectives", "Meetings held", "Documentation volume"], "correct_option_index": 1, "ideal_answer": "Outcome-based KPIs aligned with business objectives.", "scoring_rubric": {"accuracy": 0.45, "depth": 0.2, "practical_thinking": 0.2, "communication": 0.15}, "skill_tags": [s1], "difficulty": "medium"},
        {"question_id": 5, "type": "mcq", "question_text": "Best approach to resolve cross-functional priority conflicts?", "options": ["Escalate to management", "Each team works independently", "Shared goals and data-driven trade-offs", "Rotate priorities weekly"], "correct_option_index": 2, "ideal_answer": "Facilitate alignment through shared goals and data-driven discussions.", "scoring_rubric": {"accuracy": 0.3, "depth": 0.2, "practical_thinking": 0.3, "communication": 0.2}, "skill_tags": ["Leadership"], "difficulty": "hard"},
        {"question_id": 6, "type": "short_answer", "question_text": f"How would you learn a new {s1} tool with no prior experience?", "options": None, "correct_option_index": None, "ideal_answer": "Research docs, sandbox, use cases, colleagues, learning plan, small project.", "scoring_rubric": {"accuracy": 0.25, "depth": 0.3, "practical_thinking": 0.3, "communication": 0.15}, "skill_tags": [s1], "difficulty": "easy"},
        {"question_id": 7, "type": "short_answer", "question_text": f"Name three key metrics for a {s2} project.", "options": None, "correct_option_index": None, "ideal_answer": "Metrics covering efficiency, quality, and impact with business rationale.", "scoring_rubric": {"accuracy": 0.35, "depth": 0.25, "practical_thinking": 0.25, "communication": 0.15}, "skill_tags": [s2], "difficulty": "medium"},
        {"question_id": 8, "type": "short_answer", "question_text": "Difference between leading and managing? Give examples.", "options": None, "correct_option_index": None, "ideal_answer": "Leading: vision/inspiration. Managing: planning/control. Examples of each.", "scoring_rubric": {"accuracy": 0.3, "depth": 0.25, "practical_thinking": 0.2, "communication": 0.25}, "skill_tags": ["Leadership"], "difficulty": "medium"},
        {"question_id": 9, "type": "short_answer", "question_text": f"How would you explain a complex {s3} concept to a non-technical stakeholder?", "options": None, "correct_option_index": None, "ideal_answer": "Analogies, business impact focus, visual aids, check understanding.", "scoring_rubric": {"accuracy": 0.2, "depth": 0.2, "practical_thinking": 0.25, "communication": 0.35}, "skill_tags": [s3], "difficulty": "medium"},
        {"question_id": 10, "type": "scenario", "question_text": f"Key team member leaving mid-{s1} project, deadline fixed. What do you do?", "options": None, "correct_option_index": None, "ideal_answer": "Assess impact, knowledge transfer, redistribute, communicate risks, adjust plan.", "scoring_rubric": {"accuracy": 0.2, "depth": 0.25, "practical_thinking": 0.35, "communication": 0.2}, "skill_tags": [s1, "Leadership"], "difficulty": "hard"},
        {"question_id": 11, "type": "scenario", "question_text": "Feature has negative feedback but good metrics. Stakeholders want rollback. What do you do?", "options": None, "correct_option_index": None, "ideal_answer": "Analyze both data types, iterate improvements, present data, A/B test.", "scoring_rubric": {"accuracy": 0.25, "depth": 0.25, "practical_thinking": 0.3, "communication": 0.2}, "skill_tags": ["Product Thinking"], "difficulty": "hard"},
        {"question_id": 12, "type": "scenario", "question_text": f"Process error in {s2} produced wrong results for a month. Steps?", "options": None, "correct_option_index": None, "ideal_answer": "Quantify impact, notify, fix, audit, safeguards, lessons learned.", "scoring_rubric": {"accuracy": 0.3, "depth": 0.25, "practical_thinking": 0.3, "communication": 0.15}, "skill_tags": [s2], "difficulty": "hard"},
        {"question_id": 13, "type": "scenario", "question_text": "Two stakeholders with conflicting visions both expect your support. Navigate?", "options": None, "correct_option_index": None, "ideal_answer": "Meet separately, find common ground, data-driven analysis, joint discussion, compromise.", "scoring_rubric": {"accuracy": 0.2, "depth": 0.2, "practical_thinking": 0.3, "communication": 0.3}, "skill_tags": ["Stakeholder Management"], "difficulty": "hard"},
        {"question_id": 14, "type": "mini_case", "question_text": f"New {s1} tool: $50K/yr, 30% efficiency. Team of 8, 15hrs/wk at $80/hr. Calculate ROI.", "options": None, "correct_option_index": None, "ideal_answer": "Current: 8x15x80x52=$4.99M. 30% savings=$1.5M. Net=$1.45M. ROI=2900%.", "scoring_rubric": {"accuracy": 0.4, "depth": 0.25, "practical_thinking": 0.25, "communication": 0.1}, "skill_tags": [s1], "difficulty": "hard"},
        {"question_id": 15, "type": "mini_case", "question_text": "Q1-Q4 data: Revenue growing, CSAT declining, utilization near 100%. Identify trends and give 3 recommendations.", "options": None, "correct_option_index": None, "ideal_answer": "Hire to reduce utilization, investigate CSAT decline, add quality metrics.", "scoring_rubric": {"accuracy": 0.3, "depth": 0.3, "practical_thinking": 0.25, "communication": 0.15}, "skill_tags": ["Data Analysis"], "difficulty": "hard"},
    ]


def _mock_scoring(user_prompt: str) -> dict:
    data = json.loads(user_prompt) if isinstance(user_prompt, str) else user_prompt
    answer = data.get("candidate_answer", "")
    length = len(answer.strip())
    if length == 0:
        return {"accuracy_score": 0, "depth_score": 0, "practical_score": 0, "communication_score": 0, "reasoning": "No answer provided."}
    base = min(40 + length // 5, 85)
    return {"accuracy_score": min(base + 5, 100), "depth_score": min(base, 100), "practical_score": max(base - 5, 0), "communication_score": min(base + 3, 100), "reasoning": f"Demonstrates {'adequate' if base < 70 else 'good'} understanding."}


def _mock_aggregate_scoring(user_prompt: str) -> dict:
    data = json.loads(user_prompt) if isinstance(user_prompt, str) else user_prompt
    scores = data.get("question_scores", [])
    if not scores:
        return {"overall_score": 50, "dimension_scores": {"accuracy": 50, "depth": 50, "practical_reasoning": 50, "communication": 50}, "recommendation": "consider", "confidence": 0.5, "strengths": ["Completed assessment"], "weaknesses": ["Limited data"], "summary": "Insufficient data."}
    avg_score = sum(s.get("weighted_score", 50) for s in scores) / len(scores)
    avg_acc = sum(s.get("accuracy", 50) for s in scores) / len(scores)
    avg_dep = sum(s.get("depth", 50) for s in scores) / len(scores)
    avg_prac = sum(s.get("practical", 50) for s in scores) / len(scores)
    avg_comm = sum(s.get("communication", 50) for s in scores) / len(scores)
    rec = "advance" if avg_score >= 75 else "consider" if avg_score >= 55 else "reject"
    conf = 0.9 if avg_score >= 80 or avg_score < 40 else 0.7
    return {
        "overall_score": round(avg_score, 1),
        "dimension_scores": {"accuracy": round(avg_acc, 1), "depth": round(avg_dep, 1), "practical_reasoning": round(avg_prac, 1), "communication": round(avg_comm, 1)},
        "recommendation": rec, "confidence": conf,
        "strengths": ["Completed all questions", "Domain knowledge", "Clear communication"],
        "weaknesses": ["Could provide more detail", "Room for practical improvement"],
        "summary": f"Scored {round(avg_score, 1)} overall. {'Strong' if avg_score >= 75 else 'Adequate' if avg_score >= 55 else 'Below expectations'} performance.",
    }


MOCK_HANDLERS = {
    "jd_parse": _mock_jd_parse,
    "assessment_generate": _mock_assessment_generate,
    "scoring": _mock_scoring,
    "aggregate_scoring": _mock_aggregate_scoring,
}


async def _call_anthropic(system_prompt: str, user_prompt: str, max_tokens: int):
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model=settings.LLM_MODEL,
        max_tokens=max_tokens,
        temperature=settings.LLM_TEMPERATURE,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return response.content[0].text, response.usage.input_tokens + response.usage.output_tokens


async def _call_openai(system_prompt: str, user_prompt: str, max_tokens: int, json_mode: bool = False):
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY or "sk-mock", base_url=settings.OPENAI_BASE_URL)
    kwargs = {"model": settings.LLM_MODEL, "temperature": settings.LLM_TEMPERATURE, "max_tokens": max_tokens, "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.content, response.usage.total_tokens if response.usage else 0


async def _call_llm(system_prompt: str, user_prompt: str, max_tokens: int, json_mode: bool = False):
    if settings.LLM_PROVIDER == "anthropic":
        prompt = user_prompt
        if json_mode:
            prompt = user_prompt + "\n\nRespond with ONLY valid JSON. No markdown, no explanation, no code fences."
        return await _call_anthropic(system_prompt, prompt, max_tokens)
    return await _call_openai(system_prompt, user_prompt, max_tokens, json_mode)


def _clean_json_output(raw: str) -> str:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


async def _log_and_return_mock(prompt_name, prompt_version, user_prompt, start_time, db, handler, as_raw=False):
    result = handler(user_prompt)
    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    raw_output = json.dumps(result) if isinstance(result, (dict, list)) else str(result)
    log = PromptLog(prompt_name=prompt_name, prompt_version=prompt_version, model="mock", temperature=0, input_text=user_prompt[:10000], output_text=raw_output[:10000], tokens_used=0, latency_ms=elapsed_ms)
    db.add(log)
    await db.flush()
    return raw_output if as_raw else result


async def llm_call(
    system_prompt: str, user_prompt: str, prompt_name: str, prompt_version: str, db: AsyncSession, max_tokens: int | None = None,
) -> dict:
    start_time = time.monotonic()
    if _is_mock_mode():
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            return await _log_and_return_mock(prompt_name, prompt_version, user_prompt, start_time, db, handler)

    try:
        raw_output, tokens_used = await _call_llm(system_prompt, user_prompt, max_tokens or settings.LLM_MAX_TOKENS, json_mode=True)
    except Exception as e:
        logger.warning("LLM API call failed (%s), falling back to mock", e)
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            return await _log_and_return_mock(prompt_name, prompt_version, user_prompt, start_time, db, handler)
        raise

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    cleaned = _clean_json_output(raw_output)
    log = PromptLog(prompt_name=prompt_name, prompt_version=prompt_version, model=settings.LLM_MODEL, temperature=settings.LLM_TEMPERATURE, input_text=user_prompt[:10000], output_text=cleaned[:10000], tokens_used=tokens_used, latency_ms=elapsed_ms)
    db.add(log)
    await db.flush()
    return json.loads(cleaned)


async def llm_call_raw(
    system_prompt: str, user_prompt: str, prompt_name: str, prompt_version: str, db: AsyncSession, max_tokens: int | None = None,
) -> str:
    start_time = time.monotonic()
    if _is_mock_mode():
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            return await _log_and_return_mock(prompt_name, prompt_version, user_prompt, start_time, db, handler, as_raw=True)

    try:
        raw_output, tokens_used = await _call_llm(system_prompt, user_prompt, max_tokens or settings.LLM_MAX_TOKENS)
    except Exception as e:
        logger.warning("LLM API call failed (%s), falling back to mock", e)
        handler = MOCK_HANDLERS.get(prompt_name)
        if handler:
            return await _log_and_return_mock(prompt_name, prompt_version, user_prompt, start_time, db, handler, as_raw=True)
        raise

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    log = PromptLog(prompt_name=prompt_name, prompt_version=prompt_version, model=settings.LLM_MODEL, temperature=settings.LLM_TEMPERATURE, input_text=user_prompt[:10000], output_text=raw_output[:10000], tokens_used=tokens_used, latency_ms=elapsed_ms)
    db.add(log)
    await db.flush()
    return raw_output
