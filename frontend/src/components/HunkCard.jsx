import { useState } from "react";

const LABEL_STYLES = {
  core_fix: "bg-teal-950 text-teal-300 border-teal-800",
  unrelated_refactor: "bg-amber-950 text-amber-300 border-amber-800",
  formatting: "bg-zinc-800 text-zinc-400 border-zinc-700",
  out_of_scope: "bg-red-950 text-red-300 border-red-800",
  unknown: "bg-purple-950 text-purple-300 border-purple-800",
};

export default function HunkCard({ hunk, onRevert, onRelabel }) {
  const [reverting, setReverting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleRevert = async () => {
    setReverting(true);
    const result = await onRevert(hunk.id);
    setStatus(result.success ? "reverted" : `failed: ${result.error?.slice(0, 60)}`);
    setReverting(false);
  };

  return (
    <div className="border border-zinc-800 rounded-xl bg-[#16181d] overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800 bg-[#0f1115]">
        <span className="font-mono text-sm text-zinc-300">{hunk.file}</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${LABEL_STYLES[hunk.label] || LABEL_STYLES.unknown}`}>
          {hunk.label}
        </span>
      </div>

      <div className="px-4 py-3 space-y-3">
        <p className="text-sm text-zinc-500 italic">{hunk.reason}</p>

        <pre className="bg-black/40 border border-zinc-800 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
          {hunk.diff_text.split("\n").map((line, i) => {
            let color = "text-zinc-500";
            if (line.startsWith("+")) color = "text-teal-400";
            if (line.startsWith("-")) color = "text-red-400";
            if (line.startsWith("@@")) color = "text-sky-400";
            return (
              <div key={i} className={color}>
                {line}
              </div>
            );
          })}
        </pre>

        <div className="flex gap-2 items-center pt-1">
          <button
            onClick={handleRevert}
            disabled={reverting}
            className="text-xs font-mono bg-red-950 text-red-300 border border-red-800 px-3 py-1.5 rounded-md hover:bg-red-900 disabled:opacity-40 transition-colors"
          >
            {reverting ? "reverting..." : "revert hunk"}
          </button>

          <select
            onChange={(e) => onRelabel(hunk.id, e.target.value)}
            defaultValue=""
            className="text-xs font-mono bg-[#0f1115] border border-zinc-800 text-zinc-400 rounded-md px-2 py-1.5 focus:outline-none focus:border-teal-600"
          >
            <option value="" disabled>relabel...</option>
            <option value="core_fix">core_fix</option>
            <option value="unrelated_refactor">unrelated_refactor</option>
            <option value="formatting">formatting</option>
            <option value="out_of_scope">out_of_scope</option>
          </select>

          {status && <span className="text-xs font-mono text-zinc-500">{status}</span>}
        </div>
      </div>
    </div>
  );
}