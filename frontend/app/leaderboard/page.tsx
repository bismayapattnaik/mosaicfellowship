"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardIndex() {
  const router = useRouter();
  const [jobId, setJobId] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg border p-8">
        <h1 className="text-2xl font-bold mb-4">View Leaderboard</h1>
        <p className="text-gray-500 mb-6">Enter a Job ID to view its leaderboard</p>
        <input
          type="text"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="Job UUID"
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <button
          onClick={() => jobId && router.push(`/leaderboard/${jobId}`)}
          className="w-full py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
