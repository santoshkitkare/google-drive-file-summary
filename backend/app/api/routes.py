import os
import tempfile

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.auth.google_oauth import (
    get_drive_service,
    get_session,
    login_with_google,
)
from app.drive.client import (
    list_root_items,
    list_folder_items,
    download_file,
    export_google_doc,
)
from app.readers.docx import read_docx
from app.readers.pdf import read_pdf
from app.readers.txt import read_txt
from app.summarizer.llm import summarize

router = APIRouter()


# =========================
# REQUEST MODELS
# =========================
class LoginRequest(BaseModel):
    auth_code: str

class SummarizeRequest(BaseModel):
    session_id: str
    file_id: str
    filename: str
    mime_type: str

# =========================
# AUTH
# =========================

@router.post("/auth/login")
def google_login(request: LoginRequest):
    try:
        print("Logging in with auth code:", request.auth_code)
        session_id = login_with_google(request.auth_code)
        print("Login successful, session ID:", session_id)
        print
        return {"session_id": session_id}
    except Exception as e:
        print("Login error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/auth/me")
def get_current_user(session_id: str = Query(...)):
    try:
        session = get_session(session_id)
        return {
            "email": session["email"],
            "name": session["name"],
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# =========================
# GOOGLE DRIVE BROWSING
# =========================

@router.post("/drive/files")
def browse_drive(
    session_id: str = Query(...),
    folder_id: str | None = Query(default=None),
):
    """
    Folder-wise Google Drive browsing:
    - No folder_id → list root folders + files
    - With folder_id → list contents of that folder
    """
    try:
        service = get_drive_service(session_id)

        if folder_id:
            return list_folder_items(service, folder_id)
        else:
            return list_root_items(service)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# FILE SUMMARIZATION
# =========================

@router.post("/drive/summarize")
def summarize_drive_file(payload: SummarizeRequest):
    try:
        service = get_drive_service(payload.session_id)

        with tempfile.TemporaryDirectory() as tmpdir:
            local_path = os.path.join(tmpdir, payload.filename)

            if payload.mime_type == "application/vnd.google-apps.document":
                export_google_doc(service, payload.file_id, local_path)
                text = read_txt(local_path)
            else:
                download_file(service, payload.file_id, local_path)

                filename = payload.filename.lower()
                if filename.endswith(".pdf"):
                    text = read_pdf(local_path)
                elif filename.endswith(".docx"):
                    text = read_docx(local_path)
                elif filename.endswith(".txt"):
                    text = read_txt(local_path)
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Unsupported file type"
                    )

        if not text or not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text could be extracted from this file. "
                    "The file may be empty, scanned, or unsupported."
            )

        cache_key = f"{payload.file_id}:{payload.filename}"
        summary = summarize(text, cache_key)

        return {"summary": summary}

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"File processing error: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error occurred while processing the file."
        )