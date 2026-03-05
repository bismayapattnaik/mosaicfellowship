"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
  const jobId = params.jobId as string;
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
    const recruiterId = localStorage.getItem("recruiter_id") || "";
    setOverrideLoading(true);
    setError("");
    try {
      await createOverride({
        candidate_id: candidateId,
        recruiter_id: recruiterId,
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

  if (loading) return <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading report...</div>;
  if (!score) return <div className="text-red-400 font-mono text-xs uppercase">Score not found</div>;

  const dims = score.dimension_scores;

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/recruiter/jobs/${jobId}`} className="text-zinc-500 hover:text-white transition-colors font-mono text-xs uppercase">
          ← Back to Job
        </Link>
      </div>

      {/* Score Overview */}
      <div className="border-b border-white/10 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
                Report
              </div>
              <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                v{score.scoring_version}
              </span>
            </div>
            <h1 className="font-heading font-bold text-5xl uppercase tracking-tighter text-white">
              Candidate Report
            </h1>
          </div>
          <div className="text-right">
            <div className="font-heading font-bold text-6xl text-acid">
              {Math.round(score.overall_score)}
            </div>
            <div className="mt-2">
              <StatusBadge status={score.recommendation} size="md" />
            </div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase mt-2">
              Confidence: {Math.round(score.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Dimensions + Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Dimension Scores</div>
          <ScoreBar label="Accuracy" value={dims.accuracy || 0} />
          <ScoreBar label="Depth" value={dims.depth || 0} />
          <ScoreBar label="Practical Reasoning" value={dims.practical_reasoning || 0} />
          <ScoreBar label="Communication" value={dims.communication || 0} />
        </div>
        <div className="card p-6">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-3">Strengths</div>
          <ul className="space-y-2 mb-6">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-acid shrink-0">+</span> {s}
              </li>
            ))}
          </ul>
          <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-3">Weaknesses</div>
          <ul className="space-y-2">
            {score.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-red-400 shrink-0">-</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="card p-6">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">AI Reasoning</div>
        <p className="text-sm text-zinc-400 leading-relaxed">{score.reasoning_text}</p>
      </div>

      {/* Individual Responses */}
      <div>
        <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-white mb-6">
          Responses ({responses.length})
        </h2>
        <div className="space-y-3">
          {responses.map((r, idx) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Response #{idx + 1}
                </span>
                {r.weighted_score !== null && (
                  <span className="font-heading font-bold text-xl text-acid">
                    {Math.round(r.weighted_score)}/100
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300 mb-3">
                {r.answer_text || `Selected option: ${r.selected_option_index}`}
              </p>
              {r.grading_reasoning && (
                <details className="mt-2">
                  <summary className="text-[10px] font-mono text-zinc-600 uppercase cursor-pointer hover:text-zinc-400 transition-colors">
                    Grading reasoning
                  </summary>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {r.grading_reasoning}
                  </p>
                </details>
              )}
              <div className="flex gap-4 mt-3 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                <span>Time: {r.time_spent_seconds}s</span>
                {r.score_accuracy !== null && <span>Acc: {Math.round(r.score_accuracy)}</span>}
                {r.score_depth !== null && <span>Depth: {Math.round(r.score_depth)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Override */}
      <div className="card p-6">
        <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-white mb-6">Override Recommendation</h2>
        <form onSubmit={handleOverride} className="space-y-4">
          <div>
            <label className="label">New Recommendation</label>
            <select value={overrideRec} onChange={(e) => setOverrideRec(e.target.value)} className="input" required>
              <option value="">Select...</option>
              <option value="advance">Advance</option>
              <option value="consider">Consider</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div>
            <label className="label">Reason (min 10 chars)</label>
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
            className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold uppercase hover:bg-orange-500/30 disabled:opacity-50 transition-colors"
          >
            {overrideLoading ? "Saving..." : "Submit Override"}
          </button>
        </form>
      </div>
    </div>
  );
}
