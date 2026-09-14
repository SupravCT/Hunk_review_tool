import subprocess
import tempfile
import os
import re

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.database.models import ReviewSession, Hunk
from app.schemas import ReviewRequest, HunkResult


from app.git_service import get_hunks
from app.llm_service import classify_hunk

VALID_LABELS = {"core_fix", "unrelated_refactor", "formatting", "out_of_scope"}


def _get_hunk_start_line(diff_text: str) -> int:
    """Extract the original file's starting line number from a hunk header.
    e.g. '@@ -40,6 +45,6 @@' -> 40
    """
    match = re.search(r"@@ -(\d+)", diff_text)
    return int(match.group(1)) if match else 0


async def create_review(request: ReviewRequest, session: AsyncSession) -> list[HunkResult]:
    hunks = get_hunks(request.repo_path, request.diff_source)

    db_session = ReviewSession(
        repo_path=request.repo_path,
        task_description=request.task_description,
    )
    session.add(db_session)
    await session.commit()
    await session.refresh(db_session)

    results = []
    for h in hunks:
        label, reason = classify_hunk(request.task_description, h["diff_text"])

        db_hunk = Hunk(
            session_id=db_session.id,
            file=h["file"],
            diff_text=h["diff_text"],
            label=label,
            reason=reason,
        )
        session.add(db_hunk)
        await session.flush()
        await session.refresh(db_hunk)

        results.append(HunkResult(
            id=db_hunk.id,
            session_id=db_session.id,
            file=h["file"],
            diff_text=h["diff_text"],
            label=label,
            reason=reason,
        ))

    await session.commit()
    return results


async def list_sessions(session: AsyncSession):
    result = await session.execute(select(ReviewSession))
    return result.scalars().all()


async def get_session_hunks(session_id: int, session: AsyncSession):
    result = await session.execute(select(Hunk).where(Hunk.session_id == session_id))
    return result.scalars().all()


async def revert_hunk(hunk_id: int, session: AsyncSession):
    # 1. Fetch the hunk and its parent session (need repo_path)
    hunk = await session.get(Hunk, hunk_id)
    if not hunk:
        return {"error": "Hunk not found"}

    review_session = await session.get(ReviewSession, hunk.session_id)
    if not review_session:
        return {"error": "Parent session not found"}

    repo_path = review_session.repo_path

    # 2. Reconstruct proper patch headers using the stored file path
    patch_content = (
        f"--- a/{hunk.file}\n"
        f"+++ b/{hunk.file}\n"
        f"{hunk.diff_text}"
    )

    with tempfile.NamedTemporaryFile(mode="w", suffix=".patch", delete=False, newline="") as f:
        f.write(patch_content)
        patch_path = f.name

    print(f"DEBUG: patch file at {patch_path}")

    try:
        # 3. Run git apply --reverse against the repo
        result = subprocess.run(
            ["git", "apply", "--reverse", patch_path],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            return {
                "success": False,
                "error": result.stderr,
            }

        return {
            "success": True,
            "message": f"Reverted hunk {hunk_id} in {hunk.file}",
        }
    finally:
        # 4. Clean up the temp patch file regardless of outcome
        os.unlink(patch_path)


async def revert_by_label(session_id: int, label: str, session: AsyncSession):
    result = await session.execute(
        select(Hunk).where(Hunk.session_id == session_id, Hunk.label == label)
    )
    hunks = result.scalars().all()

    if not hunks:
        return {"message": f"No hunks found with label '{label}' in session {session_id}"}

    # Sort: group by file, then within each file revert bottom-to-top
    # (highest starting line first) so earlier reverts don't shift
    # line numbers for hunks still waiting to be reverted in the same file.
    sorted_hunks = sorted(
        hunks,
        key=lambda h: (h.file, -_get_hunk_start_line(h.diff_text))
    )

    outcomes = []
    for hunk in sorted_hunks:
        outcome = await revert_hunk(hunk.id, session)
        outcomes.append({"hunk_id": hunk.id, "file": hunk.file, **outcome})

    return {
        "session_id": session_id,
        "label": label,
        "total": len(hunks),
        "results": outcomes,
    }


async def update_hunk_label(hunk_id: int, new_label: str, session: AsyncSession):
    if new_label not in VALID_LABELS:
        return {"error": f"Invalid label '{new_label}'. Must be one of: {', '.join(VALID_LABELS)}"}

    hunk = await session.get(Hunk, hunk_id)
    if not hunk:
        return {"error": "Hunk not found"}
    hunk.label = new_label
    session.add(hunk)
    await session.commit()
    return {"success": True, "hunk_id": hunk_id, "new_label": new_label}