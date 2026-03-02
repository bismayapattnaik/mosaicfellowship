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
      const user = (await createUser({
        email,
        name,
        role: "recruiter",
      })) as any;
      setRecruiterId(user.id);
      setStep("create");
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        setError(
          "User already exists. Enter your recruiter ID directly or use a different email."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!recruiterId) {
      setError("Recruiter ID is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const job = (await createJob({
        title: jobTitle,
        jd_text: jdText,
        recruiter_id: recruiterId,
      })) as any;
      router.push(`/recruiter/jobs/${job.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Recruiter Dashboard</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {step === "setup" && (
        <div className="max-w-lg">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Create Account"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or enter existing Recruiter ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recruiterId}
                onChange={(e) => setRecruiterId(e.target.value)}
                placeholder="UUID"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <button
                onClick={() => recruiterId && setStep("create")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "create" && (
        <div className="max-w-2xl">
          <p className="text-sm text-gray-500 mb-6">
            Recruiter ID: <code className="bg-gray-100 px-2 py-0.5 rounded">{recruiterId}</code>
          </p>
          <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Financial Analyst"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={12}
                placeholder="Paste the full job description here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
                minLength={50}
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum 50 characters required
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
