"""Placeholder backend — SERVE landing page is frontend-only (Next.js)."""
from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
def health():
    return {"status": "ok"}
