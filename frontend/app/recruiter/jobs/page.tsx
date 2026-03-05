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
    listJobs()
      .then((data: any) => setJobs(data.jobs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-white/40">Loading jobs...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <Link
          href="/recruiter"
          className="btn-primary text-sm"
        >
          + New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="text-white/40">No jobs yet. Create one to get started.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.08]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white/40">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-white/40">
                  Domain
                </th>
                <th className="text-left px-4 py-3 font-medium text-white/40">
                  Seniority
                </th>
                <th className="text-left px-4 py-3 font-medium text-white/40">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-white/40">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {job.parsed_domain || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {job.parsed_seniority || "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-white/30">
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
