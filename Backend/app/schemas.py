from pydantic import BaseModel

class ReviewRequest(BaseModel):
    repo_path: str
    task_description: str
    diff_source: str = "unstaged"

class HunkResult(BaseModel):
    id:int
    session_id: int
    file: str
    diff_text: str
    label: str
    reason: str