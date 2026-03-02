"""
Seed script for Beat Claude database.
Run: python seed.py
Requires database to be running and migrations applied.
"""
import uuid
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.job import Job

SAMPLE_JD = """
Senior Financial Analyst — Growth Stage Startup

About the Role:
We are looking for a Senior Financial Analyst to join our Finance team. You will own financial
modeling, budgeting, forecasting, and strategic analysis to support executive decision-making.

Responsibilities:
- Build and maintain complex financial models (DCF, LBO, scenario analysis)
- Lead quarterly budgeting and annual planning processes
- Analyze revenue trends, unit economics, and key financial KPIs
- Prepare board-ready financial presentations and reports
- Partner with department heads on headcount planning and cost optimization
- Support fundraising with investor-facing materials and data rooms
- Conduct market and competitor financial benchmarking

Requirements:
- 3-5 years of experience in investment banking, consulting, or FP&A
- Expert proficiency in Excel and financial modeling
- Experience with SQL and data visualization tools (Tableau/Looker)
- Strong understanding of SaaS metrics (ARR, CAC, LTV, churn)
- CFA or MBA preferred
- Excellent communication and presentation skills
- Ability to work autonomously in a fast-paced environment
"""

SAMPLE_JD_2 = """
Performance Marketing Manager

About the Role:
We need a Performance Marketing Manager to scale our paid acquisition channels.
You will manage a $500K+ monthly ad budget across Google, Meta, and TikTok.

Responsibilities:
- Plan, execute, and optimize paid campaigns across Google Ads, Meta Ads, and TikTok Ads
- Manage and allocate monthly budgets of $500K+
- Build attribution models and measure ROAS across channels
- A/B test creative, copy, landing pages, and audience segments
- Collaborate with creative team on ad production pipeline
- Report weekly on campaign performance, CPA, and LTV trends
- Identify and test new acquisition channels

Requirements:
- 4+ years managing performance marketing at scale
- Deep expertise in Google Ads and Meta Ads Manager
- Experience with attribution tools (Appsflyer, Branch, or similar)
- Strong analytical skills with SQL and Google Analytics
- Understanding of creative testing frameworks
- Experience managing $200K+/month budgets
- Agency or high-growth startup experience preferred
"""


async def seed():
    async with AsyncSessionLocal() as db:
        recruiter_id = uuid.uuid4()
        recruiter = User(
            id=recruiter_id,
            email="recruiter@beatclaude.ai",
            name="Alex Johnson",
            role=UserRole.RECRUITER,
            org_name="Beat Claude Inc.",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(recruiter)

        admin = User(
            email="admin@beatclaude.ai",
            name="System Admin",
            role=UserRole.ADMIN,
            org_name="Beat Claude Inc.",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(admin)

        job1 = Job(
            recruiter_id=recruiter_id,
            title="Senior Financial Analyst",
            jd_text=SAMPLE_JD.strip(),
            status="draft",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(job1)

        job2 = Job(
            recruiter_id=recruiter_id,
            title="Performance Marketing Manager",
            jd_text=SAMPLE_JD_2.strip(),
            status="draft",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(job2)

        await db.commit()
        print("Seed data inserted successfully.")
        print(f"  Recruiter ID: {recruiter_id}")
        print(f"  Recruiter email: recruiter@beatclaude.ai")
        print(f"  Job 1: {job1.title} (ID: {job1.id})")
        print(f"  Job 2: {job2.title} (ID: {job2.id})")


if __name__ == "__main__":
    asyncio.run(seed())
