import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    applications, auth, bookmarks, ingestion, opportunities,
    organizations, profiles, recommendations, submissions, users,
)

app = FastAPI(title="Nexora API")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(opportunities.router)
app.include_router(bookmarks.router)
app.include_router(ingestion.router)
app.include_router(recommendations.router)
app.include_router(applications.router)
app.include_router(organizations.router)
app.include_router(submissions.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}