"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import type { Job, Assessment, Candidate, Question } from "@/lib/types";

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#080808] border border-white/5 hover:border-white/10 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <span className="text-[10px] font-mono font-bold text-zinc-600 mt-1 shrink-0">
          Q{index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={q.question_type} />
            <span className="text-[10px] font-mono text-zinc-600 uppercase">
              {q.difficulty}
            </span>
          </div>
          <p className={`text-sm text-zinc-300 ${expanded ? "" : "line-clamp-2"}`}>
            {q.question_text}
          </p>
        </div>
        <span className="text-zinc-600 shrink-0 mt-1 text-xs transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 ml-10 border-t border-white/5 pt-3 space-y-3">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{q.question_text}</p>
          {q.options && q.options.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Options</span>
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-zinc-400 pl-2">
                  <span className="font-mono font-bold text-zinc-600 shrink-0">{String.fromCharCode(65 + i)}.</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}
          {q.skill_tags && q.skill_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {q.skill_tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 border border-acid/20 text-acid text-[9px] font-mono uppercase">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [lastInvitedLink, setLastInvitedLink] = useState("");
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
    setLastInvitedLink("");
    try {
      const result = (await inviteCandidate({
        job_id: jobId,
        email: inviteEmail,
        name: inviteName,
      })) as Candidate;
      const testUrl = `${window.location.origin}/test/${result.session_token}`;
      setLastInvitedLink(testUrl);
      setInviteEmail("");
      setInviteName("");
      setSuccess(`Candidate invited! Share this test link with ${result.name}`);
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

  if (loading) return <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading...</div>;
  if (!job) return <div className="text-red-400 font-mono text-xs uppercase">Job not found</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <span>!!</span> {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <span className="text-acid">✓</span> {success}
        </div>
      )}

      {/* Job Header */}
      <div className="border-b border-white/10 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/recruiter/jobs" className="text-zinc-500 hover:text-white transition-colors font-mono text-xs uppercase">
            ← Jobs
          </Link>
          <div className="w-px h-4 bg-white/20" />
          <StatusBadge status={job.status} />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="font-heading font-bold text-4xl md:text-6xl uppercase tracking-tighter text-white mb-2">
              {job.title}
            </h1>
            <div className="flex gap-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">
              {job.parsed_domain && <span>{job.parsed_domain}</span>}
              {job.parsed_seniority && <span>{job.parsed_seniority}</span>}
            </div>
          </div>
          <div className="flex gap-3 mt-6 md:mt-0">
            {job.status === "draft" && (
              <button
                onClick={handleParse}
                disabled={!!actionLoading}
                className="btn-acid disabled:opacity-50"
              >
                {actionLoading === "parse" ? "Parsing..." : "Parse JD"}
              </button>
            )}
            {job.status === "parsed" && (
              <button
                onClick={handleGenerateAssessment}
                disabled={!!actionLoading}
                className="btn-acid disabled:opacity-50"
              >
                {actionLoading === "generate" ? "Generating..." : "Generate Assessment"}
              </button>
            )}
            {candidates.some((c) => c.status === "scored") && (
              <Link href={`/leaderboard/${jobId}`} className="btn-secondary">
                View Leaderboard
              </Link>
            )}
          </div>
        </div>

        {/* Parsed Skills */}
        {job.parsed_hard_skills && job.parsed_hard_skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Extracted Skills</div>
            <div className="flex flex-wrap gap-2">
              {job.parsed_hard_skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 border border-acid/30 text-acid text-[10px] font-mono font-bold uppercase tracking-widest"
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
        <div>
          <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-white mb-6">Assessment</h2>
          {assessments.map((assessment) => (
            <div key={assessment.id} className="card p-6">
              <div className="flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-6">
                <span>{assessment.total_questions} questions</span>
                <span className="text-acid">//</span>
                <span>{assessment.time_limit_minutes} min</span>
                <span className="text-acid">//</span>
                <StatusBadge status={assessment.status} />
              </div>
              <div className="space-y-2">
                {assessment.questions.map((q) => (
                  <QuestionCard key={q.id} q={q} index={q.order_index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Candidates */}
      {job.status === "assessment_generated" && (
        <div>
          <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-white mb-6">Invite Candidates</h2>
          <div className="card p-6">
            <form onSubmit={handleInvite} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="label">Name</label>
                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="input" required />
              </div>
              <div className="flex-1">
                <label className="label">Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input" required />
              </div>
              <button type="submit" disabled={!!actionLoading} className="btn-acid">
                {actionLoading === "invite" ? "Inviting..." : "Send Invite"}
              </button>
            </form>
            <p className="text-[10px] font-mono text-zinc-600 mt-3">
              Note: No email is sent automatically. After inviting, copy the test link from the candidates table below and share it manually.
            </p>
            {lastInvitedLink && (
              <div className="mt-4 p-4 bg-acid/5 border border-acid/20 flex items-center gap-3">
                <span className="text-acid text-[10px] font-mono font-bold uppercase shrink-0">Test Link:</span>
                <code className="text-xs font-mono text-zinc-300 truncate flex-1">{lastInvitedLink}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(lastInvitedLink);
                    setSuccess("Test link copied to clipboard!");
                    setTimeout(() => setSuccess(""), 2000);
                  }}
                  className="px-3 py-1 bg-acid text-black text-[10px] font-mono font-bold uppercase hover:bg-white transition-colors shrink-0"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidates List */}
      {candidates.length > 0 && (
        <div>
          <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-white mb-6">
            Candidates ({candidates.length})
          </h2>
          <div className="border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-[#0A0A0A]">
                <tr>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</th>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Test Link</th>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-[#0C0C0C] transition-colors">
                    <td className="px-6 py-3 font-heading font-bold uppercase text-white">{c.name}</td>
                    <td className="px-6 py-3 text-zinc-500 font-mono text-xs">{c.email}</td>
                    <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] bg-black border border-white/10 text-zinc-500 px-2 py-1 font-mono truncate max-w-[180px]">
                          {typeof window !== "undefined" ? `${window.location.origin}/test/${c.session_token}` : `/test/${c.session_token}`}
                        </code>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/test/${c.session_token}`;
                            navigator.clipboard.writeText(url);
                            setSuccess("Test link copied!");
                            setTimeout(() => setSuccess(""), 2000);
                          }}
                          className="px-2 py-1 border border-white/10 text-zinc-500 text-[10px] font-mono uppercase hover:text-acid hover:border-acid/30 transition-colors shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {c.status === "submitted" && (
                        <button
                          onClick={() => handleScore(c.id)}
                          disabled={!!actionLoading}
                          className="px-3 py-1 bg-acid text-black text-[10px] font-mono font-bold uppercase hover:bg-white transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `score-${c.id}` ? "Scoring..." : "Score"}
                        </button>
                      )}
                      {c.status === "scored" && (
                        <Link
                          href={`/recruiter/jobs/${jobId}/candidates/${c.id}`}
                          className="px-3 py-1 border border-acid/30 text-acid text-[10px] font-mono font-bold uppercase hover:bg-acid hover:text-black transition-colors"
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
        </div>
      )}
    </div>
  );
}
