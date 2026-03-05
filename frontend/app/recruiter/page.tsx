"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createJob, createUser, loginUser, listJobs, getUserStats } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "create" | "dashboard">("auth");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [recruiterId, setRecruiterId] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ total_jobs: 0, total_candidates: 0, total_scored: 0 });

  useEffect(() => {
    const savedId = localStorage.getItem("recruiter_id");
    const savedName = localStorage.getItem("recruiter_name");
    if (savedId && savedName) {
      setRecruiterId(savedId);
      setRecruiterName(savedName);
      setStep("dashboard");
    }
  }, []);

  useEffect(() => {
    if (step === "dashboard" && recruiterId) {
      loadDashboardData();
    }
  }, [step, recruiterId]);

  async function loadDashboardData() {
    try {
      const [jobsData, statsData] = await Promise.all([
        listJobs(recruiterId) as Promise<{ jobs: Job[]; total: number }>,
        getUserStats(recruiterId),
      ]);
      setJobs(jobsData.jobs || []);
      setStats(statsData);
    } catch {
      // silently fail
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = (await createUser({ email, name, role: "recruiter" })) as any;
      setRecruiterId(user.id);
      setRecruiterName(user.name);
      localStorage.setItem("recruiter_id", user.id);
      localStorage.setItem("recruiter_name", user.name);
      setStep("dashboard");
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        setError("Email already registered. Switch to Login to continue.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = (await loginUser(email)) as any;
      setRecruiterId(user.id);
      setRecruiterName(user.name);
      localStorage.setItem("recruiter_id", user.id);
      localStorage.setItem("recruiter_name", user.name);
      setStep("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!recruiterId) { setError("Recruiter ID is required"); return; }
    setLoading(true);
    setError("");
    try {
      const job = (await createJob({ title: jobTitle, jd_text: jdText, recruiter_id: recruiterId })) as any;
      router.push(`/recruiter/jobs/${job.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("recruiter_id");
    localStorage.removeItem("recruiter_name");
    setRecruiterId("");
    setRecruiterName("");
    setStep("auth");
    setEmail("");
    setName("");
    setError("");
  }

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <span className="text-red-400 shrink-0 mt-0.5">!!</span>
          <span>{error}</span>
        </div>
      )}

      {/* AUTH STEP */}
      {step === "auth" && (
        <div className="max-w-4xl mx-auto pt-8">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
                Access Terminal
              </div>
            </div>
            <h1 className="font-heading font-bold text-5xl md:text-7xl uppercase tracking-tighter text-white mb-4">
              Recruiter<span className="text-acid">.</span>Hub
            </h1>
            <p className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
              Create jobs // Generate assessments // Score candidates
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex border border-white/10">
              <button
                onClick={() => { setAuthMode("signup"); setError(""); }}
                className={`px-8 py-3 font-heading font-bold text-sm uppercase tracking-wide transition-colors ${
                  authMode === "signup"
                    ? "bg-acid text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => { setAuthMode("login"); setError(""); }}
                className={`px-8 py-3 font-heading font-bold text-sm uppercase tracking-wide transition-colors ${
                  authMode === "login"
                    ? "bg-acid text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Login
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            {authMode === "signup" ? (
              <div className="card p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-acid rounded-full" />
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">New Account</span>
                </div>
                <form onSubmit={handleSignup} className="space-y-5">
                  <div>
                    <label className="label">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="ENTER NAME" required />
                  </div>
                  <div>
                    <label className="label">Work Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="ENTER EMAIL" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-acid w-full">
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Returning User</span>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="label">Work Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="ENTER EMAIL" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-acid w-full">
                    {loading ? "Authenticating..." : "Login"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD STEP */}
      {step === "dashboard" && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
                  Authenticated
                </div>
                <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                  ID: {recruiterId.substring(0, 8)}
                </div>
              </div>
              <h1 className="font-heading font-bold text-5xl md:text-7xl uppercase tracking-tighter text-white">
                Welcome<span className="text-acid">,</span> {recruiterName}
              </h1>
            </div>
            <div className="mt-6 md:mt-0 flex items-center gap-4">
              <button onClick={() => setStep("create")} className="btn-acid">
                + New Job
              </button>
              <button onClick={handleLogout} className="btn-secondary text-xs">
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 mb-12">
            <div className="bg-[#080808] p-8 group hover:bg-[#0C0C0C] transition-colors">
              <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">Total Jobs</div>
              <div className="font-heading font-bold text-5xl text-white group-hover:text-acid transition-colors">
                {String(stats.total_jobs).padStart(2, "0")}
              </div>
            </div>
            <div className="bg-[#080808] p-8 group hover:bg-[#0C0C0C] transition-colors">
              <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">Total Candidates</div>
              <div className="font-heading font-bold text-5xl text-white group-hover:text-acid transition-colors">
                {String(stats.total_candidates).padStart(2, "0")}
              </div>
            </div>
            <div className="bg-[#080808] p-8 group hover:bg-[#0C0C0C] transition-colors">
              <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-3">Scored</div>
              <div className="font-heading font-bold text-5xl text-white group-hover:text-acid transition-colors">
                {String(stats.total_scored).padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-3xl uppercase tracking-tight text-white">
                Your Jobs
              </h2>
              <Link
                href="/recruiter/jobs"
                className="text-xs font-mono text-zinc-500 uppercase tracking-widest hover:text-acid transition-colors"
              >
                View All →
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest mb-4">
                  // No jobs found
                </div>
                <p className="text-zinc-500 text-sm mb-6">
                  Create your first job to get started with assessments.
                </p>
                <button onClick={() => setStep("create")} className="btn-acid">
                  Create First Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.slice(0, 6).map((job) => (
                  <Link
                    key={job.id}
                    href={`/recruiter/jobs/${job.id}`}
                    className="card p-6 group hover:border-acid/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      <span className="text-acid">//</span>
                      <span>{job.status}</span>
                    </div>
                    <h3 className="font-heading font-bold text-2xl uppercase leading-none text-zinc-100 mb-3 group-hover:text-acid transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.parsed_domain && (
                        <span className="text-[10px] font-mono text-zinc-500 uppercase border border-zinc-800 px-2 py-0.5">
                          {job.parsed_domain}
                        </span>
                      )}
                      {job.parsed_seniority && (
                        <span className="text-[10px] font-mono text-zinc-500 uppercase border border-zinc-800 px-2 py-0.5">
                          {job.parsed_seniority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full p-3 border border-zinc-800 bg-black/20 group-hover:bg-acid group-hover:text-black group-hover:border-acid transition-all">
                      <span className="text-xs font-bold uppercase tracking-wider">Open</span>
                      <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE JOB STEP */}
      {step === "create" && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => setStep("dashboard")} className="text-zinc-500 hover:text-white transition-colors font-mono text-xs uppercase">
              ← Back
            </button>
            <div className="w-px h-4 bg-white/20" />
            <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
              New Job
            </div>
          </div>

          <h2 className="font-heading font-bold text-5xl uppercase tracking-tighter text-white mb-8">
            Create<span className="text-acid">.</span>Job
          </h2>

          <div className="card p-8">
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="label">Job Title</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="input" placeholder="E.G. SENIOR FINANCIAL ANALYST" required />
              </div>
              <div>
                <label className="label">Job Description</label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={14}
                  className="input resize-y"
                  placeholder="Paste the full job description here..."
                  required
                  minLength={50}
                />
                <p className="text-[10px] text-zinc-600 mt-2 font-mono uppercase tracking-wider">
                  // Minimum 50 characters. More detail = better assessment.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-acid w-full">
                {loading ? "Creating..." : "Create Job & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
