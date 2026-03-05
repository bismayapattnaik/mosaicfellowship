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

  if (loading) return <p className="text-white/40">Loading report...</p>;
  if (!score) return <p className="text-red-400">Score not found</p>;

  const dims = score.dimension_scores;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
          {success}
        </div>
      )}

      {/* Score Overview */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Candidate Report</h1>
            <p className="text-white/40 text-sm mt-1">
              Scoring version: {score.scoring_version}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              {Math.round(score.overall_score)}
            </div>
            <StatusBadge status={score.recommendation} />
            <p className="text-xs text-white/30 mt-1">
              Confidence: {Math.round(score.confidence * 100)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-white/50 mb-3">
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
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                Strengths
              </h3>
              <ul className="space-y-1">
                {score.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-white/50 flex gap-2">
                    <span className="text-emerald-400 shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-2">
                Weaknesses
              </h3>
              <ul className="space-y-1">
                {score.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-white/50 flex gap-2">
                    <span className="text-red-400 shrink-0">-</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white/50 mb-2">
            AI Reasoning
          </h3>
          <p className="text-sm text-white/40">{score.reasoning_text}</p>
        </div>
      </div>

      {/* Individual Responses */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Response Details ({responses.length})
        </h2>
        <div className="space-y-4">
          {responses.map((r, idx) => (
            <div key={r.id} className="p-4 bg-white/[0.04] rounded-xl border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/40">
                  Response #{idx + 1}
                </span>
                {r.weighted_score !== null && (
                  <span className="text-sm font-bold text-brand-400">
                    {Math.round(r.weighted_score)}/100
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 mb-2">
                {r.answer_text || `Selected option: ${r.selected_option_index}`}
              </p>
              {r.grading_reasoning && (
                <details className="mt-2">
                  <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors">
                    Grading reasoning
                  </summary>
                  <p className="text-xs text-white/40 mt-1">
                    {r.grading_reasoning}
                  </p>
                </details>
              )}
              <div className="flex gap-4 mt-2 text-xs text-white/30">
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
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Override Recommendation</h2>
        <form onSubmit={handleOverride} className="space-y-4">
          <div>
            <label className="label">
              New Recommendation
            </label>
            <select
              value={overrideRec}
              onChange={(e) => setOverrideRec(e.target.value)}
              className="input"
              required
            >
              <option value="">Select...</option>
              <option value="advance">Advance</option>
              <option value="consider">Consider</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div>
            <label className="label">
              Reason (min 10 chars)
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={3}
              className="input resize-y"
              required
              minLength={10}
            />
          </div>
          <button
            type="submit"
            disabled={overrideLoading}
            className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-sm font-medium hover:bg-orange-500/30 disabled:opacity-50 transition-colors"
          >
            {overrideLoading ? "Saving..." : "Submit Override"}
          </button>
        </form>
      </div>
    </div>
  );
}
