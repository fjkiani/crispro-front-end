"""
FastAPI application factory.
"""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ..core.config import get_settings
from ..core.orchestrator import DataStore
from .kb_routes import kb_router
from .multimodal_routes import mm_router
from .routes import router

cfg = get_settings()

# ── Structured logging ────────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer() if cfg.debug else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
)
logging.basicConfig(level=cfg.log_level.upper())
log = structlog.get_logger()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("startup", message="Loading DepMap matrices — this may take a minute…")
    try:
        DataStore.ensure_loaded(require_prism=True)
        log.info("startup", message="Data loaded successfully")
    except Exception as exc:
        log.warning("startup_warning", error=str(exc), message="Data pre-load failed — will retry on first request")
    yield
    log.info("shutdown", message="SL Agent shutting down")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=cfg.app_name,
        version=cfg.app_version,
        description=(
            "Synthetic Lethality Mapping Agent v4. "
            "Integrates DepMap CRISPR screens, PRISM drug data, ChEMBL, and the open KB stack "
            "(CIViC + CGI + JAX) with a multi-modal evidence matrix engine that refuses to "
            "hallucinate SL where receipts are weak, and refuses to discard promising axes "
            "just because CRISPR is negative. Part of the CrisPRO precision oncology platform."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS — restrict in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if cfg.debug else [],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    # Request timing middleware
    @app.middleware("http")
    async def add_timing(request: Request, call_next):
        t0 = time.perf_counter()
        response = await call_next(request)
        ms = round((time.perf_counter() - t0) * 1000, 1)
        response.headers["X-Process-Time-ms"] = str(ms)
        return response

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_error_handler(request: Request, exc: Exception):
        log.error("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=500,
            content={"status": "error", "error": "Internal server error", "detail": str(exc)},
        )

    # Register routes
    app.include_router(router, prefix="/api/v1")
    app.include_router(kb_router, prefix="/api/v1")
    app.include_router(mm_router, prefix="/api/v1")

    return app


app = create_app()
