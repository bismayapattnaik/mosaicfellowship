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

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!job) return <p className="text-red-500">Job not found</p>;

  return (
    <div className="space-y-8">
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

      {/* Job Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex gap-3 mt-2">
              <StatusBadge status={job.status} />
              {job.parsed_domain && (
                <span className="text-sm text-gray-500">
                  {job.parsed_domain}
                </span>
              )}
              {job.parsed_seniority && (
                <span className="text-sm text-gray-500">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === "parse" ? "Parsing..." : "Parse JD"}
              </button>
            )}
            {job.status === "parsed" && (
              <button
                onClick={handleGenerateAssessment}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === "generate"
                  ? "Generating..."
                  : "Generate Assessment"}
              </button>
            )}
            {candidates.some((c) => c.status === "scored") && (
              <Link
                href={`/leaderboard/${jobId}`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                View Leaderboard
              </Link>
            )}
          </div>
        </div>

        {/* Parsed Skills */}
        {job.parsed_hard_skills && job.parsed_hard_skills.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Extracted Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.parsed_hard_skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-medium"
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
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Assessment</h2>
          {assessments.map((assessment) => (
            <div key={assessment.id}>
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <span>{assessment.total_questions} questions</span>
                <span>{assessment.time_limit_minutes} min time limit</span>
                <StatusBadge status={assessment.status} />
              </div>
              <div className="space-y-2">
                {assessment.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-start gap-3"
                  >
                    <span className="text-xs font-medium text-gray-400 mt-0.5 shrink-0">
                      Q{q.order_index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={q.question_type} />
                        <span className="text-xs text-gray-400">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm">{q.question_text}</p>
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
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Invite Candidates</h2>
          <form onSubmit={handleInvite} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!!actionLoading}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {actionLoading === "invite" ? "Inviting..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}

      {/* Candidates List */}
      {candidates.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Candidates ({candidates.length})
          </h2>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">
                  Test Link
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-gray-600">{c.email}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-3 py-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded select-all">
                      /candidate?token={c.session_token.substring(0, 12)}...
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    {c.status === "submitted" && (
                      <button
                        onClick={() => handleScore(c.id)}
                        disabled={!!actionLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === `score-${c.id}`
                          ? "Scoring..."
                          : "Score"}
                      </button>
                    )}
                    {c.status === "scored" && (
                      <Link
                        href={`/recruiter/jobs/${jobId}/candidates/${c.id}`}
                        className="px-3 py-1 bg-brand-600 text-white rounded text-xs font-medium hover:bg-brand-700"
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
