import json
import time
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import get_settings
from app.models.prompt_log import PromptLog

settings = get_settings()

client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
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

    response = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

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
