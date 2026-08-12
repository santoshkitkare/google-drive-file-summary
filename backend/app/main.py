from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import router
from app.core.rate_limit import limiter

application = FastAPI(title="Google Drive File Summarizer")

application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

application.state.limiter = limiter
application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# =========================
# Health
# =========================
@router.get("/health")
def health():
    return {"status": "ok"}

application.include_router(router)
