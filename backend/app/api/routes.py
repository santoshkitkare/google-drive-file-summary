from fastapi import APIRouter, Query, Request

from app.auth.google_oauth import get_drive_service
from app.core.rate_limit import limiter
from app.drive.client import list_files
from app.summarizer.llm import summarize

router = APIRouter()


@router.post("/drive/files")
@limiter.limit("10/minute")
def get_files(
    request: Request,
    auth_code: str = Query(..., description="Google OAuth authorization code"),
):
    service = get_drive_service(auth_code)
    return list_files(service)


@router.post("/summarize")
@limiter.limit("3/minute")
def summarize_text(
    request: Request, content: str = Query(..., description="Plain text to summarize")
):
    return {"summary": summarize(content)}
