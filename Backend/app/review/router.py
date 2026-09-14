from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.schemas import ReviewRequest, HunkResult
from app.database.main import get_session
from app.review import service

router = APIRouter(tags=["review"])


@router.post("/review", response_model=list[HunkResult])
async def review(request: ReviewRequest, session: AsyncSession = Depends(get_session)):
    try:
        return await service.create_review(request, session)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sessions")
async def list_sessions(session: AsyncSession = Depends(get_session)):
    return await service.list_sessions(session)


@router.get("/sessions/{session_id}")
async def get_session_detail(session_id: int, session: AsyncSession = Depends(get_session)):
    return await service.get_session_hunks(session_id, session)


@router.post("/hunks/{hunk_id}/revert")
async def revert_hunk(hunk_id: int, session: AsyncSession = Depends(get_session)):
    return await service.revert_hunk(hunk_id, session)


@router.post("/sessions/{session_id}/revert-by-label")
async def revert_by_label(session_id: int, label: str, session: AsyncSession = Depends(get_session)):
    return await service.revert_by_label(session_id, label, session)


@router.patch("/hunks/{hunk_id}/label")
async def update_label(hunk_id: int, new_label: str, session: AsyncSession = Depends(get_session)):
    return await service.update_hunk_label(hunk_id, new_label, session)