import { useState } from "react";

export default function ReviewForm({ onSubmit, loading }) {
  const [repoPath, setRepoPath] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [diffSource, setDiffSource] = useState("unstaged");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(repoPath, taskDescription, diffSource);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#16181d] border border-zinc-800 rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-xs font-mono text-zinc-500 mb-1.5">repo_path</label>
        <input
          type="text"
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          placeholder="C:\path\to\repo"
          className="w-full bg-[#0f1115] border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-teal-600 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-zinc-500 mb-1.5">task_description</label>
        <input
          type="text"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="fix null pointer in login"
          className="w-full bg-[#0f1115] border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-teal-600 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-zinc-500 mb-1.5">diff_source</label>
        <div className="flex gap-2">
          {["unstaged", "staged", "last_commit"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setDiffSource(opt)}
              className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
                diffSource === opt
                  ? "bg-teal-600 border-teal-500 text-white"
                  : "bg-[#0f1115] border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white text-sm font-medium py-2.5 rounded-md hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Reviewing..." : "Run Review"}
      </button>
    </form>
  );
}