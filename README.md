# Beat Claude — AI Hiring Companion

AI-native hiring system that converts job descriptions into tailored assessments, scores candidates deterministically, and ranks them on a leaderboard.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Next.js UI  │────▶│  FastAPI API  │────▶│ PostgreSQL │
│  (Port 3000) │     │  (Port 8000) │     │ (Port 5432)│
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────▼───────┐
                    │  OpenAI API   │
                    │  (LLM Layer)  │
                    └──────────────┘
```

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Backend  | FastAPI, Python 3.12, Pydantic     |
| Database | PostgreSQL 16, SQLAlchemy, Alembic |
| AI       | OpenAI-compatible API, Temp=0      |
| Deploy   | Docker, docker-compose             |

## Quick Start (Docker)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY

# 2. Start all services
docker-compose up --build

# 3. Run database migrations
docker-compose exec backend alembic upgrade head

# 4. Seed sample data
docker-compose exec backend python seed.py
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy and configure .env
cp .env.example .env

# Start PostgreSQL (local or Docker)
docker run -d --name beatclaude-db \
  -e POSTGRES_USER=beatclaude \
  -e POSTGRES_PASSWORD=beatclaude \
  -e POSTGRES_DB=beatclaude \
  -p 5432:5432 postgres:16-alpine

# Run migrations
alembic upgrade head

# Seed data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Copy and configure .env
cp .env.example .env.local

# Start dev server
npm run dev
```

## API Endpoints

### Users
- `POST /api/v1/users` — Create user
- `GET /api/v1/users/{id}` — Get user
- `GET /api/v1/users` — List users

### Jobs
- `POST /api/v1/jobs` — Create job
- `GET /api/v1/jobs` — List jobs
- `GET /api/v1/jobs/{id}` — Get job
- `POST /api/v1/jobs/{id}/parse` — Parse JD with AI

### Assessments
- `POST /api/v1/assessments/generate` — Generate assessment from parsed JD
- `GET /api/v1/assessments/{id}` — Get assessment
- `GET /api/v1/assessments/job/{job_id}` — List assessments for job

### Candidates
- `POST /api/v1/candidates/invite` — Invite candidate
- `POST /api/v1/candidates/invite/bulk` — Bulk invite
- `POST /api/v1/candidates/start` — Start test session
- `POST /api/v1/candidates/autosave` — Autosave answers
- `POST /api/v1/candidates/submit` — Submit test
- `GET /api/v1/candidates/job/{job_id}` — List candidates

### Scoring
- `POST /api/v1/scoring/{candidate_id}` — Score candidate
- `GET /api/v1/scoring/{candidate_id}` — Get score
- `GET /api/v1/scoring/{candidate_id}/responses` — Get graded responses

### Leaderboard
- `GET /api/v1/leaderboard/{job_id}` — Get leaderboard
- `GET /api/v1/leaderboard/{job_id}/export` — Export CSV

### Overrides
- `POST /api/v1/overrides` — Override recommendation
- `GET /api/v1/overrides/candidate/{id}` — Get overrides

## AI Pipeline

```
JD Text
  └─▶ JD Parser (extract skills, seniority, domain)
       └─▶ Assessment Generator (12-20 questions, mixed types)
            └─▶ Candidate takes test
                 └─▶ Scoring Engine
                      ├─▶ Layer 1: MCQ auto-grading
                      └─▶ Layer 2: LLM rubric-based grading
                           └─▶ Aggregate scoring + recommendation
                                └─▶ Leaderboard ranking
```

### Scoring Dimensions
| Dimension           | Weight |
|---------------------|--------|
| Accuracy            | 40%    |
| Depth               | 30%    |
| Practical Reasoning | 20%    |
| Communication       | 10%    |

### Determinism
- Temperature = 0
- Fixed grading templates
- All prompts version-controlled and logged
- Same input always produces same output

## Database Schema

10 tables with full relational integrity:
- `users` — Recruiters, candidates, admins
- `jobs` — Job descriptions with parsed metadata
- `assessments` — Generated test configurations
- `questions` — Individual questions with rubrics
- `candidates` — Invited candidates with session tokens
- `responses` — Individual answer submissions
- `scores` — Aggregated scores with recommendations
- `overrides` — Recruiter recommendation overrides
- `audit_logs` — All system actions logged
- `prompt_logs` — All LLM calls logged with I/O

## Deployment (Render / Railway)

### Backend (Render)
1. Create a new Web Service
2. Set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Add a PostgreSQL database and set `DATABASE_URL`

### Frontend (Render)
1. Create a new Static Site or Web Service
2. Set root directory to `frontend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set `NEXT_PUBLIC_API_URL` to your backend URL

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers
│   │   ├── core/         # Config, security utilities
│   │   ├── db/           # Database session, base
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── prompts/      # Version-controlled prompt registry
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── services/     # Business logic layer
│   │   └── main.py       # FastAPI application entry
│   ├── alembic/          # Database migrations
│   ├── seed.py           # Sample data seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # API client, types
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```
