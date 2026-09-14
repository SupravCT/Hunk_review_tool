from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class ReviewSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    repo_path: str
    task_description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Hunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="reviewsession.id")
    file: str
    diff_text: str
    label: str
    reason: str