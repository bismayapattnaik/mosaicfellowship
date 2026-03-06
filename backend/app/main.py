from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
from app.core.config import get_settings
from app.api import users, jobs, assessments, candidates, scoring, leaderboard, overrides

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(assessments.router, prefix="/api/v1")
app.include_router(candidates.router, prefix="/api/v1")
app.include_router(scoring.router, prefix="/api/v1")
app.include_router(leaderboard.router, prefix="/api/v1")
app.include_router(overrides.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


# Reverse proxy: forward all non-API requests to the Next.js frontend
FRONTEND_URL = "http://localhost:3000"


@app.api_route("/{path:path}", methods=["GET", "HEAD"])
async def proxy_frontend(request: Request, path: str):
    async with httpx.AsyncClient() as client:
        url = f"{FRONTEND_URL}/{path}"
        headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host",)}
        resp = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            params=request.query_params,
            follow_redirects=True,
        )
        return StreamingResponse(
            content=iter([resp.content]),
            status_code=resp.status_code,
            headers={k: v for k, v in resp.headers.items() if k.lower() not in ("transfer-encoding", "content-encoding")},
        )


@app.get("/")
async def proxy_frontend_root(request: Request):
    async with httpx.AsyncClient() as client:
        headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host",)}
        resp = await client.get(
            FRONTEND_URL,
            headers=headers,
            params=request.query_params,
            follow_redirects=True,
        )
        return StreamingResponse(
            content=iter([resp.content]),
            status_code=resp.status_code,
            headers={k: v for k, v in resp.headers.items() if k.lower() not in ("transfer-encoding", "content-encoding")},
        )
