from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    email: str = Field(..., min_length=5, max_length=320)
    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., pattern="^(recruiter|candidate|admin)$")
    org_name: str | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    org_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True
