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


async def _proxy_to_frontend(request: Request, path: str = ""):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
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
    except (httpx.ConnectError, httpx.ConnectTimeout):
        from fastapi.responses import HTMLResponse
        return HTMLResponse(
            content="<h2>Frontend not running</h2><p>Start the Next.js frontend on port 3000:</p>"
            "<pre>cd ~/mosaicfellowship/frontend && npm run dev</pre>"
            "<p>Backend API is working fine at <a href='/docs'>/docs</a></p>",
            status_code=503,
        )


@app.get("/")
async def proxy_frontend_root(request: Request):
    return await _proxy_to_frontend(request)


@app.api_route("/{path:path}", methods=["GET", "HEAD"])
async def proxy_frontend(request: Request, path: str):
    return await _proxy_to_frontend(request, path)
