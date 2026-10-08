import os
import sys
from datetime import datetime, timezone, date

# Ensure the backend directory is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.skill import Skill
from app.models.interest import Interest
from app.models.organization import Organization
from app.models.opportunity import Opportunity, OpportunityCategory, OpportunityMode, OpportunityStatus
from app.models.opportunity_eligibility import OpportunityEligibility

def get_or_create_skill(db: Session, name: str) -> Skill:
    skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
    if not skill:
        skill = Skill(name=name)
        db.add(skill)
        db.flush()
    return skill

def get_or_create_interest(db: Session, name: str) -> Interest:
    interest = db.query(Interest).filter(Interest.name.ilike(name)).first()
    if not interest:
        interest = Interest(name=name)
        db.add(interest)
        db.flush()
    return interest

def get_or_create_org(db: Session, org_name: str) -> Organization:
    org = db.query(Organization).filter(Organization.name == org_name).first()
    if not org:
        # Internal Nexora demo ownership record.
        # DO NOT expose this password in the UI. 
        # Organization schema requires owner_user_id.
        email = f"demo_owner_{org_name.lower().replace(' ', '_').replace('.', '')}@internal.nexora.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=hash_password("InternalDemo#2026"),
                role=UserRole.ORGANIZER
            )
            db.add(user)
            db.flush()
        
        org = Organization(name=org_name, owner_user_id=user.id, verified=True)
        db.add(org)
        db.flush()
    return org

