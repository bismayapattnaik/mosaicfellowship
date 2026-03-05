"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getJob,
  parseJob,
  generateAssessment,
  listAssessmentsForJob,
  inviteCandidate,
  listCandidatesForJob,
  scoreCandidate,
} from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import type { Job, Assessment, Candidate } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      const [jobData, assessmentData, candidateData] = await Promise.all([
        getJob(jobId) as Promise<Job>,
        listAssessmentsForJob(jobId) as Promise<Assessment[]>,
        listCandidatesForJob(jobId) as Promise<Candidate[]>,
      ]);
      setJob(jobData);
      setAssessments(assessmentData);
      setCandidates(candidateData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [jobId]);

  async function handleParse() {
    setActionLoading("parse");
    setError("");
    try {
      await parseJob(jobId);
      setSuccess("JD parsed successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleGenerateAssessment() {
    setActionLoading("generate");
    setError("");
    try {
      await generateAssessment(jobId);
      setSuccess("Assessment generated!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("invite");
    setError("");
    try {
      await inviteCandidate({
        job_id: jobId,
        email: inviteEmail,
        name: inviteName,
      });
      setInviteEmail("");
      setInviteName("");
      setSuccess("Candidate invited!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleScore(candidateId: string) {
    setActionLoading(`score-${candidateId}`);
    setError("");
    try {
      await scoreCandidate(candidateId);
      setSuccess("Candidate scored!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  if (loading) return <p className="text-white/40">Loading...</p>;
  if (!job) return <p className="text-red-400">Job not found</p>;

  return (
    <div className="space-y-8">
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

      {/* Job Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <div className="flex gap-3 mt-2">
              <StatusBadge status={job.status} />
              {job.parsed_domain && (
                <span className="text-sm text-white/40">
                  {job.parsed_domain}
                </span>
              )}
              {job.parsed_seniority && (
                <span className="text-sm text-white/40">
                  {job.parsed_seniority}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {job.status === "draft" && (
              <button
                onClick={handleParse}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "parse" ? "Parsing..." : "Parse JD"}
              </button>
            )}
            {job.status === "parsed" && (
              <button
                onClick={handleGenerateAssessment}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
              >
                {actionLoading === "generate"
                  ? "Generating..."
                  : "Generate Assessment"}
              </button>
            )}
            {candidates.some((c) => c.status === "scored") && (
              <Link
                href={`/leaderboard/${jobId}`}
                className="px-4 py-2 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-xl text-sm font-medium hover:bg-brand-500/30 transition-colors"
              >
                View Leaderboard
              </Link>
            )}
          </div>
        </div>

        {/* Parsed Skills */}
        {job.parsed_hard_skills && job.parsed_hard_skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.08]">
            <h3 className="text-sm font-medium text-white/50 mb-2">
              Extracted Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.parsed_hard_skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-brand-500/15 text-brand-300 rounded-lg text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assessment Section */}
      {assessments.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Assessment</h2>
          {assessments.map((assessment) => (
            <div key={assessment.id}>
              <div className="flex gap-4 text-sm text-white/40 mb-4">
                <span>{assessment.total_questions} questions</span>
                <span>{assessment.time_limit_minutes} min time limit</span>
                <StatusBadge status={assessment.status} />
              </div>
              <div className="space-y-2">
                {assessment.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white/[0.04] rounded-xl flex items-start gap-3 border border-white/[0.06]"
                  >
                    <span className="text-xs font-medium text-white/30 mt-0.5 shrink-0">
                      Q{q.order_index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={q.question_type} />
                        <span className="text-xs text-white/30">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">{q.question_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Candidates */}
      {job.status === "assessment_generated" && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Invite Candidates</h2>
          <form onSubmit={handleInvite} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="label">
                Name
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div className="flex-1">
              <label className="label">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!!actionLoading}
              className="btn-primary text-sm"
            >
              {actionLoading === "invite" ? "Inviting..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}

      {/* Candidates List */}
      {candidates.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Candidates ({candidates.length})
          </h2>
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.08]">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-white/40">
                  Name
                </th>
                <th className="text-left px-3 py-2 font-medium text-white/40">
                  Email
                </th>
                <th className="text-left px-3 py-2 font-medium text-white/40">
                  Status
                </th>
                <th className="text-left px-3 py-2 font-medium text-white/40">
                  Test Link
                </th>
                <th className="text-left px-3 py-2 font-medium text-white/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-3 py-2 font-medium text-white">{c.name}</td>
                  <td className="px-3 py-2 text-white/50">{c.email}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-3 py-2">
                    <code className="text-xs bg-white/[0.06] text-white/50 px-2 py-1 rounded-lg select-all border border-white/[0.08]">
                      /candidate?token={c.session_token.substring(0, 12)}...
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    {c.status === "submitted" && (
                      <button
                        onClick={() => handleScore(c.id)}
                        disabled={!!actionLoading}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === `score-${c.id}`
                          ? "Scoring..."
                          : "Score"}
                      </button>
                    )}
                    {c.status === "scored" && (
                      <Link
                        href={`/recruiter/jobs/${jobId}/candidates/${c.id}`}
                        className="px-3 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-medium hover:bg-brand-500/30 transition-colors"
                      >
                        View Report
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
