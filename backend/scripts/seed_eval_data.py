"""
Seeds a small, deliberately-crafted dataset for offline evaluation of the
recommendation engine (spec Section 22-23).

Safe to re-run: skips anything that already exists (matched by email or
title), so running this twice never creates duplicates.

Usage (from backend/, venv active):
    python scripts/seed_eval_data.py
"""
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.opportunity import Opportunity, OpportunityCategory, OpportunityMode, OpportunityStatus
from app.models.opportunity_eligibility import OpportunityEligibility
from app.models.student_profile import StudentProfile
from app.models.user import User, UserRole
from app.repositories.interest_repository import get_or_create_interest
from app.repositories.skill_repository import get_or_create_skill

EVAL_PASSWORD = "eval_dataset_pw_123"

STUDENTS = [
    dict(email="eval_cse4_python@nexora.test", name="Eval CSE4", branch="CSE", semester=4, year=2,
         skills=["Python", "SQL"], interests=["AI"]),
    dict(email="eval_ece2_robotics@nexora.test", name="Eval ECE2", branch="ECE", semester=2, year=1,
         skills=["C"], interests=["Robotics"]),
    dict(email="eval_it6_react@nexora.test", name="Eval IT6", branch="IT", semester=6, year=3,
         skills=["React", "JavaScript"], interests=["Hackathons"]),
    dict(email="eval_cse2_ml@nexora.test", name="Eval CSE2", branch="CSE", semester=2, year=1,
         skills=["Python", "Machine Learning"], interests=["AI", "Research"]),
    dict(email="eval_me4_general@nexora.test", name="Eval ME4", branch="ME", semester=4, year=2,
         skills=[], interests=[]),
]

OPPORTUNITIES = [
    dict(title="[EVAL] AI Research Internship", category=OpportunityCategory.RESEARCH,
         skills=["Python", "Machine Learning"], branches=["CSE"], semesters=[4, 5, 6],
         mode=OpportunityMode.ONLINE, uncertain=False),
    dict(title="[EVAL] Web Dev Hackathon", category=OpportunityCategory.HACKATHON,
         skills=["React", "JavaScript"], branches=["IT", "CSE"], semesters=[5, 6, 7, 8],
         mode=OpportunityMode.OFFLINE, uncertain=False),
    dict(title="[EVAL] Robotics Workshop", category=OpportunityCategory.WORKSHOP,
         skills=["C", "Robotics"], branches=["ECE", "ME"], semesters=[1, 2, 3],
         mode=OpportunityMode.OFFLINE, uncertain=False),
    dict(title="[EVAL] Data Science Scholarship", category=OpportunityCategory.SCHOLARSHIP,
         skills=["Python", "SQL"], branches=["CSE", "IT"], semesters=[3, 4, 5],
         mode=OpportunityMode.ONLINE, uncertain=False),
    dict(title="[EVAL] General Aptitude Competition", category=OpportunityCategory.COMPETITION,
         skills=[], branches=[], semesters=[], mode=OpportunityMode.ONLINE, uncertain=False),
    dict(title="[EVAL] Mechanical Design Internship", category=OpportunityCategory.INTERNSHIP,
         skills=[], branches=["ME"], semesters=[4, 5, 6], mode=OpportunityMode.OFFLINE, uncertain=False),
    dict(title="[EVAL] Frontend Bootcamp", category=OpportunityCategory.WORKSHOP,
         skills=["React"], branches=["IT"], semesters=[5, 6], mode=OpportunityMode.ONLINE, uncertain=False),
    dict(title="[EVAL] Uncertain Eligibility Event", category=OpportunityCategory.CAMPUS_EVENT,
         skills=[], branches=[], semesters=[], mode=OpportunityMode.ONLINE, uncertain=True),
]


def seed():
    db = SessionLocal()
    try:
        for s in STUDENTS:
            if db.query(User).filter(User.email == s["email"]).first():
                print(f"  skip (exists): {s['email']}")
                continue
            user = User(email=s["email"], hashed_password=hash_password(EVAL_PASSWORD), role=UserRole.STUDENT)
            db.add(user)
            db.flush()
            profile = StudentProfile(
                user_id=user.id, name=s["name"], branch=s["branch"], semester=s["semester"], year=s["year"]
            )
            profile.skills = [get_or_create_skill(db, n) for n in s["skills"]]
            profile.interests = [get_or_create_interest(db, n) for n in s["interests"]]
            db.add(profile)
            db.commit()
            print(f"  created student: {s['email']}")

        deadline = datetime.now(timezone.utc) + timedelta(days=20)
        for o in OPPORTUNITIES:
            if db.query(Opportunity).filter(Opportunity.title == o["title"]).first():
                print(f"  skip (exists): {o['title']}")
                continue
            opp = Opportunity(
                title=o["title"], description="Seed data for evaluation.", category=o["category"],
                organizer="Eval Org", deadline=deadline, mode=o["mode"],
                registration_url="https://example.com/eval", source_type="eval_seed",
                status=OpportunityStatus.APPROVED,
            )
            opp.skills = [get_or_create_skill(db, n) for n in o["skills"]]
            opp.eligibility = OpportunityEligibility(
                eligible_branches=o["branches"], eligible_semesters=o["semesters"], is_uncertain=o["uncertain"]
            )
            db.add(opp)
            db.commit()
            print(f"  created opportunity: {o['title']}")
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding evaluation dataset...")
    seed()
    print("Done.")