"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getScore,
  getCandidateResponses,
  createOverride,
} from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import ScoreBar from "@/components/ScoreBar";
import type { Score } from "@/lib/types";

interface ResponseDetail {
  id: string;
  question_id: string;
  answer_text: string | null;
  selected_option_index: number | null;
  time_spent_seconds: number;
  score_accuracy: number | null;
  score_depth: number | null;
  score_practical: number | null;
  score_communication: number | null;
  weighted_score: number | null;
  grading_reasoning: string | null;
}

export default function CandidateReportPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const [score, setScore] = useState<Score | null>(null);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideRec, setOverrideRec] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      getScore(candidateId) as Promise<Score>,
      getCandidateResponses(candidateId) as Promise<ResponseDetail[]>,
    ])
      .then(([scoreData, responseData]) => {
        setScore(scoreData);
        setResponses(responseData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  async function handleOverride(e: React.FormEvent) {
    e.preventDefault();
    setOverrideLoading(true);
    setError("");
    try {
      await createOverride({
        candidate_id: candidateId,
        recruiter_id: score?.candidate_id || "",
        new_recommendation: overrideRec,
        reason: overrideReason,
      });
      setSuccess("Override saved.");
      setOverrideRec("");
      setOverrideReason("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOverrideLoading(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading report...</p>;
  if (!score) return <p className="text-red-500">Score not found</p>;

  const dims = score.dimension_scores;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Score Overview */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Candidate Report</h1>
            <p className="text-gray-500 text-sm mt-1">
              Scoring version: {score.scoring_version}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-brand-600">
              {Math.round(score.overall_score)}
            </div>
            <StatusBadge status={score.recommendation} />
            <p className="text-xs text-gray-400 mt-1">
              Confidence: {Math.round(score.confidence * 100)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Dimension Scores
            </h3>
            <ScoreBar label="Accuracy" value={dims.accuracy || 0} />
            <ScoreBar label="Depth" value={dims.depth || 0} />
            <ScoreBar
              label="Practical Reasoning"
              value={dims.practical_reasoning || 0}
            />
            <ScoreBar label="Communication" value={dims.communication || 0} />
          </div>
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                Strengths
              </h3>
              <ul className="space-y-1">
                {score.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-green-500 shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2">
                Weaknesses
              </h3>
              <ul className="space-y-1">
                {score.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-red-500 shrink-0">-</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            AI Reasoning
          </h3>
          <p className="text-sm text-gray-600">{score.reasoning_text}</p>
        </div>
      </div>

      {/* Individual Responses */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">
          Response Details ({responses.length})
        </h2>
        <div className="space-y-4">
          {responses.map((r, idx) => (
            <div key={r.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Response #{idx + 1}
                </span>
                {r.weighted_score !== null && (
                  <span className="text-sm font-bold text-brand-600">
                    {Math.round(r.weighted_score)}/100
                  </span>
                )}
              </div>
              <p className="text-sm mb-2">
                {r.answer_text || `Selected option: ${r.selected_option_index}`}
              </p>
              {r.grading_reasoning && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer">
                    Grading reasoning
                  </summary>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.grading_reasoning}
                  </p>
                </details>
              )}
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>Time: {r.time_spent_seconds}s</span>
                {r.score_accuracy !== null && (
                  <span>Acc: {Math.round(r.score_accuracy)}</span>
                )}
                {r.score_depth !== null && (
                  <span>Depth: {Math.round(r.score_depth)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Override */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Override Recommendation</h2>
        <form onSubmit={handleOverride} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Recommendation
            </label>
            <select
              value={overrideRec}
              onChange={(e) => setOverrideRec(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select...</option>
              <option value="advance">Advance</option>
              <option value="consider">Consider</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (min 10 chars)
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              required
              minLength={10}
            />
          </div>
          <button
            type="submit"
            disabled={overrideLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            {overrideLoading ? "Saving..." : "Submit Override"}
          </button>
        </form>
      </div>
    </div>
  );
}
