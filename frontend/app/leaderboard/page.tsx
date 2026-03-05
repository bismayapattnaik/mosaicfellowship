"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardIndex() {
  const router = useRouter();
  const [jobId, setJobId] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808] bg-grid p-8">
      <div className="relative max-w-md w-full card p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
            Leaderboard
          </div>
        </div>
        <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter text-white mb-2">
          View Rankings
        </h1>
        <p className="text-zinc-500 text-sm font-mono mb-6">Enter a Job ID to view its leaderboard</p>
        <input
          type="text"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="JOB UUID"
          className="input mb-4"
        />
        <button
          onClick={() => jobId && router.push(`/leaderboard/${jobId}`)}
          className="btn-acid w-full"
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
