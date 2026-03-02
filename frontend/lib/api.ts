const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// Users
export async function createUser(data: {
  email: string;
  name: string;
  role: string;
  org_name?: string;
}) {
  return request("/users", { method: "POST", body: JSON.stringify(data) });
}

export async function getUser(userId: string) {
  return request(`/users/${userId}`);
}

// Jobs
export async function createJob(data: {
  title: string;
  jd_text: string;
  recruiter_id: string;
}) {
  return request("/jobs", { method: "POST", body: JSON.stringify(data) });
}

export async function listJobs(recruiterId?: string) {
  const params = recruiterId ? `?recruiter_id=${recruiterId}` : "";
  return request<{ jobs: any[]; total: number }>(`/jobs${params}`);
}

export async function getJob(jobId: string) {
  return request(`/jobs/${jobId}`);
}

export async function parseJob(jobId: string) {
  return request(`/jobs/${jobId}/parse`, { method: "POST" });
}

// Assessments
export async function generateAssessment(jobId: string) {
  return request("/assessments/generate", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });
}

export async function getAssessment(assessmentId: string) {
  return request(`/assessments/${assessmentId}`);
}

export async function listAssessmentsForJob(jobId: string) {
  return request(`/assessments/job/${jobId}`);
}

// Candidates
export async function inviteCandidate(data: {
  job_id: string;
  email: string;
  name: string;
}) {
  return request("/candidates/invite", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function startTest(sessionToken: string) {
  return request(`/candidates/start?session_token=${sessionToken}`, {
    method: "POST",
  });
}

export async function autosaveAnswers(data: {
  session_token: string;
  answers: any[];
}) {
  return request("/candidates/autosave", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitTest(data: {
  session_token: string;
  answers: any[];
  copy_paste_detected: boolean;
}) {
  return request("/candidates/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listCandidatesForJob(jobId: string) {
  return request(`/candidates/job/${jobId}`);
}

export async function getCandidateBySession(sessionToken: string) {
  return request(`/candidates/session/${sessionToken}`);
}

// Scoring
export async function scoreCandidate(candidateId: string) {
  return request(`/scoring/${candidateId}`, { method: "POST" });
}

export async function getScore(candidateId: string) {
  return request(`/scoring/${candidateId}`);
}

export async function getCandidateResponses(candidateId: string) {
  return request(`/scoring/${candidateId}/responses`);
}

// Leaderboard
export async function getLeaderboard(
  jobId: string,
  sortBy?: string,
  filterRecommendation?: string
) {
  const params = new URLSearchParams();
  if (sortBy) params.set("sort_by", sortBy);
  if (filterRecommendation)
    params.set("filter_recommendation", filterRecommendation);
  const qs = params.toString();
  return request(`/leaderboard/${jobId}${qs ? `?${qs}` : ""}`);
}

export async function exportLeaderboardCSV(jobId: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/leaderboard/${jobId}/export`);
  if (!res.ok) throw new Error("Failed to export CSV");
  return res.blob();
}

// Overrides
export async function createOverride(data: {
  candidate_id: string;
  recruiter_id: string;
  new_recommendation: string;
  reason: string;
}) {
  return request("/overrides", { method: "POST", body: JSON.stringify(data) });
}
