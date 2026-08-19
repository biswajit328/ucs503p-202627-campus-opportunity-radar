from fastapi import FastAPI

app = FastAPI(title="Nexora API")


@app.get("/health")
def health_check():
    return {"status": "ok"}