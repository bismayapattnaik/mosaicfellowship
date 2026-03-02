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
    return <p className="text-gray-500">Loading jobs...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <Link
          href="/recruiter"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          + New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs yet. Create one to get started.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Domain
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Seniority
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="text-brand-600 hover:underline font-medium"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {job.parsed_domain || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {job.parsed_seniority || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
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
