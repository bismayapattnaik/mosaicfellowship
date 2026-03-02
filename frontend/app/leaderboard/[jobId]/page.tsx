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

  if (loading) return <div className="p-8 text-gray-500">Loading leaderboard...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load leaderboard</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-gray-500">{data.job_title}</p>
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="overall_score">Sort by Score</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
            <select
              value={filterRec}
              onChange={(e) => setFilterRec(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Recommendations</option>
              <option value="advance">Advance</option>
              <option value="consider">Consider</option>
              <option value="reject">Reject</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Table */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Rank
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Score
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Recommendation
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.entries.map((entry, idx) => (
                    <tr
                      key={entry.candidate_id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedCandidate?.candidate_id ===
                        entry.candidate_id
                          ? "bg-brand-50"
                          : ""
                      }`}
                      onClick={() => setSelectedCandidate(entry)}
                    >
                      <td className="px-4 py-3 font-bold text-gray-400">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {entry.candidate_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {entry.candidate_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-brand-600">
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
                          <span className="text-xs text-orange-500 ml-1">
                            (overridden)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {Math.round(entry.confidence * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {data.total} candidates scored
            </p>
          </div>

          {/* Detail Panel */}
          <div className="col-span-1">
            {selectedCandidate ? (
              <div className="bg-white rounded-lg border p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-1">
                  {selectedCandidate.candidate_name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedCandidate.candidate_email}
                </p>

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-brand-600">
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

                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-green-700 mb-1">
                    Strengths
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-3">
                    {selectedCandidate.strengths.map((s, i) => (
                      <li key={i}>+ {s}</li>
                    ))}
                  </ul>
                  <h4 className="text-sm font-medium text-red-700 mb-1">
                    Weaknesses
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedCandidate.weaknesses.map((w, i) => (
                      <li key={i}>- {w}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/recruiter/jobs/${jobId}/candidates/${selectedCandidate.candidate_id}`}
                  className="block text-center mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
                >
                  Full Report
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-6 text-center text-gray-400">
                Click a candidate to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
