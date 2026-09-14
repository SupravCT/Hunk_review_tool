import { useState } from "react";
import Navbar from "./components/Navbar";
import ReviewForm from "./components/ReviewForm";
import HunkCard from "./components/HunkCard";
import SessionList from "./components/SessionList";
import {
  runReview,
  revertHunk,
  revertByLabel,
  updateHunkLabel,
  getSessionHunks,
} from "./api/client";

const LABEL_CHIP_STYLES = {
  core_fix: "bg-teal-950 text-teal-300 border-teal-800",
  unrelated_refactor: "bg-amber-950 text-amber-300 border-amber-800",
  formatting: "bg-zinc-800 text-zinc-400 border-zinc-700",
  out_of_scope: "bg-red-950 text-red-300 border-red-800",
};

function App() {
  const [activeTab, setActiveTab] = useState("review");
  const [hunks, setHunks] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  const handleReview = async (repoPath, taskDescription, diffSource) => {
    setLoading(true);
    setError(null);
    try {
      const results = await runReview(repoPath, taskDescription, diffSource);
      setHunks(results);
      setSessionId(results[0]?.session_id ?? null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
    setLoading(false);
  };

  const handleSelectSession = async (id) => {
    const results = await getSessionHunks(id);
    setHunks(results);
    setSessionId(id);
    setActiveTab("review"); 
  };

  const handleRevert = async (hunkId) => {
    return await revertHunk(hunkId);
  };

  const handleRevertBucket = async (label) => {
    if (!sessionId) return;
    await revertByLabel(sessionId, label);
    const results = await getSessionHunks(sessionId);
    setHunks(results);
  };

  const handleRelabel = async (hunkId, newLabel) => {
    const result = await updateHunkLabel(hunkId, newLabel);
    if (result.success) {
      setHunks((prev) => prev.map((h) => (h.id === hunkId ? { ...h, label: newLabel } : h)));
    }
  };

  const labelCounts = hunks.reduce((acc, h) => {
    acc[h.label] = (acc[h.label] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0f1115]">
      <Navbar sessionCount={sessionCount} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {activeTab === "review" && (
          <>
            <ReviewForm onSubmit={handleReview} loading={loading} />

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm font-mono px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {hunks.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(labelCounts).map(([label, count]) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${LABEL_CHIP_STYLES[label] || "bg-purple-950 text-purple-300 border-purple-800"}`}
                    >
                      <span>{label}: {count}</span>
                      {sessionId && (
                        <button
                          onClick={() => handleRevertBucket(label)}
                          className="text-[10px] underline opacity-70 hover:opacity-100"
                        >
                          revert all
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {hunks.map((hunk) => (
                    <HunkCard key={hunk.id} hunk={hunk} onRevert={handleRevert} onRelabel={handleRelabel} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "sessions" && (
          <SessionList
            onSelectSession={handleSelectSession}
            refreshKey={refreshKey}
            onCountChange={setSessionCount}
          />
        )}
      </div>
    </div>
  );
}

export default App;