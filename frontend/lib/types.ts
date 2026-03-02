export interface User {
  id: string;
  email: string;
  name: string;
  role: "recruiter" | "candidate" | "admin";
  org_name: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  jd_text: string;
  parsed_role_title: string | null;
  parsed_seniority: string | null;
  parsed_domain: string | null;
  parsed_experience_range: string | null;
  parsed_hard_skills: string[] | null;
  parsed_soft_skills: string[] | null;
  parsed_responsibilities: string[] | null;
  parsed_evaluation_priority: string[] | null;
  status: string;
  created_at: string;
}

export interface Question {
  id: string;
  order_index: number;
  question_type: "mcq" | "short_answer" | "scenario" | "mini_case";
  question_text: string;
  options: string[] | null;
  max_score: number;
  difficulty: string;
  skill_tags: string[] | null;
}

export interface Assessment {
  id: string;
  job_id: string;
  version: number;
  time_limit_minutes: number;
  total_questions: number;
  status: string;
  created_at: string;
  questions: Question[];
}

export interface Candidate {
  id: string;
  job_id: string;
  email: string;
  name: string;
  session_token: string;
  status: string;
  started_at: string | null;
  submitted_at: string | null;
  copy_paste_detected: boolean;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  order_index: number;
  question_type: string;
  question_text: string;
  options: string[] | null;
  max_score: number;
}

export interface CandidateTestView {
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  time_limit_minutes: number;
  questions: TestQuestion[];
  started_at: string | null;
}

export interface Score {
  id: string;
  candidate_id: string;
  overall_score: number;
  dimension_scores: {
    accuracy: number;
    depth: number;
    practical_reasoning: number;
    communication: number;
  };
  recommendation: string;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  reasoning_text: string;
  scoring_version: string;
  created_at: string;
}

export interface LeaderboardEntry {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  overall_score: number;
  dimension_scores: {
    accuracy: number;
    depth: number;
    practical_reasoning: number;
    communication: number;
  };
  recommendation: string;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  submitted_at: string | null;
  override_recommendation: string | null;
  time_spent_total: number;
}

export interface LeaderboardResponse {
  job_id: string;
  job_title: string;
  entries: LeaderboardEntry[];
  total: number;
}

export interface AnswerSubmission {
  question_id: string;
  answer_text: string | null;
  selected_option_index: number | null;
  time_spent_seconds: number;
}
