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

  if (loading) return <div className="p-8 text-white/40">Loading leaderboard...</div>;
  if (!data) return <div className="p-8 text-red-400">Failed to load leaderboard</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-grid">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,77,255,0.08),transparent_60%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-white/40">{data.job_title}</p>
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/[0.05] border border-white/[0.1] text-white/70 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500/50"
            >
              <option value="overall_score">Sort by Score</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
            <select
              value={filterRec}
              onChange={(e) => setFilterRec(e.target.value)}
              className="bg-white/[0.05] border border-white/[0.1] text-white/70 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500/50"
            >
              <option value="">All Recommendations</option>
              <option value="advance">Advance</option>
              <option value="consider">Consider</option>
              <option value="reject">Reject</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white/[0.08] text-white/70 border border-white/[0.1] rounded-xl text-sm font-medium hover:bg-white/[0.12] transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Table */}
          <div className="col-span-2">
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.08]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-white/40">
                      Rank
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-white/40">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-white/40">
                      Score
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-white/40">
                      Recommendation
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-white/40">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {data.entries.map((entry, idx) => (
                    <tr
                      key={entry.candidate_id}
                      className={`hover:bg-white/[0.04] cursor-pointer transition-colors ${
                        selectedCandidate?.candidate_id ===
                        entry.candidate_id
                          ? "bg-brand-500/10"
                          : ""
                      }`}
                      onClick={() => setSelectedCandidate(entry)}
                    >
                      <td className="px-4 py-3 font-bold text-white/30">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {entry.candidate_name}
                        </div>
                        <div className="text-xs text-white/30">
                          {entry.candidate_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-brand-400">
                        {Math.round(entry.overall_score)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={
                            entry.override_recommendation ||
                            entry.recommendation
                          }
                        />
                        {entry.override_recommendation && (
                          <span className="text-xs text-orange-400 ml-1">
                            (overridden)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/50">
                        {Math.round(entry.confidence * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-white/30 mt-2">
              {data.total} candidates scored
            </p>
          </div>

          {/* Detail Panel */}
          <div className="col-span-1">
            {selectedCandidate ? (
              <div className="card p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {selectedCandidate.candidate_name}
                </h3>
                <p className="text-sm text-white/40 mb-4">
                  {selectedCandidate.candidate_email}
                </p>

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                    {Math.round(selectedCandidate.overall_score)}
                  </div>
                  <StatusBadge status={selectedCandidate.recommendation} />
                </div>

                <ScoreBar
                  label="Accuracy"
                  value={selectedCandidate.dimension_scores.accuracy || 0}
                />
                <ScoreBar
                  label="Depth"
                  value={selectedCandidate.dimension_scores.depth || 0}
                />
                <ScoreBar
                  label="Practical"
                  value={
                    selectedCandidate.dimension_scores.practical_reasoning || 0
                  }
                />
                <ScoreBar
                  label="Communication"
                  value={
                    selectedCandidate.dimension_scores.communication || 0
                  }
                />

                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                  <h4 className="text-sm font-medium text-emerald-400 mb-1">
                    Strengths
                  </h4>
                  <ul className="text-sm text-white/50 space-y-1 mb-3">
                    {selectedCandidate.strengths.map((s, i) => (
                      <li key={i} className="flex gap-1"><span className="text-emerald-400">+</span> {s}</li>
                    ))}
                  </ul>
                  <h4 className="text-sm font-medium text-red-400 mb-1">
                    Weaknesses
                  </h4>
                  <ul className="text-sm text-white/50 space-y-1">
                    {selectedCandidate.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-1"><span className="text-red-400">-</span> {w}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/recruiter/jobs/${jobId}/candidates/${selectedCandidate.candidate_id}`}
                  className="block text-center mt-4 btn-primary text-sm"
                >
                  Full Report
                </Link>
              </div>
            ) : (
              <div className="card p-6 text-center text-white/30">
                Click a candidate to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
