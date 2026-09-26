import logging
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    applications, auth, bookmarks, ingestion, opportunities,
    organizations, profiles, recommendations, submissions, users,
)

app = FastAPI(title="Nexora API")

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    logging.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc), "traceback": traceback.format_exc()},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*"), "Access-Control-Allow-Credentials": "true"}
    )

@app.get("/debug-db")
def debug_db():
    import subprocess
    from app.core.database import engine
    from sqlalchemy import inspect
    
    # Run alembic
    alembic_res = subprocess.run(['alembic', 'upgrade', 'head'], capture_output=True, text=True)
    
    # Get tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    return {
        "alembic_code": alembic_res.returncode,
        "alembic_stdout": alembic_res.stdout,
        "alembic_stderr": alembic_res.stderr,
        "tables": tables
    }

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