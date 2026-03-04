# BEAT CLAUDE — AI HIRING COMPANION
## Complete Implementation PRD for atoms.dev

**Product Name:** Beat Claude — AI Hiring Companion
**Date:** March 4, 2026
**Version:** 1.0
**Status:** Ready for Implementation
**Repository:** mosaicfellowship
**Branch:** `claude/create-prd-document-LKW9w`

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Architecture & Tech Stack](#3-architecture--tech-stack)
4. [Current Implementation Status](#4-current-implementation-status)
5. [Complete Feature Specifications](#5-complete-feature-specifications)
6. [User Journeys & Wireframe Descriptions](#6-user-journeys--wireframe-descriptions)
7. [Frontend Implementation Guide](#7-frontend-implementation-guide)
8. [Backend Implementation Guide](#8-backend-implementation-guide)
9. [Database Schema](#9-database-schema)
10. [API Specifications](#10-api-specifications)
11. [AI/LLM Pipeline](#11-aillm-pipeline)
12. [Design System & UI Specifications](#12-design-system--ui-specifications)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment Guide](#15-deployment-guide)
16. [Implementation Phases & Sprint Plan](#16-implementation-phases--sprint-plan)
17. [Atoms.dev Prompt](#17-atomsdev-prompt)

---

## 1. EXECUTIVE SUMMARY

Beat Claude is an **AI-native hiring system** that replaces manual candidate screening with automated, deterministic, AI-driven evaluation. A recruiter pastes a Job Description (JD), and the system:

1. **Parses** the JD into structured metadata (skills, seniority, domain)
2. **Generates** a tailored 12-20 question assessment in under 60 seconds
3. **Administers** the test via a clean, timed candidate interface
4. **Scores** responses using a two-layer AI scoring engine (deterministic MCQ + rubric-based LLM grading)
5. **Ranks** candidates on a live leaderboard with recommendations (Advance / Consider / Reject)
6. **Allows** recruiter overrides with logged reasoning

**Core Value Proposition:** Zero manual screening effort. 80% time savings. 100% deterministic scoring consistency.

---

## 2. PRODUCT OVERVIEW

### 2.1 Problem Statement

| Pain Point | Impact |
|---|---|
| Resume screening is noisy and biased | Qualified candidates missed |
| 5-15 hours per role screening | Recruiter burnout |
| Screening calls are inconsistent | Unfair evaluations |
| Hard skills rarely validated | Bad hires |
| Scaling beyond 200 applicants is chaotic | Lost candidates |

### 2.2 Target Users

| Persona | Description | Key Need |
|---|---|---|
| **Startup Founder** | Hiring 5-20 roles/year, no HR team | Quick, reliable screening |
| **Recruiter** | 100-500 candidates per role | Structured shortlisting |
| **Fellowship/Accelerator** | 1000+ applicants | Automated scoring + leaderboard |

### 2.3 Product Scope (MVP)

**In Scope:**
- JD parsing engine
- Assessment generation
- Candidate test interface (timed, autosave, copy-paste detection)
- AI scoring engine (MCQ auto-grade + LLM rubric scoring)
- Leaderboard with ranking, filtering, CSV export
- Recruiter override system
- Audit logging & prompt logging

**Out of Scope (MVP):**
- Resume parsing
- Video interview analysis
- ATS integrations
- Behavioral interviews
- Background checks

---

## 3. ARCHITECTURE & TECH STACK

### 3.1 System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Next.js 14     │────▶│   FastAPI         │────▶│  PostgreSQL 16  │
│   (Port 3000)    │     │   (Port 8000)     │     │  (Port 5432)   │
│   TypeScript     │     │   Python 3.12     │     │  SQLAlchemy    │
│   TailwindCSS    │     │   Pydantic        │     │  Alembic       │
└─────────────────┘     └───────┬──────────┘     └────────────────┘
                                │
                         ┌──────▼──────────┐
                         │   OpenAI API     │
                         │   (GPT-4o)       │
                         │   Temp=0         │
                         └─────────────────┘
```

### 3.2 Tech Stack Detail

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | Next.js (App Router) | 14 | SSR + Client Components |
| **Frontend** | TypeScript | 5.x | Type safety |
| **Frontend** | TailwindCSS | 3.x | Utility-first styling |
| **Backend** | FastAPI | Latest | Async API framework |
| **Backend** | Python | 3.12 | Backend language |
| **Backend** | Pydantic | v2 | Request/response validation |
| **Backend** | SQLAlchemy | 2.x | Async ORM |
| **Database** | PostgreSQL | 16-alpine | Primary data store |
| **Migrations** | Alembic | Latest | Schema migrations |
| **AI** | OpenAI API (GPT-4o) | Latest | LLM for parsing, generating, scoring |
| **Deploy** | Docker + docker-compose | 3.9 | Containerization |

### 3.3 Project Structure

```
mosaicfellowship/
├── backend/
│   ├── app/
│   │   ├── api/                    # FastAPI route handlers
│   │   │   ├── users.py           # User CRUD endpoints
│   │   │   ├── jobs.py            # Job creation + JD parsing
│   │   │   ├── assessments.py     # Assessment generation
│   │   │   ├── candidates.py      # Candidate invite, start, autosave, submit
│   │   │   ├── scoring.py         # Score candidate, get scores
│   │   │   ├── leaderboard.py     # Leaderboard + CSV export
│   │   │   └── overrides.py       # Recruiter overrides
│   │   ├── core/
│   │   │   ├── config.py          # Settings (env vars)
│   │   │   └── security.py        # Security utilities
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── session.py         # Database session + Base
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── user.py            # User model (recruiter/candidate/admin)
│   │   │   ├── job.py             # Job + parsed metadata
│   │   │   ├── assessment.py      # Assessment config
│   │   │   ├── question.py        # Individual questions + rubrics
│   │   │   ├── candidate.py       # Candidate sessions
│   │   │   ├── response.py        # Answer submissions + scores
│   │   │   ├── score.py           # Aggregated scores + recommendations
│   │   │   ├── override.py        # Recruiter overrides
│   │   │   ├── audit_log.py       # Audit trail
│   │   │   └── prompt_log.py      # LLM call logging
│   │   ├── prompts/
│   │   │   └── registry.py        # Version-controlled prompt templates
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   │   ├── user.py
│   │   │   ├── job.py
│   │   │   ├── assessment.py
│   │   │   ├── candidate.py
│   │   │   └── score.py
│   │   ├── services/              # Business logic layer
│   │   │   ├── llm_client.py      # OpenAI API wrapper
│   │   │   ├── jd_parser.py       # JD → structured metadata
│   │   │   ├── assessment_generator.py  # Metadata → questions
│   │   │   ├── scoring_engine.py  # Answer → scores
│   │   │   ├── candidate_service.py     # Candidate session management
│   │   │   ├── leaderboard_service.py   # Leaderboard queries
│   │   │   └── override_service.py      # Override logic
│   │   └── main.py               # FastAPI app entry point
│   ├── alembic/                   # Database migrations
│   ├── seed.py                    # Sample data seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (Inter font, metadata)
│   │   ├── page.tsx               # Landing/hero page
│   │   ├── globals.css            # Global styles + component classes
│   │   ├── recruiter/
│   │   │   ├── layout.tsx         # Recruiter layout (with Navbar)
│   │   │   ├── page.tsx           # Dashboard (create account / create job)
│   │   │   └── jobs/
│   │   │       ├── page.tsx       # Jobs list
│   │   │       └── [jobId]/
│   │   │           ├── page.tsx   # Job detail (parse, generate, invite)
│   │   │           └── candidates/
│   │   │               └── [candidateId]/
│   │   │                   └── page.tsx  # Candidate detail report
│   │   ├── candidate/
│   │   │   └── page.tsx           # Candidate test interface
│   │   └── leaderboard/
│   │       ├── page.tsx           # Leaderboard index
│   │       └── [jobId]/
│   │           └── page.tsx       # Job-specific leaderboard
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── StatusBadge.tsx        # Recommendation badges
│   │   └── ScoreBar.tsx           # Score visualization bars
│   ├── lib/
│   │   ├── api.ts                 # API client (fetch wrapper)
│   │   └── types.ts               # TypeScript interfaces
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── PRD-Beat-Claude-AI-Hiring-Companion.md
```

---

## 4. CURRENT IMPLEMENTATION STATUS

### 4.1 What's Built (Backend - Fully Implemented)

| Component | Status | Files |
|---|---|---|
| FastAPI app with CORS | Done | `app/main.py` |
| User CRUD (recruiter/candidate/admin) | Done | `app/api/users.py`, `app/models/user.py` |
| Job creation + JD parsing via LLM | Done | `app/api/jobs.py`, `app/services/jd_parser.py` |
| Assessment generation via LLM | Done | `app/api/assessments.py`, `app/services/assessment_generator.py` |
| Candidate invite, start, autosave, submit | Done | `app/api/candidates.py`, `app/services/candidate_service.py` |
| Two-layer scoring engine (MCQ + LLM) | Done | `app/api/scoring.py`, `app/services/scoring_engine.py` |
| Leaderboard with sort/filter/CSV export | Done | `app/api/leaderboard.py`, `app/services/leaderboard_service.py` |
| Recruiter override system | Done | `app/api/overrides.py`, `app/services/override_service.py` |
| Prompt registry (4 versioned prompts) | Done | `app/prompts/registry.py` |
| LLM client wrapper | Done | `app/services/llm_client.py` |
| All 10 database models | Done | `app/models/*.py` |
| All Pydantic schemas | Done | `app/schemas/*.py` |
| Docker + docker-compose | Done | `Dockerfile`, `docker-compose.yml` |
| Database migrations (Alembic) | Done | `alembic/` |
| Seed data script | Done | `seed.py` |

### 4.2 What's Built (Frontend - Partially Implemented)

| Page/Component | Status | Notes |
|---|---|---|
| Landing page (`/`) | Done | Hero + feature grid |
| Recruiter dashboard (`/recruiter`) | Done | Account creation + job creation form |
| Recruiter layout + Navbar | Done | Sticky nav with brand styling |
| Jobs list (`/recruiter/jobs`) | Done | Lists recruiter's jobs |
| Job detail (`/recruiter/jobs/[jobId]`) | Done | Parse JD, generate assessment, invite candidates |
| Candidate detail (`/recruiter/jobs/[jobId]/candidates/[candidateId]`) | Done | Full scoring report |
| Candidate test interface (`/candidate`) | Done | Token entry, instructions, timed test, submit |
| Leaderboard (`/leaderboard/[jobId]`) | Done | Table + detail panel + CSV export |
| StatusBadge component | Done | Color-coded recommendation badges |
| ScoreBar component | Done | Horizontal score visualization |
| Navbar component | Done | Responsive nav with active states |
| API client (`lib/api.ts`) | Done | Full API coverage |
| TypeScript types (`lib/types.ts`) | Done | All interfaces defined |
| TailwindCSS design system | Done | Brand colors, component classes |

### 4.3 What Needs Polish / Enhancement

| Area | What's Needed | Priority |
|---|---|---|
| **Authentication** | Currently ID-based, needs proper auth (JWT/session) | P1 |
| **Error handling** | Better error states, loading skeletons, empty states | P1 |
| **Responsive design** | Mobile optimization for all pages | P1 |
| **Real-time updates** | WebSocket for live leaderboard updates | P2 |
| **Onboarding flow** | Guided first-time experience for recruiters | P2 |
| **Email notifications** | Candidate invite emails, completion notifications | P2 |
| **Analytics dashboard** | Aggregate stats for recruiter (completion rates, avg scores) | P3 |
| **Dark mode** | Theme toggle support | P3 |

---

## 5. COMPLETE FEATURE SPECIFICATIONS

### 5.1 Feature: JD Parser Engine

**User Story:** As a recruiter, I paste a job description and the system extracts structured metadata so I can generate a tailored assessment.

**Input:** Raw text job description (minimum 50 characters)

**Output:** Structured JSON:
```json
{
  "role_title": "Financial Analyst",
  "seniority": "Entry-Level",
  "domain": "Finance",
  "experience_range": "0-2 years",
  "hard_skills": ["Excel", "Financial Modeling", "DCF"],
  "soft_skills": ["Attention to detail"],
  "responsibilities": ["Build financial models", "Analyze data"],
  "evaluation_priority": ["Financial Modeling", "Excel", "DCF"]
}
```

**Validation Rules:**
- Seniority must be one of: Intern, Entry-Level, Mid-Level, Senior, Lead, Manager, Director, VP, C-Level
- Domain must be one of: Engineering, Finance, Marketing, HR, Operations, Design, Sales, Data, Product, Legal, General
- `hard_skills` must be a non-empty array
- All fields required; defaults applied for invalid values

**Performance:** Response time <= 20 seconds

**API Endpoint:** `POST /api/v1/jobs/{id}/parse`

---

### 5.2 Feature: Assessment Generator

**User Story:** As a recruiter, after my JD is parsed, I generate a tailored assessment that tests the exact skills my role requires.

**Question Distribution:**

| Type | Percentage | Count (of 15) | Description |
|---|---|---|---|
| MCQ | 30% | ~5 | 4 options, 1 correct |
| Short Answer | 25% | ~4 | Concise analytical responses |
| Scenario-Based | 30% | ~4 | Realistic work situations |
| Mini Case/Task | 15% | ~2 | Practical exercises |

**Question Schema:**
```json
{
  "question_id": 1,
  "type": "scenario",
  "question_text": "CPA has doubled in last 2 weeks. List 3 hypotheses and validation steps.",
  "options": null,
  "correct_option_index": null,
  "ideal_answer": "Detailed ideal answer for grading...",
  "scoring_rubric": {
    "accuracy": 0.4,
    "depth": 0.3,
    "practical_thinking": 0.2,
    "communication": 0.1
  },
  "skill_tags": ["Performance Marketing", "Analytical Thinking"],
  "difficulty": "hard"
}
```

**Seniority-based Time Limits:**

| Seniority | Time (minutes) |
|---|---|
| Intern | 30 |
| Entry-Level | 45 |
| Mid-Level | 60 |
| Senior | 75 |
| Lead+ | 90 |

**Performance:** Full generation <= 60 seconds

**API Endpoint:** `POST /api/v1/assessments/generate`

---

### 5.3 Feature: Candidate Test Engine

**User Story:** As a candidate, I receive an invite link, take a timed assessment with auto-save, and submit my answers.

**Requirements:**
- Unique session token per candidate
- Timer based on role seniority (auto-submit on expiry)
- Progress tracker showing answered/total
- Autosave every 10 seconds
- Question-by-question navigation (prev/next + number grid)
- Copy-paste detection (monitored, not blocked)
- One session per candidate (no retakes)
- Submission lock after submit

**UI States:**
1. **Token Entry** — Enter session token or arrive via invite link
2. **Instructions** — 5 rules displayed before beginning
3. **Test Interface** — Header (job title, timer, progress), question card, MCQ options or textarea, navigation
4. **Submitted** — Confirmation with checkmark

**API Endpoints:**
- `POST /api/v1/candidates/invite` — Send invite
- `POST /api/v1/candidates/invite/bulk` — Bulk invite
- `POST /api/v1/candidates/start` — Start session
- `POST /api/v1/candidates/autosave` — Save progress
- `POST /api/v1/candidates/submit` — Final submit
- `GET /api/v1/candidates/session/{token}` — Get candidate by session

---

### 5.4 Feature: AI Scoring Engine (Core Differentiator)

**User Story:** As a recruiter, after a candidate submits, I can trigger AI scoring that deterministically evaluates every answer.

**Layer 1: Deterministic MCQ Scoring**
- Auto-graded by comparing `selected_option_index` to `correct_option_index`
- Binary: 100 (correct) or 0 (incorrect)

**Layer 2: Rubric-Based LLM Scoring**
Each open-ended answer evaluated on 4 dimensions:

| Dimension | Weight | Description |
|---|---|---|
| Accuracy | 40% | Factual correctness and completeness |
| Depth | 30% | Thoroughness and detail of analysis |
| Practical Reasoning | 20% | Real-world applicability |
| Communication | 10% | Clarity and professionalism |

**Scoring Scale:**
| Range | Label | Description |
|---|---|---|
| 90-100 | Exceptional | Matches or exceeds ideal answer |
| 75-89 | Strong | Covers most key points |
| 60-74 | Adequate | Addresses question, misses elements |
| 40-59 | Below Average | Significant gaps |
| 20-39 | Poor | Fundamental misunderstanding |
| 0-19 | Non-responsive | Incorrect or empty |

**Aggregate Scoring:**
```json
{
  "overall_score": 82,
  "dimension_scores": {
    "accuracy": 85,
    "depth": 80,
    "practical_reasoning": 75,
    "communication": 90
  },
  "recommendation": "advance",
  "confidence": 0.91,
  "strengths": ["Strong analytical skills", "Clear communication"],
  "weaknesses": ["Could improve depth on scenario questions"],
  "summary": "Strong candidate with solid fundamentals..."
}
```

**Recommendation Thresholds:**
- **Advance:** overall_score >= 75 AND no dimension below 50
- **Consider:** overall_score >= 55 OR any dimension >= 80
- **Reject:** overall_score < 55 AND no dimension >= 80

**Determinism Requirements:**
- LLM Temperature = 0
- Fixed grading templates (version-controlled)
- Same input → same output guaranteed
- All LLM calls logged with full I/O

**API Endpoints:**
- `POST /api/v1/scoring/{candidate_id}` — Score candidate
- `GET /api/v1/scoring/{candidate_id}` — Get score
- `GET /api/v1/scoring/{candidate_id}/responses` — Get per-question scores

---

### 5.5 Feature: Leaderboard

**User Story:** As a recruiter, I view all scored candidates ranked by overall score, filter by recommendation, and export to CSV.

**Features:**
- Rank by overall score (default) or confidence
- Filter by recommendation (Advance / Consider / Reject)
- Click candidate → detailed side panel showing:
  - Overall score (large number)
  - Recommendation badge
  - 4 dimension score bars (Accuracy, Depth, Practical, Communication)
  - Strengths list
  - Weaknesses list
  - Link to full report
- Export CSV button
- Total candidates scored counter

**API Endpoints:**
- `GET /api/v1/leaderboard/{job_id}` — Get leaderboard (with sort_by, filter_recommendation params)
- `GET /api/v1/leaderboard/{job_id}/export` — Download CSV

---

### 5.6 Feature: Recruiter Override

**User Story:** As a recruiter, I can override the AI's recommendation for any candidate, with a required reason that's logged.

**Requirements:**
- Override recommendation (advance/consider/reject)
- Required reason text
- Logged with timestamp and recruiter ID
- Override visible on leaderboard as "(overridden)" badge
- Feed corrections into learning loop (future)

**API Endpoints:**
- `POST /api/v1/overrides` — Create override
- `GET /api/v1/overrides/candidate/{id}` — Get override history

---

## 6. USER JOURNEYS & WIREFRAME DESCRIPTIONS

### 6.1 Recruiter Journey

```
Step 1: LANDING PAGE (/)
┌──────────────────────────────────────────────┐
│  [BC Logo]  Beat Claude                       │
│                                               │
│     Screen smarter. Hire faster.              │
│     Paste a JD. Get assessment in 60s.        │
│                                               │
│  [Open Recruiter Dashboard]  [Take Assessment]│
│                                               │
│  ┌──────┐  ┌──────┐  ┌──────┐               │
│  │ JD   │  │ AI   │  │Leader│               │
│  │Parse │  │Score │  │board │               │
│  └──────┘  └──────┘  └──────┘               │
└──────────────────────────────────────────────┘

Step 2: RECRUITER DASHBOARD (/recruiter)
┌──────────────────────────────────────────────┐
│  [Navbar: Dashboard | Jobs]                   │
│                                               │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ New Here?        │  │ Returning User?  │   │
│  │ [Name]           │  │ [Recruiter ID]   │   │
│  │ [Email]          │  │ [Continue]       │   │
│  │ [Create Account] │  │                  │   │
│  └─────────────────┘  └──────────────────┘   │
│                                               │
│  (After login) CREATE NEW JOB:                │
│  ┌─────────────────────────────────┐          │
│  │ Job Title: [_______________]    │          │
│  │ Job Description:                │          │
│  │ [                              ]│          │
│  │ [                              ]│          │
│  │ [Create Job & Continue]         │          │
│  └─────────────────────────────────┘          │
└──────────────────────────────────────────────┘

Step 3: JOB DETAIL (/recruiter/jobs/[jobId])
┌──────────────────────────────────────────────┐
│  Job: Senior Financial Analyst                │
│  Status: draft → parsed → assessment_generated│
│                                               │
│  [Parse JD] → Shows extracted skills/domain   │
│  [Generate Assessment] → Shows question count │
│  [Invite Candidate] → Email + Name form       │
│                                               │
│  Candidates List:                             │
│  │ Name  │ Status   │ Score │ Action │        │
│  │ Alice │ scored   │ 82    │ [View] │        │
│  │ Bob   │ submitted│ -     │ [Score]│        │
└──────────────────────────────────────────────┘

Step 4: LEADERBOARD (/leaderboard/[jobId])
┌──────────────────────────────────────────────┐
│  Leaderboard - Senior Financial Analyst       │
│  [Sort: Score ▼] [Filter: All ▼] [Export CSV]│
│                                               │
│  ┌─────────────────────┐ ┌────────────────┐  │
│  │ #1 Alice  82 Advance│ │ Alice          │  │
│  │ #2 Charlie 71 Consider│ │ Score: 82     │  │
│  │ #3 Bob   45 Reject  │ │ [====] Accuracy│  │
│  │                     │ │ [===] Depth    │  │
│  │                     │ │ [==] Practical │  │
│  │                     │ │ [====] Comms   │  │
│  │                     │ │ + Strengths    │  │
│  │                     │ │ - Weaknesses   │  │
│  │                     │ │ [Full Report]  │  │
│  └─────────────────────┘ └────────────────┘  │
└──────────────────────────────────────────────┘
```

### 6.2 Candidate Journey

```
Step 1: TOKEN ENTRY (/candidate)
┌──────────────────────────────────────────────┐
│       Beat Claude Assessment                  │
│       Enter your session token               │
│       [________________________]              │
│       [Continue]                              │
└──────────────────────────────────────────────┘

Step 2: INSTRUCTIONS
┌──────────────────────────────────────────────┐
│       Assessment Instructions                 │
│       1. This is timed. Timer starts on Begin│
│       2. Auto-saved every 10 seconds         │
│       3. Navigate between questions freely   │
│       4. Cannot retake after submission      │
│       5. Copy-paste activity is monitored    │
│       [Begin Assessment]                      │
└──────────────────────────────────────────────┘

Step 3: TEST INTERFACE
┌──────────────────────────────────────────────┐
│  Financial Analyst | Alice | 12/15 | 45:23   │
│  [============================-----] 80%      │
│                                               │
│  [scenario] Question 8 of 15                  │
│  CPA has doubled in the last 2 weeks.         │
│  List 3 hypotheses and validation steps.      │
│                                               │
│  [                                          ] │
│  [                                          ] │
│                                               │
│  [Previous] [1][2][3]...[15] [Next]          │
└──────────────────────────────────────────────┘

Step 4: SUBMITTED
┌──────────────────────────────────────────────┐
│              ✓                                │
│       Assessment Submitted                    │
│       Your responses have been recorded       │
│       and will be evaluated shortly.          │
└──────────────────────────────────────────────┘
```

---

## 7. FRONTEND IMPLEMENTATION GUIDE

### 7.1 Pages & Routes

| Route | File | Type | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Server Component | Landing page with hero + features |
| `/recruiter` | `app/recruiter/page.tsx` | Client Component | Dashboard (auth + job creation) |
| `/recruiter/jobs` | `app/recruiter/jobs/page.tsx` | Client Component | Jobs list |
| `/recruiter/jobs/[jobId]` | `app/recruiter/jobs/[jobId]/page.tsx` | Client Component | Job detail (parse, generate, invite) |
| `/recruiter/jobs/[jobId]/candidates/[candidateId]` | Nested route | Client Component | Candidate scoring report |
| `/candidate` | `app/candidate/page.tsx` | Client Component | Test interface (4 phases) |
| `/leaderboard/[jobId]` | `app/leaderboard/[jobId]/page.tsx` | Client Component | Leaderboard table + detail |

### 7.2 Shared Components

**Navbar** (`components/Navbar.tsx`):
- Sticky top, white bg with backdrop blur
- Logo "BC" gradient badge + "Beat Claude" text
- Nav links: Dashboard, Jobs (with active state highlighting)

**StatusBadge** (`components/StatusBadge.tsx`):
- `advance` → Green badge
- `consider` → Yellow/amber badge
- `reject` → Red badge
- Also handles job statuses: `draft`, `parsed`, `submitted`, `scored`, `invited`

**ScoreBar** (`components/ScoreBar.tsx`):
- Horizontal bar showing label + score value
- Color gradient: red (0-40) → yellow (40-70) → green (70-100)
- Animated fill width

### 7.3 API Client (`lib/api.ts`)

All API calls go through a centralized `request<T>()` function:
- Base URL: `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"`
- Auto-sets `Content-Type: application/json`
- Throws error with `detail` message from API response
- 18 exported functions covering all endpoints

### 7.4 TypeScript Types (`lib/types.ts`)

All interfaces defined: `User`, `Job`, `Question`, `Assessment`, `Candidate`, `TestQuestion`, `CandidateTestView`, `Score`, `LeaderboardEntry`, `LeaderboardResponse`, `AnswerSubmission`

### 7.5 CSS Design System (`globals.css`)

Component classes defined via `@layer components`:
- `.card` — White rounded card with border + shadow
- `.btn-primary` — Indigo 600 button
- `.btn-secondary` — White bordered button
- `.btn-danger` — Red 600 button
- `.btn-success` — Emerald 600 button
- `.input` — Rounded input with focus ring
- `.label` — Form label styling
- `.animate-fade-in` — Fade-in animation

---

## 8. BACKEND IMPLEMENTATION GUIDE

### 8.1 API Layer (`app/api/`)

7 router modules, all prefixed with `/api/v1`:

| Router | Prefix | Endpoints |
|---|---|---|
| `users` | `/users` | POST create, GET by id, GET list |
| `jobs` | `/jobs` | POST create, GET list, GET by id, POST parse |
| `assessments` | `/assessments` | POST generate, GET by id, GET by job_id |
| `candidates` | `/candidates` | POST invite, POST bulk invite, POST start, POST autosave, POST submit, GET by job, GET by session |
| `scoring` | `/scoring` | POST score, GET score, GET responses |
| `leaderboard` | `/leaderboard` | GET leaderboard, GET export CSV |
| `overrides` | `/overrides` | POST create, GET by candidate |

### 8.2 Services Layer (`app/services/`)

**LLM Client** (`llm_client.py`):
- Wraps OpenAI API calls
- Temperature = 0 for determinism
- JSON response parsing
- Full I/O logged to `prompt_logs` table

**JD Parser** (`jd_parser.py`):
- Takes raw JD text → calls LLM → validates output → stores on Job model
- Validation: required fields, valid seniority, valid domain

**Assessment Generator** (`assessment_generator.py`):
- Takes parsed job metadata → calls LLM → validates 12-20 questions
- Validates question distribution, MCQ options, rubric weights sum to 1.0
- Creates Assessment + Question records

**Scoring Engine** (`scoring_engine.py`):
- MCQ: deterministic binary grading
- Open-ended: LLM rubric-based grading per dimension
- Aggregate: LLM produces overall score + recommendation
- Stores per-question scores on Response records, aggregate on Score record

### 8.3 Prompt Registry (`app/prompts/registry.py`)

4 versioned prompts:

| Prompt | Version | Purpose |
|---|---|---|
| `JD_PARSE_SYSTEM` | v1.0 | Extract structured metadata from JD text |
| `ASSESSMENT_GENERATE_SYSTEM` | v1.0 | Generate 12-20 role-specific questions |
| `SCORING_SYSTEM` | v1.0 | Grade individual answers on 4 dimensions |
| `AGGREGATE_SCORING_SYSTEM` | v1.0 | Produce overall score + recommendation |

All prompts enforce JSON-only output, no markdown.

---

## 9. DATABASE SCHEMA

### 9.1 Tables (10 total)

**users**
```sql
id          UUID PRIMARY KEY DEFAULT uuid_generate_v4()
email       VARCHAR(320) UNIQUE NOT NULL
name        VARCHAR(255) NOT NULL
role        ENUM('recruiter','candidate','admin') NOT NULL
org_name    VARCHAR(255) NULLABLE
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
```

**jobs**
```sql
id                          UUID PRIMARY KEY
recruiter_id                UUID REFERENCES users(id)
title                       VARCHAR(500) NOT NULL
jd_text                     TEXT NOT NULL
parsed_role_title           VARCHAR(255) NULLABLE
parsed_seniority            VARCHAR(50) NULLABLE
parsed_domain               VARCHAR(100) NULLABLE
parsed_experience_range     VARCHAR(50) NULLABLE
parsed_hard_skills          JSONB NULLABLE  -- string[]
parsed_soft_skills          JSONB NULLABLE  -- string[]
parsed_responsibilities     JSONB NULLABLE  -- string[]
parsed_evaluation_priority  JSONB NULLABLE  -- string[]
status                      VARCHAR(50) DEFAULT 'draft'
created_at                  TIMESTAMP DEFAULT NOW()
```

**assessments**
```sql
id                  UUID PRIMARY KEY
job_id              UUID REFERENCES jobs(id)
version             INTEGER DEFAULT 1
time_limit_minutes  INTEGER NOT NULL
total_questions     INTEGER NOT NULL
status              VARCHAR(50) DEFAULT 'active'
created_at          TIMESTAMP DEFAULT NOW()
```

**questions**
```sql
id                                  UUID PRIMARY KEY
assessment_id                       UUID REFERENCES assessments(id)
order_index                         INTEGER NOT NULL
question_type                       ENUM('mcq','short_answer','scenario','mini_case')
question_text                       TEXT NOT NULL
options                             JSONB NULLABLE  -- string[] for MCQ
correct_option_index                INTEGER NULLABLE  -- 0-3 for MCQ
ideal_answer                        TEXT NOT NULL
scoring_rubric_accuracy_weight      FLOAT NOT NULL
scoring_rubric_depth_weight         FLOAT NOT NULL
scoring_rubric_practical_weight     FLOAT NOT NULL
scoring_rubric_communication_weight FLOAT NOT NULL
max_score                           FLOAT DEFAULT 100.0
skill_tags                          JSONB NULLABLE  -- string[]
difficulty                          VARCHAR(20) DEFAULT 'medium'
```

**candidates**
```sql
id                  UUID PRIMARY KEY
job_id              UUID REFERENCES jobs(id)
email               VARCHAR(320) NOT NULL
name                VARCHAR(255) NOT NULL
session_token       VARCHAR(64) UNIQUE NOT NULL
status              ENUM('invited','started','submitted','scored')
started_at          TIMESTAMP NULLABLE
submitted_at        TIMESTAMP NULLABLE
copy_paste_detected BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP DEFAULT NOW()
```

**responses**
```sql
id                      UUID PRIMARY KEY
candidate_id            UUID REFERENCES candidates(id)
question_id             UUID REFERENCES questions(id)
answer_text             TEXT NULLABLE
selected_option_index   INTEGER NULLABLE
time_spent_seconds      INTEGER DEFAULT 0
score_accuracy          FLOAT NULLABLE
score_depth             FLOAT NULLABLE
score_practical         FLOAT NULLABLE
score_communication     FLOAT NULLABLE
weighted_score          FLOAT NULLABLE
grading_reasoning       TEXT NULLABLE
created_at              TIMESTAMP DEFAULT NOW()
```

**scores**
```sql
id                  UUID PRIMARY KEY
candidate_id        UUID REFERENCES candidates(id) UNIQUE
overall_score       FLOAT NOT NULL
dimension_scores    JSONB NOT NULL  -- {accuracy, depth, practical_reasoning, communication}
recommendation      ENUM('advance','consider','reject')
confidence          FLOAT NOT NULL  -- 0.0-1.0
strengths           JSONB NOT NULL  -- string[]
weaknesses          JSONB NOT NULL  -- string[]
reasoning_text      TEXT NOT NULL
scoring_version     VARCHAR(20) NOT NULL
created_at          TIMESTAMP DEFAULT NOW()
```

**overrides**
```sql
id                      UUID PRIMARY KEY
candidate_id            UUID REFERENCES candidates(id)
recruiter_id            UUID REFERENCES users(id)
previous_recommendation VARCHAR(20) NOT NULL
new_recommendation      VARCHAR(20) NOT NULL
reason                  TEXT NOT NULL
created_at              TIMESTAMP DEFAULT NOW()
```

**audit_logs**
```sql
id          UUID PRIMARY KEY
user_id     UUID NULLABLE
action      VARCHAR(100) NOT NULL
entity_type VARCHAR(50) NOT NULL
entity_id   UUID NOT NULL
details     JSONB NULLABLE
created_at  TIMESTAMP DEFAULT NOW()
```

**prompt_logs**
```sql
id              UUID PRIMARY KEY
prompt_name     VARCHAR(100) NOT NULL
prompt_version  VARCHAR(20) NOT NULL
system_prompt   TEXT NOT NULL
user_prompt     TEXT NOT NULL
response_text   TEXT NOT NULL
model           VARCHAR(50) NOT NULL
temperature     FLOAT NOT NULL
tokens_used     INTEGER NULLABLE
latency_ms      INTEGER NULLABLE
created_at      TIMESTAMP DEFAULT NOW()
```

---

## 10. API SPECIFICATIONS

### 10.1 Full Endpoint Reference

#### Users
```
POST   /api/v1/users                              Create user
GET    /api/v1/users/{id}                          Get user by ID
GET    /api/v1/users                               List all users
```

#### Jobs
```
POST   /api/v1/jobs                                Create job (title, jd_text, recruiter_id)
GET    /api/v1/jobs                                List jobs (?recruiter_id=)
GET    /api/v1/jobs/{id}                           Get job by ID
POST   /api/v1/jobs/{id}/parse                     Parse JD with AI
```

#### Assessments
```
POST   /api/v1/assessments/generate                Generate assessment (body: {job_id})
GET    /api/v1/assessments/{id}                    Get assessment + questions
GET    /api/v1/assessments/job/{job_id}            List assessments for job
```

#### Candidates
```
POST   /api/v1/candidates/invite                   Invite candidate (job_id, email, name)
POST   /api/v1/candidates/invite/bulk              Bulk invite candidates
POST   /api/v1/candidates/start?session_token=     Start test session
POST   /api/v1/candidates/autosave                 Autosave answers (session_token, answers[])
POST   /api/v1/candidates/submit                   Submit test (session_token, answers[], copy_paste_detected)
GET    /api/v1/candidates/job/{job_id}             List candidates for job
GET    /api/v1/candidates/session/{token}          Get candidate by session token
```

#### Scoring
```
POST   /api/v1/scoring/{candidate_id}              Score candidate
GET    /api/v1/scoring/{candidate_id}              Get aggregate score
GET    /api/v1/scoring/{candidate_id}/responses    Get per-question graded responses
```

#### Leaderboard
```
GET    /api/v1/leaderboard/{job_id}                Get leaderboard (?sort_by=&filter_recommendation=)
GET    /api/v1/leaderboard/{job_id}/export         Export CSV
```

#### Overrides
```
POST   /api/v1/overrides                           Create override (candidate_id, recruiter_id, new_recommendation, reason)
GET    /api/v1/overrides/candidate/{id}            Get override history
```

#### Health
```
GET    /health                                     Health check
```

---

## 11. AI/LLM PIPELINE

### 11.1 Pipeline Flow

```
JD Text (raw)
  └──▶ JD Parser (LLM: extract skills, seniority, domain)
       └──▶ Assessment Generator (LLM: create 15 questions, mixed types)
            └──▶ Candidate Takes Test (timed, autosaved)
                 └──▶ Scoring Engine
                      ├──▶ Layer 1: MCQ Auto-Grading (deterministic)
                      └──▶ Layer 2: LLM Rubric Grading (per dimension)
                           └──▶ Aggregate Scoring (LLM: overall + recommendation)
                                └──▶ Leaderboard Ranking
```

### 11.2 LLM Configuration

| Setting | Value | Reason |
|---|---|---|
| Model | GPT-4o (configurable via env) | Best quality/speed balance |
| Temperature | 0 | Deterministic output |
| Max Tokens | 4096 (8192 for assessment gen) | Sufficient for JSON responses |
| Response Format | JSON only | Structured, parseable |
| Retry | None (fail fast) | Determinism over availability |

### 11.3 Prompt Engineering Principles

1. All prompts enforce **JSON-only output** (no markdown, no explanation)
2. All prompts include **exact schema** the LLM must follow
3. All prompts include **scoring guidelines** with specific ranges
4. All prompts are **version-controlled** in `prompts/registry.py`
5. All LLM calls are **logged** with full I/O to `prompt_logs` table

---

## 12. DESIGN SYSTEM & UI SPECIFICATIONS

### 12.1 Color Palette

| Token | Value | Usage |
|---|---|---|
| `brand-50` | `#eef2ff` | Light backgrounds, hover states |
| `brand-100` | `#e0e7ff` | Selected states |
| `brand-500` | `#6366f1` | Primary accent |
| `brand-600` | `#4f46e5` | Buttons, links |
| `brand-700` | `#4338ca` | Button hover |
| `indigo-600` | `#4f46e5` | Primary CTA |
| `slate-50` | `#f8fafc` | Page background |
| `slate-900` | `#0f172a` | Primary text |
| `slate-500` | `#64748b` | Secondary text |
| `emerald-600` | `#059669` | Success/Advance |
| `amber-500` | `#f59e0b` | Warning/Consider |
| `red-600` | `#dc2626` | Error/Reject |

### 12.2 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| H1 (Hero) | Inter | 5xl (48px) | extrabold |
| H1 (Page) | Inter | 2xl (24px) | bold |
| H2 (Section) | Inter | lg (18px) | semibold |
| Body | Inter | sm (14px) | normal |
| Code/ID | JetBrains Mono | xs (12px) | normal |
| Label | Inter | sm (14px) | medium |

### 12.3 Component Styles

| Component | Tailwind Classes |
|---|---|
| Card | `bg-white rounded-xl border border-slate-200 shadow-sm` |
| Primary Button | `bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500` |
| Secondary Button | `bg-white text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50` |
| Input | `rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500` |
| Badge (Advance) | `bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium` |
| Badge (Consider) | `bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium` |
| Badge (Reject) | `bg-red-50 text-red-700 rounded-full px-3 py-1 text-xs font-medium` |

### 12.4 Layout Patterns

- **Max width:** `max-w-5xl` (landing), `max-w-7xl` (dashboard)
- **Spacing:** `px-6`, `py-3` (nav), `p-6` (cards), `gap-6` (grids)
- **Grid:** `grid-cols-2` (dashboard), `grid-cols-3` (leaderboard)
- **Sticky elements:** Navbar (`sticky top-0 z-50`), test header (`sticky top-0 z-10`)

---

## 13. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Target | How |
|---|---|---|
| Assessment generation | < 60 sec | GPT-4o with streaming |
| Scoring latency | < 10 sec per candidate | Parallel question scoring |
| Concurrency | 500 candidates simultaneously | Async FastAPI + connection pooling |
| Data encryption | AES-256 | At rest (PostgreSQL) + in transit (HTTPS) |
| Scoring consistency | 100% deterministic | Temperature=0, fixed templates |
| Page load | < 2 seconds | Next.js SSR + code splitting |
| Uptime | 99% | Docker health checks + restart policies |
| Autosave | Every 10 seconds | Client-side interval |
| Mobile responsive | All pages | TailwindCSS responsive classes |

---

## 14. TESTING STRATEGY

### 14.1 Backend Testing

| Type | What | Tools |
|---|---|---|
| Unit Tests | Services (jd_parser, scoring_engine, assessment_generator) | pytest, pytest-asyncio |
| API Tests | All endpoints with valid/invalid inputs | httpx, TestClient |
| Integration Tests | Full flow: create job → parse → generate → invite → submit → score | pytest fixtures |
| LLM Tests | Prompt output validation (schema compliance) | JSON schema validation |

### 14.2 Frontend Testing

| Type | What | Tools |
|---|---|---|
| Component Tests | StatusBadge, ScoreBar, Navbar | Jest, React Testing Library |
| Page Tests | Recruiter dashboard flow, candidate test flow | Playwright |
| E2E Tests | Full recruiter + candidate journey | Playwright |

---

## 15. DEPLOYMENT GUIDE

### 15.1 Docker (Local Development)

```bash
# 1. Configure
cp .env.example .env
# Set OPENAI_API_KEY in .env

# 2. Start all services
docker-compose up --build

# 3. Run migrations
docker-compose exec backend alembic upgrade head

# 4. Seed sample data
docker-compose exec backend python seed.py
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 15.2 Environment Variables

```bash
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
DATABASE_URL_SYNC=postgresql://user:pass@host:5432/dbname
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0
LLM_MAX_TOKENS=4096
SECRET_KEY=your-secret-key
ENCRYPTION_KEY=your-encryption-key
CORS_ORIGINS=["http://localhost:3000"]
DEBUG=false

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 15.3 Production (Render / Railway)

**Backend:**
1. Web Service → root dir: `backend`
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add PostgreSQL database + set `DATABASE_URL`

**Frontend:**
1. Web Service → root dir: `frontend`
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Set `NEXT_PUBLIC_API_URL` to backend URL

---

## 16. IMPLEMENTATION PHASES & SPRINT PLAN

### Phase 1: Foundation (Week 1-2)
- [ ] Backend: All models, migrations, seed data
- [ ] Backend: User CRUD, Job CRUD, JD Parser
- [ ] Frontend: Landing page, Recruiter dashboard, Job creation
- [ ] Docker setup + local dev environment
- [ ] Basic error handling + validation

### Phase 2: Core AI Pipeline (Week 2-3)
- [ ] Backend: Assessment Generator service
- [ ] Backend: Candidate invite + test session management
- [ ] Frontend: Candidate test interface (all 4 phases)
- [ ] Frontend: Job detail page (parse, generate, invite)
- [ ] Autosave + copy-paste detection

### Phase 3: Scoring & Ranking (Week 3-4)
- [ ] Backend: Two-layer scoring engine
- [ ] Backend: Leaderboard service + CSV export
- [ ] Backend: Override system
- [ ] Frontend: Leaderboard page with detail panel
- [ ] Frontend: Candidate scoring report page
- [ ] Frontend: Override UI

### Phase 4: Polish & Deploy (Week 4-5)
- [ ] Authentication (JWT/session-based)
- [ ] Error states, loading skeletons, empty states
- [ ] Mobile responsiveness pass
- [ ] Performance optimization
- [ ] Production deployment
- [ ] E2E testing

---

## 17. ATOMS.DEV PROMPT

Copy and paste this prompt into atoms.dev to implement the complete application:

---

### PROMPT FOR ATOMS.DEV

```
Build a full-stack AI-powered hiring platform called "Beat Claude — AI Hiring Companion".

## WHAT IT DOES
A recruiter pastes a Job Description → AI parses it into structured metadata → AI generates a tailored 12-20 question assessment → Candidates take a timed test → AI scores every answer deterministically → Candidates are ranked on a live leaderboard with Advance/Consider/Reject recommendations → Recruiter can override AI decisions.

## TECH STACK
- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS
- Backend: FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2.x (async)
- Database: PostgreSQL 16
- AI: OpenAI API (GPT-4o, temperature=0 for determinism)
- Deploy: Docker + docker-compose

## PAGES TO BUILD

### 1. Landing Page (/)
- Hero section: "Screen smarter. Hire faster." with gradient text
- Two CTAs: "Open Recruiter Dashboard" and "Take Assessment"
- 3-card feature grid: JD Parsing, AI Scoring, Leaderboard
- Indigo/purple gradient theme

### 2. Recruiter Dashboard (/recruiter)
- Two-panel layout: "New Here?" (create account form: name + email) | "Returning User?" (enter recruiter ID)
- After auth, show "Create New Job" form: Job Title + Job Description textarea (min 50 chars)
- Navbar: Logo "BC" gradient badge + "Beat Claude" text + Dashboard/Jobs links

### 3. Jobs List (/recruiter/jobs)
- Table of recruiter's jobs with title, status badge, created date
- Click to navigate to job detail

### 4. Job Detail (/recruiter/jobs/[jobId])
- Step-by-step flow: Parse JD → Generate Assessment → Invite Candidates
- "Parse JD" button calls API, shows extracted skills/seniority/domain
- "Generate Assessment" button calls API, shows question count and types
- "Invite Candidate" form: email + name
- Candidates table: name, status, score, actions (Score, View)

### 5. Candidate Test Interface (/candidate)
- 4 phases in one page:
  a) Token Entry: input field + Continue button
  b) Instructions: 5 numbered rules + "Begin Assessment" button
  c) Test: Sticky header (job title, name, answered count, countdown timer), progress bar, question card (MCQ options or textarea), prev/next navigation + question number grid
  d) Submitted: checkmark + confirmation message
- Timer auto-submits when expired
- Autosave every 10 seconds
- Copy-paste detection (monitor, don't block)

### 6. Leaderboard (/leaderboard/[jobId])
- 3-column layout: 2/3 table + 1/3 detail panel
- Table: Rank, Name/Email, Score, Recommendation badge, Confidence %
- Sort by score or confidence, filter by recommendation
- Click row → detail panel shows: large score number, 4 dimension bars (Accuracy/Depth/Practical/Communication), strengths list, weaknesses list, "Full Report" link
- Export CSV button

### 7. Candidate Report (/recruiter/jobs/[jobId]/candidates/[candidateId])
- Full scoring breakdown per question
- Per-question: question text, candidate answer, score, reasoning
- Overall dimensions, strengths, weaknesses
- Override button: change recommendation with required reason

## BACKEND API ENDPOINTS

### Users
- POST /api/v1/users — Create user {email, name, role, org_name?}
- GET /api/v1/users/{id} — Get user
- GET /api/v1/users — List users

### Jobs
- POST /api/v1/jobs — Create job {title, jd_text, recruiter_id}
- GET /api/v1/jobs — List jobs (?recruiter_id=)
- GET /api/v1/jobs/{id} — Get job
- POST /api/v1/jobs/{id}/parse — Parse JD with AI (calls LLM, extracts: role_title, seniority, domain, experience_range, hard_skills, soft_skills, responsibilities, evaluation_priority)

### Assessments
- POST /api/v1/assessments/generate — Generate assessment {job_id} → creates 15 questions (30% MCQ, 25% short_answer, 30% scenario, 15% mini_case)
- GET /api/v1/assessments/{id}
- GET /api/v1/assessments/job/{job_id}

### Candidates
- POST /api/v1/candidates/invite — {job_id, email, name} → generates unique session_token
- POST /api/v1/candidates/invite/bulk — Bulk invite
- POST /api/v1/candidates/start?session_token= — Start test, return questions
- POST /api/v1/candidates/autosave — {session_token, answers[]}
- POST /api/v1/candidates/submit — {session_token, answers[], copy_paste_detected}
- GET /api/v1/candidates/job/{job_id}

### Scoring
- POST /api/v1/scoring/{candidate_id} — Score candidate using 2-layer engine:
  Layer 1: MCQ auto-grading (correct=100, wrong=0)
  Layer 2: LLM rubric scoring on 4 dimensions (accuracy 40%, depth 30%, practical 20%, communication 10%)
  Aggregate: LLM produces overall_score, recommendation (advance/consider/reject), confidence, strengths, weaknesses
- GET /api/v1/scoring/{candidate_id} — Get score
- GET /api/v1/scoring/{candidate_id}/responses — Get per-question scores

### Leaderboard
- GET /api/v1/leaderboard/{job_id} — Sort by score/confidence, filter by recommendation
- GET /api/v1/leaderboard/{job_id}/export — CSV download

### Overrides
- POST /api/v1/overrides — {candidate_id, recruiter_id, new_recommendation, reason}
- GET /api/v1/overrides/candidate/{id}

## DATABASE TABLES (10)
users, jobs, assessments, questions, candidates, responses, scores, overrides, audit_logs, prompt_logs

## AI SCORING RULES
- Temperature = 0 (always)
- Recommendation thresholds: advance (>=75, no dim <50), consider (>=55 or any dim >=80), reject (<55 and no dim >=80)
- All LLM calls logged with full input/output
- All prompts version-controlled

## DESIGN
- Color: Indigo/purple gradient primary, slate backgrounds
- Font: Inter (sans), JetBrains Mono (code)
- Cards: white, rounded-xl, border, shadow-sm
- Buttons: indigo-600 primary, white bordered secondary
- Badges: green=advance, amber=consider, red=reject
- Responsive: mobile-first with TailwindCSS
- Animations: fade-in on page load

## ENVIRONMENT VARIABLES
DATABASE_URL, OPENAI_API_KEY, OPENAI_BASE_URL, LLM_MODEL=gpt-4o, LLM_TEMPERATURE=0, SECRET_KEY, CORS_ORIGINS, NEXT_PUBLIC_API_URL

## DOCKER
docker-compose with 3 services: db (postgres:16-alpine), backend (FastAPI), frontend (Next.js)
```

---

### ADDITIONAL ATOMS.DEV ENGINEERING PROMPT

```
## ENGINEERING SPECIFICATIONS FOR IMPLEMENTATION

### Backend Architecture Patterns
1. Use async/await throughout (AsyncSession, async def endpoints)
2. Service layer pattern: API routes → Services → Models
3. Pydantic v2 for all request/response validation
4. SQLAlchemy 2.x with mapped_column syntax
5. UUID primary keys everywhere
6. Alembic for migrations
7. CORS middleware configured for frontend origin

### Frontend Architecture Patterns
1. Next.js 14 App Router with "use client" for interactive pages
2. Server Components for static pages (landing)
3. Centralized API client with error handling (lib/api.ts)
4. TypeScript interfaces for all data shapes (lib/types.ts)
5. TailwindCSS with custom brand color palette
6. Component classes in globals.css via @layer components
7. Suspense boundaries for client components with search params

### LLM Integration Pattern
1. Single llm_call() wrapper function that:
   - Sends system + user prompt to OpenAI API
   - Parses JSON response
   - Logs everything to prompt_logs table
   - Returns parsed dict
2. All prompts stored in prompts/registry.py with version strings
3. All prompts force JSON-only output (no markdown)
4. Temperature always 0 for deterministic scoring
5. Each service validates LLM output against expected schema

### Key Implementation Details
- Candidate sessions use unique 64-char tokens
- MCQ questions have exactly 4 options with correct_option_index (0-3)
- Scoring rubric weights per question must sum to 1.0
- Assessment generates exactly 15 questions by default
- Time limits based on seniority (30-90 minutes)
- Autosave interval: 10 seconds client-side
- Copy-paste: detected via onPaste event, stored as boolean
- Leaderboard: default sort by overall_score DESC
- CSV export: returns blob for client-side download
- Override: stores previous + new recommendation with reason
```

---

### PRODUCT DESIGN PROMPT FOR ATOMS.DEV

```
## PRODUCT DESIGN SPECIFICATIONS

### Design Philosophy
- Clean, professional, minimal — this is a B2B hiring tool
- Information density over decoration
- Clear visual hierarchy with intentional whitespace
- Consistent component patterns across all pages

### Visual Identity
- Brand: "Beat Claude" with BC monogram in gradient badge
- Primary: Indigo-600 (#4f46e5) — trust, professionalism
- Accent: Purple-600 (#9333ea) — AI, intelligence
- Neutral: Slate palette — clean backgrounds and text
- Success: Emerald — positive actions and advance status
- Warning: Amber — consideration status
- Error: Red — rejection and error states

### Interaction Patterns
1. FORMS: Labels above inputs, validation messages below, primary CTA full-width or right-aligned
2. TABLES: Hover rows, click to select, sticky headers on scroll
3. BADGES: Pill-shaped, color-coded by status, consistent across all pages
4. SCORE BARS: Horizontal fill bars, color gradient from red→yellow→green
5. LOADING: "Loading..." text for simple states, could add skeleton screens
6. ERRORS: Red alert box with icon + message text
7. EMPTY STATES: Centered gray text with call-to-action
8. NAVIGATION: Sticky navbar, breadcrumbs implied by URL structure

### Mobile Considerations
- Stack 2-column layouts to single column on mobile
- Leaderboard: hide detail panel, show as modal on tap
- Test interface: full-width question cards, smaller navigation dots
- Navbar: keep minimal, no hamburger menu needed (few links)

### Accessibility
- Focus rings on all interactive elements (ring-2 ring-indigo-500)
- Sufficient color contrast (WCAG AA)
- Semantic HTML (buttons for actions, links for navigation)
- Form labels associated with inputs
```

---

*This PRD is the single source of truth for implementing Beat Claude on atoms.dev. All code, design, and architecture decisions should reference this document.*
