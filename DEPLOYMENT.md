# Nexora Production Deployment Guide

This guide details the deployment architecture and release engineering for Nexora. The application is a React/Vite Single Page Application (SPA) communicating with a Python FastAPI backend, supported by a PostgreSQL database.

## 1. Architecture
- **Frontend**: Vercel (Static asset hosting with SPA rewrites)
- **Backend**: Render (Web Service running ASGI Uvicorn)
- **Database**: Managed PostgreSQL (e.g., Neon or Render Postgres)
- **CI/CD**: GitHub Actions (linting, tests, and builds)

## 2. Environment Setup
Never commit `.env` files or hardcode secrets into the source. Always inject production variables via your deployment platform.

### Frontend (`frontend/.env.example`)
```env
VITE_API_BASE_URL=https://your-production-backend.onrender.com
```

### Backend (`backend/.env.example`)
```env
DATABASE_URL=postgresql://user:password@hostname/dbname
JWT_SECRET=your_secure_random_string_here
ALLOWED_ORIGINS=https://your-production-frontend.vercel.app
GEMINI_API_KEY=your_gemini_api_key_here
```

## 3. Frontend Deployment (Vercel)
Nexora's frontend is optimized for zero-config Vercel deployment.
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Routing**: Handled natively by the `vercel.json` rewrite rules (redirects all paths to `/index.html` to prevent 404s on direct navigation).
- **Environment Variables**: Add `VITE_API_BASE_URL` pointing to your deployed FastAPI instance.

## 4. Backend Deployment (Render)
Nexora's backend uses an infrastructure-as-code `render.yaml` configuration.
- **Service Type**: Python Web Service
- **Build Command**: `pip install -r requirements.txt`
- **Pre-Deploy Command**: `alembic upgrade head` (Ensures safe schema migrations before traffic is routed).
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Auto-binds to the dynamically assigned Render port).
- **Health Check**: `/health` (Returns HTTP 200 `{"status": "ok"}`).
- **CORS**: Strictly controlled by `ALLOWED_ORIGINS`.

## 5. Database & Migrations
- Production connections automatically handle standard provider format variations (e.g. replacing `postgres://` with `postgresql://`).
- Alembic handles schema evolution. Never use `Base.metadata.create_all()` in production.
- Destructive operations are prevented by strictly tracking the migration chain (`alembic heads`).

## 6. Local Testing
To smoke-test the production build locally:
```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
