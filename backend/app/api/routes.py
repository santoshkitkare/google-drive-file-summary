import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from app.auth.google_oauth import get_drive_service
from app.core.rate_limit import limiter
from app.drive.client import (
    GOOGLE_DOC_MIME,
    download_file,
    export_google_doc,
    list_files,
)
from app.readers.docx import read_docx
from app.readers.pdf import read_pdf
from app.readers.txt import read_txt
from app.summarizer.llm import summarize


class DriveSummarizeRequest(BaseModel):
    file_id: str
    file_name: str
    mime_type: str


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


@router.post("/drive/summarize")
@limiter.limit("3/minute")
def summarize_drive_file(
    request: Request,
    payload: DriveSummarizeRequest,
    auth_code: str = Query(..., description="Google OAuth authorization code"),
):
    service = get_drive_service(auth_code)

    suffix = Path(payload.file_name).suffix.lower()

    with tempfile.TemporaryDirectory() as tmpdir:
        file_path = os.path.join(tmpdir, payload.file_name)

        # 1️⃣ Download or export file
        if payload.mime_type == GOOGLE_DOC_MIME:
            export_google_doc(service, payload.file_id, file_path)
            text = read_txt(file_path)

        else:
            download_file(service, payload.file_id, file_path)

            if suffix == ".pdf":
                text = read_pdf(file_path)
            elif suffix == ".docx":
                text = read_docx(file_path)
            elif suffix == ".txt":
                text = read_txt(file_path)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {suffix}",
                )

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in file",
            )

        # 2️⃣ LLM summarization (your existing logic)
        summary = summarize(text)

        return {
            "file_id": payload.file_id,
            "file_name": payload.file_name,
            "summary": summary,
        }
