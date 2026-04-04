from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rx-track-p4")

from app.routers import ingest, search, compare, changes, scores, appeal

app = FastAPI(title="Anton RX Track API")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred.", "reason": str(exc)},
    )

# Update CORS later if needed for prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(search.router)
app.include_router(compare.router)
app.include_router(changes.router)
app.include_router(scores.router)
app.include_router(appeal.router)

@app.get("/health")
async def health():
    return {"status": "healthy"}
