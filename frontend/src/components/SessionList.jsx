import { useEffect, useState } from "react";
import { listSessions } from "../api/client";

export default function SessionList({ onSelectSession, refreshKey, onCountChange }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    listSessions().then((data) => {
      setSessions(data);
      onCountChange?.(data.length);
    }).catch(() => setSessions([]));
  }, [refreshKey]);

  if (sessions.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-xl bg-[#16181d] px-4 py-8 text-center">
        <p className="text-sm text-zinc-600 font-mono">no sessions yet — run a review first</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-xl bg-[#16181d] overflow-hidden divide-y divide-zinc-800/60">
      {sessions.slice().reverse().map((s) => (
        <button
          key={s.id}
          onClick={() => onSelectSession(s.id)}
          className="w-full text-left px-4 py-3 hover:bg-zinc-900 transition-colors"
        >
          <div className="text-sm text-zinc-300 truncate">{s.task_description}</div>
          <div className="text-xs text-zinc-600 font-mono truncate mt-0.5">
            {s.repo_path} — {new Date(s.created_at).toLocaleString()}
          </div>
        </button>
      ))}
    </div>
  );
}