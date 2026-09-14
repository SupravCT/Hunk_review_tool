import git
from unidiff import PatchSet


def get_hunks(repo_path: str, diff_source: str = "unstaged"):
    try:
        repo = git.Repo(repo_path)
    except git.exc.NoSuchPathError:
        raise ValueError(f"Path does not exist: {repo_path}")
    except git.exc.InvalidGitRepositoryError:
        raise ValueError(f"Not a valid git repository: {repo_path}")

    if diff_source == "staged":
        diff_text = repo.git.diff("--cached")
    elif diff_source == "last_commit":
        try:
            diff_text = repo.git.diff("HEAD~1", "HEAD")
        except git.exc.GitCommandError:
            raise ValueError("Repository does not have at least 2 commits for last_commit mode")
    elif diff_source == "unstaged":
        diff_text = repo.git.diff()
    else:
        raise ValueError(f"Invalid diff_source: {diff_source}. Must be 'unstaged', 'staged', or 'last_commit'")

    patch = PatchSet(diff_text)

    hunks = []
    for patched_file in patch:
        for hunk in patched_file:
            hunks.append({
                "file": patched_file.path,
                "diff_text": str(hunk)
            })
    return hunks