<div align="center">

# 🎯 Nexora
### Campus Opportunity Radar

*One personalized feed instead of ten WhatsApp groups you've muted.*

![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-378ADD?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-0F6E56?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini%20API-D85A30?logo=googlegemini&logoColor=white)
![Status](https://img.shields.io/badge/Status-Deployed%20%2F%20Production-2EA043)
![License](https://img.shields.io/badge/License-MIT-533AB7)

**Live Demo:** [Nexora](https://ucs503p-202627-campus-opportunity-r.vercel.app)<br/>
**Backend:** [API / Health](https://ucs503p-202627-campus-opportunity-radar.onrender.com/health)

[What is Nexora?](#-what-is-nexora) • [Why Nexora?](#-the-idea) • [Features](#-features) • [Recommendations](#-explainable-recommendations) • [Architecture](#-architecture) • [Deployment](#-deployment) • [Setup](#-local-development)

</div>

---

## 🧭 What is Nexora?

Nexora is an AI-powered campus opportunity discovery platform. It helps students discover internships, hackathons, competitions, scholarships, research opportunities, workshops, and campus events.

We built this for **UCS503P** at Thapar Institute of Engineering and Technology, supervised by **Paramveer Kaur**, to solve a fundamental problem: **Students do not need another giant list of opportunities.** They need to know: *"What opportunities are actually relevant to ME — and why?"*

Nexora uses a student's profile, skills, interests, and academic context alongside AI-extracted opportunity attributes to produce personalized recommendations with understandable match reasons.

## 🎯 The idea

Most opportunity platforms optimize for discovery volume. **Nexora optimizes for relevance.**

Instead of making students scan hundreds of listings, Nexora surfaces the opportunities that fit their profile and explains *why* each one matches.

- **Personalized**: Weighted scoring against your specific profile.
- **Explainable**: You see exactly why an opportunity is recommended (no black-box AI).
- **Profile-aware**: Matches based on skills, interests, semesters, and branches.
- **Student-first**: One clean feed, built to save time.

## 🔄 How it works

The core product flow is implemented and deployed in production:

1. **Student Profiles**: A student creates an account and builds their profile (branch, semester, skills, interests, preferred mode).
2. **Opportunity Submission**: Organizers submit new opportunities to the platform.
3. **AI-Assisted Extraction**: Gemini API converts raw opportunity announcements into structured opportunity data (skills needed, eligible branches/semesters, deadline, mode, category).
4. **Admin Review**: An administrator reviews the AI-extracted data and approves the opportunity.
5. **Recommendation Engine**: Approved opportunities are scored against relevant student profile attributes to generate personalized recommendations.
6. **Personalized Feed**: Students see a ranked feed with plain-English reasons for each match.
7. **Action**: Students can save, bookmark, and track applications directly in the platform.

## 🧠 Explainable Recommendations

Nexora doesn't simply output an unexplained percentage. Our custom recommendation engine evaluates student attributes against opportunity requirements using a weighted scoring system:

- **Skills Match (30%)**
- **Eligibility (25%)**
- **Interests Match (20%)**
- **Deadline Urgency (15%)**
- **Mode Preference (10%)**

### Example recommendation
*(The following is an illustrative example, not a measured benchmark)*

> **94% match — AI/ML Campus Hackathon**
>
> Python, React matches your skills
> AI matches your interests
> Eligible for CSE, semester 4
> Deadline approaching (urgent)

## ✨ Features

**For Students**
- JWT Authentication & Student profiles
- Personalized, ranked recommendation feed
- Category and mode filtering
- Match scores with plain-English reasons
- Save/bookmark opportunities
- Track application statuses

**For Organizers**
- Dedicated organizer profiles
- Opportunity submission portal
- AI-assisted opportunity structuring

**For Administrators**
- Administrative review queue
- One-click opportunity approval/rejection
- Role-Based Access Control (RBAC)

## 🏗️ Architecture

```mermaid
flowchart TD
    Browser[Student Browser] --> Frontend[Vercel / React Frontend]
    Frontend --> Backend[FastAPI Backend]

    Backend <--> DB[(PostgreSQL)]
    Backend <--> AI[Gemini API]

    DB --> Engine[Recommendation Engine]
    Engine --> Feed[Personalized Feed]
```

## 🛠️ Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS | Lightning-fast development, strict typing |
| Backend | FastAPI, Pydantic, SQLAlchemy | High performance, robust schema validation |
| Database | PostgreSQL (Neon in production) | Reliable relational core |
| AI | Gemini API | Accurate unstructured text extraction |
| Recommendation| Custom weighted scoring engine | Completely explainable matching logic |
| Infrastructure| Docker, Render, Vercel, GitHub Actions| Containerization, deployment, and CI |

## ☁️ Deployment

The application is deployed to production through Vercel and Render, with GitHub Actions providing automated CI checks.

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |

Production configuration uses environment variables. Secrets are never committed to the repository. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed release engineering instructions.

## 💻 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Docker)

### 1. Clone
```bash
git clone https://github.com/biswajit328/ucs503p-202627-campus-opportunity-radar.git
cd ucs503p-202627-campus-opportunity-radar
```

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
```

### 4. Environment Variables
Never commit secrets. You will need the following variable names configured in your `.env` files:

**Backend:**
- `DATABASE_URL` (e.g., `postgresql+psycopg://user:password@localhost:5432/nexora_dev`)
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS` (e.g., `http://localhost:5173`)

**Frontend:**
- `VITE_API_BASE_URL` (e.g., `http://localhost:8000`)

## 📂 Repository Structure

```text
nexora/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── ai/               # Gemini extraction logic
│   │   ├── api/              # FastAPI routers (auth, opportunities, etc.)
│   │   ├── auth/             # JWT and dependencies
│   │   ├── core/             # Database and config setup
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── recommendation/   # Scoring and eligibility logic
│   │   ├── repositories/     # Database access layer
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── services/         # Core business logic
│   └── tests/                # Pytest suite
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   ├── context/          # Global state (Auth)
│   │   ├── pages/            # View components (Dashboard, Feed, Profile)
│   │   └── api/              # API integration layers
├── .github/workflows/        # CI/CD pipelines
├── DEPLOYMENT.md             # Production setup guide
├── docker-compose.yml        # Local database container
└── render.yaml               # Backend infrastructure-as-code
```

## 🧪 Engineering & Quality

Nexora adheres to rigorous engineering practices:
- **Backend tests:** 74 tests passing (Pytest)
- **Frontend verification:** Strict TypeScript checking (`tsc -b`), linting (`eslint`)
- **Database:** Tracked and versioned via Alembic migrations
- **CI/CD:** Automated testing and builds via GitHub Actions
- **Data Validation:** Strict inbound/outbound schema validation via Pydantic

✅ **Verification**
- Backend tests     ✓
- TypeScript        ✓
- Frontend build    ✓
- Lint              ✓
- Database migration ✓

## 🔒 Security

- **Authentication:** Stateless JWT-based authentication.
- **Authorization:** Role-Based Access Control (RBAC) separating Students, Organizers, and Admins.
- **Object-Level Security:** Strict ownership checks on profile updates, bookmarks, and applications.
- **Environment Isolation:** Secrets are injected via environment variables; never hardcoded.
- **API Protection:** Configurable CORS and sanitized production error handling (no stack traces exposed).

## 🗺️ Roadmap

**Shipped**
- [x] Authentication & authorization
- [x] Student profiles
- [x] Opportunity discovery
- [x] Search/filtering
- [x] Opportunity submission
- [x] Admin review
- [x] Recommendation engine
- [x] Explainable matching
- [x] Save/bookmark
- [x] Application tracking
- [x] Production deployment
- [x] Security hardening
- [x] CI/CD

**Next**
- [ ] Richer opportunity ingestion sources
- [ ] Semantic matching with embeddings (pgvector)
- [ ] Automated skill-gap analysis
- [ ] Advanced analytics for organizers

## 📊 Evaluation

We evaluate Nexora's effectiveness by measuring relevance, not just uptime:
- **Precision@K & Recall@K** on recommendations
- **Extraction Accuracy** against manually labeled opportunities
- **Time-to-Find** relevant opportunities (personalized feed vs. traditional list)

## 👥 Team

**UCS503P** — Thapar Institute of Engineering and Technology<br/>
Supervisor: Paramveer Kaur

| Name | Roll no. | Email |
|---|---|---|
| Biswajit Mandal | 1024030256 | bmandal_be24@thapar.edu |
| Hardik Satija | 1024030756 | hsatija_be24@thapar.edu |

## 📄 License

MIT — see [LICENSE](LICENSE). Open to changing this if the course has different requirements for submitted work.
