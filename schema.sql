-- Beat Claude — AI Hiring Companion
-- PostgreSQL Schema (Reference)
-- Use Alembic migrations for production: `alembic upgrade head`

CREATE TYPE userrole AS ENUM ('recruiter', 'candidate', 'admin');
CREATE TYPE questiontype AS ENUM ('mcq', 'short_answer', 'scenario', 'mini_case');
CREATE TYPE candidatestatus AS ENUM ('invited', 'in_progress', 'submitted', 'scored', 'expired');
CREATE TYPE recommendation AS ENUM ('advance', 'consider', 'reject');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role userrole NOT NULL,
    org_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    jd_text TEXT NOT NULL,
    parsed_role_title VARCHAR(255),
    parsed_seniority VARCHAR(100),
    parsed_domain VARCHAR(100),
    parsed_experience_range VARCHAR(50),
    parsed_hard_skills JSONB,
    parsed_soft_skills JSONB,
    parsed_responsibilities JSONB,
    parsed_evaluation_priority JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    version INTEGER NOT NULL DEFAULT 1,
    time_limit_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assessments_job ON assessments(job_id);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    order_index INTEGER NOT NULL,
    question_type questiontype NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_option_index INTEGER,
    ideal_answer TEXT NOT NULL,
    scoring_rubric_accuracy_weight FLOAT NOT NULL DEFAULT 0.4,
    scoring_rubric_depth_weight FLOAT NOT NULL DEFAULT 0.3,
    scoring_rubric_practical_weight FLOAT NOT NULL DEFAULT 0.2,
    scoring_rubric_communication_weight FLOAT NOT NULL DEFAULT 0.1,
    max_score FLOAT NOT NULL DEFAULT 100.0,
    skill_tags JSONB,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_questions_assessment ON questions(assessment_id);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    email VARCHAR(320) NOT NULL,
    name VARCHAR(255) NOT NULL,
    session_token VARCHAR(128) UNIQUE NOT NULL,
    status candidatestatus NOT NULL DEFAULT 'invited',
    ip_hash VARCHAR(128),
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    copy_paste_detected BOOLEAN NOT NULL DEFAULT FALSE,
    question_order VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_candidates_job ON candidates(job_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_token ON candidates(session_token);

CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    answer_text TEXT,
    selected_option_index INTEGER,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    score_accuracy FLOAT,
    score_depth FLOAT,
    score_practical FLOAT,
    score_communication FLOAT,
    weighted_score FLOAT,
    grading_reasoning TEXT,
    is_autosaved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_responses_candidate ON responses(candidate_id);
CREATE INDEX idx_responses_question ON responses(question_id);

CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID UNIQUE NOT NULL REFERENCES candidates(id),
    overall_score FLOAT NOT NULL,
    dimension_scores JSONB NOT NULL,
    recommendation recommendation NOT NULL,
    confidence FLOAT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]',
    weaknesses JSONB NOT NULL DEFAULT '[]',
    reasoning_text TEXT NOT NULL,
    scoring_version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scores_candidate ON scores(candidate_id);

CREATE TABLE overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    recruiter_id UUID NOT NULL REFERENCES users(id),
    original_recommendation recommendation NOT NULL,
    new_recommendation recommendation NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_overrides_candidate ON overrides(candidate_id);
CREATE INDEX idx_overrides_recruiter ON overrides(recruiter_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id VARCHAR(128) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    details JSONB,
    ip_address VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

CREATE TABLE prompt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_name VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    temperature FLOAT NOT NULL,
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prompt_logs_name ON prompt_logs(prompt_name);
