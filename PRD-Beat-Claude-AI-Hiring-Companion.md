# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Product Name: Beat Claude — AI Hiring Companion

---

## 1. Executive Summary

Beat Claude is an AI-native hiring system that:

- Converts any Job Description (JD) into a tailored assessment in under 60 seconds
- Administers the test via a clean candidate interface
- Scores responses deterministically and consistently
- Ranks candidates via leaderboard
- Recommends who moves forward
- Requires zero manual screening effort

The product replaces the recruiter's initial screening process with an AI-driven, scalable, unbiased evaluation engine.

---

## 2. Problem Statement

### Current Hiring Pain Points

1. Resume screening is noisy and biased
2. Recruiters spend 5–15 hours per role screening candidates
3. Screening calls are inconsistent
4. Evaluations are subjective
5. Hard skills are rarely validated properly
6. Scaling beyond 200 applicants becomes chaotic

### Core Problem

There is no structured, consistent, scalable system that:

- Validates real skills
- Works across roles
- Eliminates manual screening

---

## 3. Product Vision

> An AI hiring analyst that outperforms manual screening and scales infinitely.

Beat Claude becomes:

- The first screening layer for every job
- Role-adaptive
- Deterministic in scoring
- Explainable in reasoning

---

## 4. Target Users

### Primary Persona 1: Startup Founder

- Hiring 5–20 roles/year
- No HR team
- Needs quick screening
- Time-poor

### Primary Persona 2: Recruiter

- Handles 100–500 candidates per role
- Needs structured shortlisting
- Needs defensible evaluation

### Secondary Persona: Fellowship / Accelerator

- 1000+ applicants
- Needs automated scoring
- Needs leaderboard ranking

---

## 5. Product Scope

### In Scope (MVP)

- JD parsing
- Assessment generation
- Candidate test interface
- AI scoring
- Leaderboard ranking
- Recruiter override system

### Out of Scope (MVP)

- Resume parsing
- Video interview analysis
- ATS integrations
- Behavioral interviews
- Background checks

---

## 6. User Journey

### Recruiter Journey

1. Login
2. Paste JD
3. Generate assessment
4. Preview & edit (optional)
5. Send invite link
6. Monitor candidates
7. View leaderboard
8. Override AI decision if needed

### Candidate Journey

1. Receive invite link
2. Email verification
3. Read instructions
4. Take test
5. Submit
6. Confirmation page

---

## 7. Functional Requirements

### 7.1 JD Parser Engine

#### Objective

Extract structured role metadata from free-text JD.

#### Input

Raw text JD

#### Output (Structured JSON)

```json
{
  "role_title": "Financial Analyst",
  "seniority": "Entry-Level",
  "domain": "Finance",
  "experience_range": "0-2 years",
  "hard_skills": ["Excel", "Financial Modeling", "DCF"],
  "soft_skills": ["Attention to detail"],
  "responsibilities": [],
  "evaluation_priority": []
}
```

#### Requirements

- Detect:
  - Role title
  - Seniority
  - Domain
  - Core hard skills
  - Soft skills
  - Years of experience
- Must work across:
  - Marketing
  - Finance
  - Engineering
  - HR
  - Operations

#### Constraints

- Response time: <= 20 seconds
- Deterministic output
- JSON schema validation required

---

### 7.2 Assessment Generator

#### Objective

Generate role-specific, seniority-aligned test.

#### Question Mix

| Type             | %   |
| ---------------- | --- |
| MCQ              | 30% |
| Short Answer     | 25% |
| Scenario-Based   | 30% |
| Mini Case / Task | 15% |

#### Requirements

- 12–20 questions
- Adaptive difficulty
- Role-specific
- Include answer key
- Include scoring rubric
- Include scoring dimensions

#### Example (Performance Marketer)

MCQ:

> What does ROAS stand for?

Scenario:

> CPA doubled in last 2 weeks. List 3 hypotheses and validation steps.

Mini Task:

> Analyze campaign table and suggest budget shift.

#### Output Format

Each question must include:

```json
{
  "question_id": 1,
  "type": "scenario",
  "question_text": "...",
  "ideal_answer": "...",
  "scoring_rubric": {
    "accuracy": 0.4,
    "depth": 0.3,
    "practical_thinking": 0.3
  }
}
```

#### Performance Constraint

- Full generation <= 60 seconds

---

### 7.3 Candidate Test Engine

#### Requirements

