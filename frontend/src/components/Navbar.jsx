import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar({ sessionCount, activeTab, onTabChange }) {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/sessions")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const tabs = [
    { key: "review", label: "New Review" },
    { key: "sessions", label: "Sessions" },
  ];

  return (
    <nav className="bg-[#16181d] border-b border-zinc-800 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
            hunk<span className="text-zinc-500">review</span>
          </h1>
        </div>

        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`text-xs font-mono px-3 py-1.5 rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-teal-950 text-teal-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {tab.key === "sessions" && sessionCount > 0 && (
                <span className="ml-1.5 text-zinc-600">{sessionCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              online === null ? "bg-zinc-600" : online ? "bg-teal-500" : "bg-red-500"
            }`}
          />
          <span>{online === null ? "checking..." : online ? "online" : "offline"}</span>
        </div>
      </div>
    </nav>
  );
}