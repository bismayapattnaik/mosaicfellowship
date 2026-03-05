"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLeaderboard, exportLeaderboardCSV } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import ScoreBar from "@/components/ScoreBar";
import type { LeaderboardResponse, LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [sortBy, setSortBy] = useState("overall_score");
  const [filterRec, setFilterRec] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const result = (await getLeaderboard(
        jobId,
        sortBy,
        filterRec || undefined
      )) as LeaderboardResponse;
      setData(result);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [jobId, sortBy, filterRec]);

  async function handleExport() {
    try {
      const blob = await exportLeaderboardCSV(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leaderboard_${jobId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export CSV");
    }
  }

  if (loading) return <div className="min-h-screen bg-[#080808] p-8"><div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading leaderboard...</div></div>;
  if (!data) return <div className="min-h-screen bg-[#080808] p-8"><div className="text-red-400 font-mono text-xs uppercase">Failed to load leaderboard</div></div>;

  return (
    <div className="min-h-screen bg-[#080808] bg-grid">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
                Leaderboard
              </div>
            </div>
            <h1 className="font-heading font-bold text-5xl md:text-7xl uppercase tracking-tighter text-white">
              Rankings
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">{data.job_title}</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0C0C0C] border border-white/10 text-zinc-400 px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-acid/50"
            >
              <option value="overall_score">Sort: Score</option>
              <option value="confidence">Sort: Confidence</option>
            </select>
            <select
              value={filterRec}
              onChange={(e) => setFilterRec(e.target.value)}
              className="bg-[#0C0C0C] border border-white/10 text-zinc-400 px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-acid/50"
            >
              <option value="">All</option>
              <option value="advance">Advance</option>
              <option value="consider">Consider</option>
              <option value="reject">Reject</option>
            </select>
            <button onClick={handleExport} className="btn-secondary text-xs">
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2">
            <div className="border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-[#0A0A0A]">
                  <tr>
                    <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank</th>
                    <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                    <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Score</th>
                    <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recommendation</th>
                    <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.entries.map((entry, idx) => (
                    <tr
                      key={entry.candidate_id}
                      className={`hover:bg-[#0C0C0C] cursor-pointer transition-colors ${
                        selectedCandidate?.candidate_id === entry.candidate_id
                          ? "bg-acid/5 border-l-2 border-l-acid"
                          : ""
                      }`}
                      onClick={() => setSelectedCandidate(entry)}
                    >
                      <td className="px-6 py-3 font-heading font-bold text-2xl text-zinc-700">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-heading font-bold uppercase text-white">{entry.candidate_name}</div>
                        <div className="text-[10px] font-mono text-zinc-600">{entry.candidate_email}</div>
                      </td>
                      <td className="px-6 py-3 font-heading font-bold text-2xl text-acid">
                        {Math.round(entry.overall_score)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={entry.override_recommendation || entry.recommendation} />
                        {entry.override_recommendation && (
                          <span className="text-[10px] text-orange-400 font-mono ml-1">(override)</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-zinc-500">
                        {Math.round(entry.confidence * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-3">
              {data.total} candidates scored
            </p>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedCandidate ? (
              <div className="card p-6 sticky top-6">
                <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-white mb-1">
                  {selectedCandidate.candidate_name}
                </h3>
                <p className="text-xs font-mono text-zinc-500 mb-6">
                  {selectedCandidate.candidate_email}
                </p>

                <div className="text-center mb-6 py-4 border border-white/10 bg-[#080808]">
                  <div className="font-heading font-bold text-5xl text-acid">
                    {Math.round(selectedCandidate.overall_score)}
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={selectedCandidate.recommendation} size="md" />
                  </div>
                </div>

                <ScoreBar label="Accuracy" value={selectedCandidate.dimension_scores.accuracy || 0} />
                <ScoreBar label="Depth" value={selectedCandidate.dimension_scores.depth || 0} />
                <ScoreBar label="Practical" value={selectedCandidate.dimension_scores.practical_reasoning || 0} />
                <ScoreBar label="Communication" value={selectedCandidate.dimension_scores.communication || 0} />

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-2">Strengths</div>
                  <ul className="text-xs text-zinc-400 space-y-1 mb-4">
                    {selectedCandidate.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2"><span className="text-acid">+</span> {s}</li>
                    ))}
                  </ul>
                  <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-2">Weaknesses</div>
                  <ul className="text-xs text-zinc-400 space-y-1">
                    {selectedCandidate.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2"><span className="text-red-400">-</span> {w}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/recruiter/jobs/${jobId}/candidates/${selectedCandidate.candidate_id}`}
                  className="block text-center mt-6 btn-acid w-full"
                >
                  Full Report
                </Link>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
                  // Select a candidate
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
