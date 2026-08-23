from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, profiles, users

app = FastAPI(title="Nexora API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}