- Unique candidate session
- Timer (role-based)
- Progress tracker
- Autosave every 10 seconds
- Randomized question order
- Copy-paste detection
- One session per candidate
- Submission lock

#### Non-Functional

- Mobile responsive
- 99% uptime
- Page load < 2 seconds

---

### 7.4 AI Scoring Engine

This is the core differentiator.

#### Layer 1: Deterministic Scoring

- MCQs auto-graded
- Structured numeric answers validated

#### Layer 2: Rubric-Based LLM Scoring

Each answer evaluated on:

| Dimension           | Weight |
| -------------------- | ------ |
| Accuracy            | 40%    |
| Depth               | 30%    |
| Practical Reasoning | 20%    |
| Communication       | 10%    |

#### Determinism Requirements

- Temperature = 0
- Fixed grading template
- Same input -> same output
- Store explanation
- Score normalization across candidates

#### Output Example

```json
{
  "candidate_id": 202,
  "overall_score": 82,
  "dimension_scores": {
    "technical": 85,
    "analytical": 80,
    "strategic": 75
  },
  "recommendation": "Advance",
  "confidence": 0.91,
  "strengths": [],
  "weaknesses": []
}
```

---

### 7.5 Leaderboard

#### Features

- Rank by overall score
- Filter by recommendation
- Sort by confidence
- Export CSV
- Click candidate -> detailed report

#### Recommendation Categories

- Advance
- Consider
- Reject

---

### 7.6 Recruiter Override

#### Requirements

- Override recommendation
- Add reason
- Store correction
- Feed correction into learning loop

---

## 8. Non-Functional Requirements

| Requirement           | Target                 |
| --------------------- | ---------------------- |
| Assessment generation | < 60 sec               |
| Scoring latency       | < 10 sec per candidate |
| Concurrency           | 500 candidates         |
| Data encryption       | AES-256                |
| Scoring consistency   | 100% deterministic     |

---

## 9. Data Model

### Tables

#### Users

- user_id
- role (recruiter/candidate)
- email
- org_id

#### Jobs

- job_id
- recruiter_id
- jd_text
- parsed_output

#### Assessments

- assessment_id
- job_id
- questions_json

#### Candidates

- candidate_id
- job_id
- email
- status

#### Responses

- response_id
- candidate_id
- answers_json
- time_spent

#### Scores

- candidate_id
- overall_score
- dimension_scores
- recommendation
- reasoning_text

---

## 10. AI System Design

### LLM Orchestration

Pipeline:

```
JD -> Structured Parser -> Skill Extractor -> Assessment Generator -> Rubric Builder -> Candidate Response -> Scoring Engine -> Ranking Engine
```

### Prompt Layers

1. Role extraction prompt
2. Skill emphasis prompt
3. Assessment generation prompt
4. Rubric generation prompt
5. Scoring prompt

All prompts must:

- Be version controlled
- Logged
- Reproducible

---

## 11. Edge Cases

| Case              | Mitigation                  |
| ----------------- | --------------------------- |
| Vague JD          | Ask recruiter clarification |
| Too generic role  | Apply fallback template     |
| Hybrid role       | Multi-domain test           |
| Mass cheating     | Time anomaly detection      |
| LLM hallucination | Rubric validation check     |

---

## 12. Success Metrics

| Metric                            | Target   |
| --------------------------------- | -------- |
| Recruiter time saved              | 80%      |
| Agreement with human shortlisting | >= 85%   |
| Test completion rate              | >= 85%   |
| Average scoring variance          | 0%       |
| Time to shortlist                 | < 1 hour |

---

## 13. Risks & Mitigation

### Risk 1: Scoring bias

Mitigation:

- Structured rubric
- Explainable reasoning
- Override option

### Risk 2: LLM inconsistency

Mitigation:

- Temperature = 0
- Deterministic template
- Score normalization

### Risk 3: Cheating

Mitigation:

- Time analytics
- IP tracking
- Question randomization

---

## 14. Launch Plan

### Phase 1 (2 Weeks)

- JD parser
- Basic assessment generator
- Simple UI

### Phase 2 (2 Weeks)

- AI scoring engine
- Leaderboard
- Override feature

### Phase 3

- Performance optimization
- Scale testing (500 candidates)

---

## 15. Future Expansion

- Resume scoring
- AI video interview round
- Cultural fit evaluation
- ATS integration
- Behavioral analytics

---

## 16. Strategic Positioning

Beat Claude is not:

> An AI chatbot.

It is:

> An autonomous hiring analyst.
