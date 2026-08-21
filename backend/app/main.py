from fastapi import FastAPI

from app.api import auth, users

app = FastAPI(title="Nexora API")

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}