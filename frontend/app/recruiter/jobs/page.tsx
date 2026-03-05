"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listJobs } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import type { Job } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recruiterId = localStorage.getItem("recruiter_id") || undefined;
    listJobs(recruiterId)
      .then((data: any) => setJobs(data.jobs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
        <h1 className="font-heading font-bold text-5xl md:text-7xl uppercase tracking-tighter text-white">
          Jobs
        </h1>
        <Link href="/recruiter" className="mt-4 md:mt-0 btn-acid">
          + New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest mb-4">
            // No jobs found
          </div>
          <p className="text-zinc-500 text-sm">Create a job to get started.</p>
        </div>
      ) : (
        <div className="border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-[#0A0A0A]">
              <tr>
                <th className="text-left px-6 py-4 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Title</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Domain</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Seniority</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-4 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#0C0C0C] transition-colors group">
                  <td className="px-6 py-4">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="font-heading font-bold text-lg uppercase tracking-wide text-white group-hover:text-acid transition-colors"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs uppercase">
                    {job.parsed_domain || "—"}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs uppercase">
                    {job.parsed_seniority || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-mono text-xs">
                    {new Date(job.created_at).toLocaleDateString()}
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
