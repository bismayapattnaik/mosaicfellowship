"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob, createUser } from "@/lib/api";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "create">("setup");
  const [recruiterId, setRecruiterId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = (await createUser({ email, name, role: "recruiter" })) as any;
      setRecruiterId(user.id);
      setStep("create");
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        setError("Email already registered. Enter your Recruiter ID below to continue.");
      } else {
        setError(err.message);
      }
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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Recruiter Dashboard</h1>
        <p className="text-white/40 mt-1">Create jobs and manage your hiring pipeline</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" /></svg>
          <span>{error}</span>
        </div>
      )}

      {step === "setup" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-8">
            <h2 className="text-lg font-semibold text-white mb-1">New here?</h2>
            <p className="text-sm text-white/40 mb-6">Create your recruiter account to get started</p>
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Alex Johnson" required />
              </div>
              <div>
                <label className="label">Work Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="alex@company.com" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>

          <div className="card p-8">
            <h2 className="text-lg font-semibold text-white mb-1">Returning user?</h2>
            <p className="text-sm text-white/40 mb-6">Enter your Recruiter ID to continue</p>
            <div className="space-y-4">
              <div>
                <label className="label">Recruiter ID</label>
                <input type="text" value={recruiterId} onChange={(e) => setRecruiterId(e.target.value)} className="input font-mono" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              </div>
              <button onClick={() => recruiterId && setStep("create")} disabled={!recruiterId} className="btn-secondary w-full">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "create" && (
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6 p-3 bg-brand-500/10 rounded-xl border border-brand-500/20">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <span className="text-sm font-medium text-brand-300">Signed in as </span>
              <code className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-mono">{recruiterId.substring(0, 8)}...</code>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-lg font-semibold text-white mb-1">Create New Job</h2>
            <p className="text-sm text-white/40 mb-6">Paste a job description and we will generate a tailored assessment</p>
            <form onSubmit={handleCreateJob} className="space-y-5">
              <div>
                <label className="label">Job Title</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="input" placeholder="e.g. Senior Financial Analyst" required />
              </div>
              <div>
                <label className="label">Job Description</label>
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={14} className="input resize-y" placeholder="Paste the full job description here. Include responsibilities, requirements, qualifications..." required minLength={50} />
                <p className="text-xs text-white/30 mt-1.5">Minimum 50 characters. The more detail you provide, the better the assessment.</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating..." : "Create Job & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
