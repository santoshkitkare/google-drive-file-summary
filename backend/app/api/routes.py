import os
import tempfile

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.drive.client import list_root_items, list_folder_items

from app.auth.google_oauth import (
    get_drive_service,
    get_session,
    login_with_google,
)
from app.drive.client import (
    download_file,
    export_google_doc,
    list_files,
)
from app.readers.docx import read_docx
from app.readers.pdf import read_pdf
from app.readers.txt import read_txt
from app.summarizer.llm import summarize

router = APIRouter()

class SummarizeRequest(BaseModel):
    session_id: str
    file_id: str
    filename: str
    mime_type: str


# ---------- AUTH ----------

@router.post("/auth/login")
def google_login(auth_code: str = Query(...)):
    try:
        session_id = login_with_google(auth_code)
        return {"session_id": session_id}
    except Exception as e:
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


# ---------- DRIVE ----------

@router.post("/drive/files")
def get_files(session_id: str = Query(...)):
    try:
        service = get_drive_service(session_id)
        return list_files(service)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/drive/summarize")
def summarize_drive_file(payload: SummarizeRequest):
    try:
        session_id = payload.session_id
        file_id = payload.file_id
        filename = payload.filename
        mime_type = payload.mime_type

        service = get_drive_service(session_id)

        with tempfile.TemporaryDirectory() as tmpdir:
            local_path = os.path.join(tmpdir, filename)

            if mime_type == "application/vnd.google-apps.document":
                export_google_doc(service, file_id, local_path)
                text = read_txt(local_path)
            else:
                download_file(service, file_id, local_path)

                if filename.lower().endswith(".pdf"):
                    text = read_pdf(local_path)
                elif filename.lower().endswith(".docx"):
                    text = read_docx(local_path)
                elif filename.lower().endswith(".txt"):
                    text = read_txt(local_path)
                else:
                    raise HTTPException(status_code=400, detail="Unsupported file type")

        if not text.strip():
            raise HTTPException(status_code=400, detail="File is empty")

        cache_key = f"{file_id}:{filename}"
        summary = summarize(text, cache_key)

        return {"summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/drive/files")
def get_drive_items(
    session_id: str = Query(...),
    folder_id: str | None = Query(default=None),
):
    """
    - If folder_id is None → list root items
    - Else → list items inside folder
    """
    try:
        service = get_drive_service(session_id)

        if folder_id:
            return list_folder_items(service, folder_id)
        else:
            return list_root_items(service)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))