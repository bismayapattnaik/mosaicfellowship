from __future__ import annotations

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Beat Claude — AI Hiring Companion"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://beatclaude:beatclaude@localhost:5432/beatclaude"
    DATABASE_URL_SYNC: str = "postgresql://beatclaude:beatclaude@localhost:5432/beatclaude"

    ANTHROPIC_API_KEY: str = ""
    LLM_PROVIDER: str = "anthropic"
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "claude-sonnet-4-20250514"
    LLM_TEMPERATURE: float = 0.0
    LLM_MAX_TOKENS: int = 4096

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    SECRET_KEY: str = "change-me-in-production"
    ENCRYPTION_KEY: str = ""

    MAX_ASSESSMENT_GENERATION_SECONDS: int = 60
    MAX_JD_PARSE_SECONDS: int = 20
    MAX_SCORING_SECONDS: int = 10

    AUTOSAVE_INTERVAL_SECONDS: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
