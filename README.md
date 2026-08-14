<div align="center">

# 🎯 Nexora
### Campus Opportunity Radar

*One personalized feed instead of ten WhatsApp groups you've muted.*

![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-378ADD?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-0F6E56?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini%20API-D85A30?logo=googlegemini&logoColor=white)
![Status](https://img.shields.io/badge/Status-Design%20phase-EF9F27)
![License](https://img.shields.io/badge/License-MIT-533AB7)

[Why](#-why-were-building-this) • [How it works](#-how-it-works) • [Stack](#-stack) • [Architecture](#-how-the-pieces-connect) • [Setup](#-running-it-locally) • [Roadmap](#-where-were-at) • [Team](#-team)

</div>

---

## 🙋 Why we're building this

We got tired of missing good opportunities because they were buried in a WhatsApp group we muted three months ago, or on a noticeboard nobody actually checks. Nexora is our attempt at fixing that: instead of hunting across ten channels for internships, hackathons, scholarships, and workshops, you get one feed that's filtered for *you* — your branch, semester, skills, interests.

This is our project for **UCS503P** at Thapar Institute of Engineering and Technology, supervised by **Paramveer Kaur**. We're still in the design/planning stage — a lot of what's below is the plan, not finished code yet. We'll keep this updated as we build.

Our take: the problem was never "where do I find opportunities." It's "which of these are actually relevant to me, and why."

## ⚙️ How it works

1. An opportunity is submitted, or pulled in via an RSS/API feed or a chat bot we're building for poster-style announcements.
2. It gets deduplicated and queued.
3. Gemini extracts the structured stuff — skills needed, eligible branches/semesters, deadline, mode, location, organizer.
4. Anything the AI isn't confident about goes to a human to check before it's published.
5. Approved opportunities land in Postgres.
6. We score each opportunity against a student's profile with a weighted formula — not a black box, we show our work.
7. The student sees a ranked feed with plain-English reasons for each match, not just a percentage.
8. They save it, apply, or track where they're at with it.

Here's roughly what a match card looks like:

> **94% match — AI/ML Campus Hackathon**
> Python matches your skills · AI matches your interests
> CSE, semester 4 — eligible · campus mode matches your preference
> Deadline in 3 days

## 🧱 Stack

We picked things we already know reasonably well over the "coolest" option, since we've got one semester to ship this.

| Layer | Tech | Why |
|---|---|---|
| Frontend | React + TypeScript, Tailwind | Comfortable, fast to iterate on |
| Backend | FastAPI, Pydantic, SQLAlchemy | Async, good validation, we've both used it before |
| Database | PostgreSQL (pgvector planned) | Relational core now, semantic matching later without a rewrite |
| AI | Gemini API | Extraction + generating match explanations |
| Recommendation | Our own weighted scoring, no 3rd-party recommender lib | Wanted it explainable and easy to defend in evaluation |
| CI | GitHub Actions | Basic lint/test/build on push |

## 🧭 How the pieces connect

```mermaid
flowchart TD
    A[Manual submissions] --> D[Ingestion pipeline]
    B[APIs & RSS feeds] --> D
    C[Chat bot poster capture] --> D
    D --> E[AI extraction - Gemini]
    E -->|flagged| F[Admin review]
    E --> G[(PostgreSQL)]
    F --> G
    G --> I[Matching & ranking engine]
    H[Student profile] --> I
    I --> J[Personalized feed]
    J --> K[Save / Apply / Track]
```

## 🚀 Running it locally

This describes the target setup — backend/frontend scaffolding is still being written.

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in DATABASE_URL and GEMINI_API_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env        # fill in VITE_API_BASE_URL
npm run dev
```

**.env values you'll need**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexora
GEMINI_API_KEY=your_key_here
JWT_SECRET=change_me
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Repo layout (planned)

```
nexora/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/        # extraction + matching logic lives here
│   │   └── main.py
│   ├── alembic/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── tests/
└── .github/workflows/
```

## 🗺 Where we're at

- [x] Problem statement, proposal, and architecture written up
- [ ] Weeks 1–2 — auth, student profile, project scaffolding
- [ ] Weeks 3–4 — opportunity DB, browse/search/filter, save
- [ ] Weeks 5–7 — AI extraction (category, deadline, eligibility, skills)
- [ ] Weeks 8–10 — matching engine, personalized feed, explanations
- [ ] Weeks 11–12 — club submission portal, admin approval, application tracking
- [ ] Weeks 13–14 — stretch goals: semantic matching (pgvector), skill-gap analysis
- [ ] Week 15 — testing, deployment, write-up, demo

Weeks 13–14 are the first thing we'll cut if we're behind — the core loop (extraction → matching → feed) matters more than the extra features.

## 📊 How we're evaluating this

Not just "does it work," but "is it actually better than a plain list":

- Precision@K on recommendations
- Extraction accuracy against a set of manually labeled opportunities we're building
- Recall@K / NDCG@K for ranking quality
- Time it takes a student to find 5 relevant opportunities, personalized vs. non-personalized
- A small pilot (~10–20 students) comparing both versions directly

## 👥 Team

| Name | Roll no. | Email |
|---|---|---|
| Biswajit Mandal | 1024030256 | bmandal_be24@thapar.edu |
| Hardik Satija | 1024030756 | hsatija_be24@thapar.edu |

## 📄 License

MIT — see [LICENSE](LICENSE). Open to changing this if the course has different requirements for submitted work.