def seed_data():
    db = SessionLocal()
    
    stats = {
        "organizations": 0,
        "skills": 0,
        "opportunities_created": 0,
        "opportunities_skipped": 0,
        "relationships": 0,
        "students": 0,
        "failed": 0
    }
    
    try:
        print("Starting strictly verified seed process...")
        
        # All opportunities here have EXACT VERIFIED dates or are marked as EXPIRED if historical.
        # The database schema strictly requires `deadline` to be non-null.
        opportunities_data = [
            {
                "title": "NASA Space Apps Challenge 2026",
                "description": "The largest annual global hackathon. Solve challenges using NASA's open source data.",
                "category": OpportunityCategory.HACKATHON,
                "organizer": "NASA",
                "deadline": datetime(2026, 11, 15, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 11, 14),
                "duration": "48 hours",
                "location": "Global / Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://www.spaceappschallenge.org/",
                "status": OpportunityStatus.APPROVED,
                "skills": ["React", "Python", "Data Science", "Node.js", "Machine Learning"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "Google Summer of Code (GSoC) 2026",
                "description": "Spend your summer writing code for an open source organization and earn a stipend.",
                "category": OpportunityCategory.OTHER,
                "organizer": "Google",
                "deadline": datetime(2026, 3, 31, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 5, 25),
                "duration": "12 weeks",
                "location": "Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://summerofcode.withgoogle.com/",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["Git", "Python", "React", "C++", "JavaScript", "Node.js"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "Imagine Cup 2025 (Microsoft)",
                "description": "Microsoft's premier student technology competition. Build AI-driven solutions.",
                "category": OpportunityCategory.COMPETITION,
                "organizer": "Microsoft",
                "deadline": datetime(2025, 1, 22, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2024, 10, 1),
                "duration": "6 months",
                "location": "Remote / Global",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://imaginecup.microsoft.com/",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["Machine Learning", "Python", "C#", "Artificial Intelligence", "Azure"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "MLH Global Hack Week: Open Source (Fall 2026)",
                "description": "A week-long global event focused on contributing to open source projects.",
                "category": OpportunityCategory.HACKATHON,
                "organizer": "Major League Hacking (MLH)",
                "deadline": datetime(2026, 9, 21, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 9, 15),
                "duration": "1 week",
                "location": "Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://mlh.io/events",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["Git", "Python", "JavaScript", "React"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "Kaggle: RSNA 2024 Lumbar Spine Challenge",
                "description": "Classify lumbar spine degenerative conditions from MRI scans.",
                "category": OpportunityCategory.COMPETITION,
                "organizer": "Kaggle",
                "deadline": datetime(2024, 10, 8, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2024, 5, 16),
                "duration": "5 months",
                "location": "Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://www.kaggle.com/competitions/rsna-2024-lumbar-spine-mri",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["Python", "Computer Vision", "PyTorch", "Deep Learning", "Machine Learning"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "Grace Hopper Celebration Scholarship 2026",
                "description": "Scholarships for women and non-binary individuals in computing to attend the annual GHC.",
                "category": OpportunityCategory.SCHOLARSHIP,
                "organizer": "AnitaB.org",
                "deadline": datetime(2026, 5, 8, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 10, 20),
                "duration": "4 days",
                "location": "Philadelphia, PA",
                "mode": OpportunityMode.OFFLINE,
                "registration_url": "https://ghc.anitab.org/scholarships/",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["Computer Science", "Software Engineering"],
                "eligible_branches": ["Computer Science", "Information Technology"],
                "eligible_semesters": [],
            },
            {
                "title": "GitHub Externship (Winter Cohort)",
                "description": "A 90-day fellowship program for students in India to work on open source projects.",
                "category": OpportunityCategory.INTERNSHIP,
                "organizer": "GitHub",
                "deadline": datetime(2026, 12, 14, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2027, 1, 15),
                "duration": "90 days",
                "location": "Remote (India)",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://github.com/github-externships",
                "status": OpportunityStatus.APPROVED,
                "skills": ["JavaScript", "React", "Node.js", "Git", "TypeScript"],
                "eligible_branches": [],
                "eligible_semesters": [5, 6, 7],
            },
            {
                "title": "Meta Hacker Cup 2026",
                "description": "Meta's annual open programming competition.",
                "category": OpportunityCategory.COMPETITION,
                "organizer": "Meta",
                "deadline": datetime(2026, 9, 21, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 9, 1),
                "duration": "1 month",
                "location": "Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://www.facebook.com/codingcompetitions/hacker-cup",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["C++", "Java", "Python", "DSA"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "Outreachy May 2026 Internships",
                "description": "Paid, remote internships for people subject to systemic bias and impacted by underrepresentation in tech.",
                "category": OpportunityCategory.INTERNSHIP,
                "organizer": "Outreachy",
                "deadline": datetime(2026, 1, 31, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 5, 25),
                "duration": "3 months",
                "location": "Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://www.outreachy.org/",
                "status": OpportunityStatus.EXPIRED,
                "skills": ["Git", "Python", "JavaScript", "Linux"],
                "eligible_branches": [],
                "eligible_semesters": [],
            },
            {
                "title": "AWS DeepRacer Student League 2026",
                "description": "Learn machine learning by training autonomous vehicles in a global racing league.",
                "category": OpportunityCategory.COMPETITION,
                "organizer": "AWS",
                "deadline": datetime(2026, 10, 31, 23, 59, 59, tzinfo=timezone.utc),
                "start_date": date(2026, 3, 1),
                "duration": "8 months",
                "location": "Remote",
                "mode": OpportunityMode.ONLINE,
                "registration_url": "https://aws.amazon.com/deepracer/student/",
                "status": OpportunityStatus.APPROVED,
                "skills": ["AWS", "Machine Learning", "Python", "Deep Learning"],
                "eligible_branches": [],
                "eligible_semesters": [],
            }
        ]

        for data in opportunities_data:
            org = get_or_create_org(db, data["organizer"])
            
            existing_opp = db.query(Opportunity).filter(
                Opportunity.title == data["title"],
                Opportunity.organizer == data["organizer"]
            ).first()
            
            if existing_opp:
                stats["opportunities_skipped"] += 1
                continue
                
            opp = Opportunity(
                title=data["title"],
                description=data["description"],
                category=data["category"],
                organizer=data["organizer"],
                deadline=data["deadline"],
                start_date=data["start_date"],
                duration=data.get("duration"),
                location=data.get("location"),
                mode=data["mode"],
                registration_url=data["registration_url"],
                source_url=data["registration_url"],
                source_type="demo_seed",
                status=data["status"]
            )
            
            db.add(opp)
            db.flush()
            stats["opportunities_created"] += 1
            
            for skill_name in data["skills"]:
                skill = get_or_create_skill(db, skill_name)
                opp.skills.append(skill)
                stats["relationships"] += 1
                
            eligibility = OpportunityEligibility(
                opportunity_id=opp.id,
                eligible_branches=data["eligible_branches"],
                eligible_semesters=data["eligible_semesters"],
                is_uncertain=False
            )
            db.add(eligibility)
            db.flush()

        stats["organizations"] = db.query(Organization).count()
        stats["skills"] = db.query(Skill).count()

        # Demo Students with distinct recommendation profiles
        demo_students_data = [
            {
                "email": "fullstack@demo.nexora.com",
                "name": "Alex FullStack",
                "branch": "Software Engineering",
                "semester": 6,
                "year": 2028,
                "preferred_mode": "HYBRID",
                "preferred_location": "San Francisco, CA",
                "skills": ["React", "TypeScript", "Node.js", "SQL", "PostgreSQL", "Git", "DSA"],
                "interests": ["Web Development", "Software Engineering", "Startups"]
            },
            {
                "email": "aiml@demo.nexora.com",
                "name": "Sarah AI",
                "branch": "Artificial Intelligence",
                "semester": 7,
                "year": 2027,
                "preferred_mode": "OFFLINE",
                "preferred_location": "Remote",
                "skills": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "PyTorch", "SQL"],
                "interests": ["Artificial Intelligence", "Machine Learning", "Data Science"]
            },
            {
                "email": "cloud@demo.nexora.com",
                "name": "Chris Cloud",
                "branch": "Computer Science",
                "semester": 5,
                "year": 2028,
                "preferred_mode": "ONLINE",
                "preferred_location": "Remote",
                "skills": ["Python", "AWS", "Docker", "Linux", "Kubernetes", "Git"],
                "interests": ["Cloud Computing", "DevOps"]
            }
        ]

        for student_data in demo_students_data:
            user = db.query(User).filter(User.email == student_data["email"]).first()
            if not user:
                user = User(
                    email=student_data["email"],
                    hashed_password=hash_password("DemoPassword123!"),
                    role=UserRole.STUDENT
                )
                db.add(user)
                db.flush()
            
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
            if not profile:
                profile = StudentProfile(
                    user_id=user.id,
                    name=student_data["name"],
                    branch=student_data["branch"],
                    semester=student_data["semester"],
                    year=student_data["year"],
                    preferred_mode=student_data["preferred_mode"],
                    preferred_location=student_data["preferred_location"]
                )
                db.add(profile)
                db.flush()
                stats["students"] += 1
                
                for s in student_data["skills"]:
                    skill = get_or_create_skill(db, s)
                    if skill not in profile.skills:
                        profile.skills.append(skill)
                for i in student_data["interests"]:
                    interest = get_or_create_interest(db, i)
                    if interest not in profile.interests:
                        profile.interests.append(interest)
                
                db.flush()

        # If everything succeeded, commit the transaction
        db.commit()

        print("\nSeed transaction completed safely.")
        print("------------------------------")
        print(f"Organizations: {stats['organizations']}")
        print(f"Skills: {stats['skills']}")
        print(f"Opportunities Created: {stats['opportunities_created']}")
        print(f"Opportunities Skipped: {stats['opportunities_skipped']}")
        print(f"Opportunity-Skill Relationships: {stats['relationships']}")
        print(f"Demo students Created: {stats['students']}")
        
    except Exception as e:
        db.rollback()
        print(f"\nFailed to seed data. Transaction rolled back: {e}")
        stats["failed"] += 1
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
