from pathlib import Path
from googleapiclient.http import MediaIoBaseDownload

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}
GOOGLE_DOC_MIME = "application/vnd.google-apps.document"
GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder"


def list_root_items(service):
    """
    List top-level folders and files from My Drive (NOT recent files)
    """
    query = "'root' in parents and trashed=false"

    results = service.files().list(
        q=query,
        fields="files(id, name, mimeType)",
        orderBy="folder,name",
    ).execute()

    return results.get("files", [])


def list_folder_items(service, folder_id: str):
    """
    List folders and files inside a specific folder
    """
    query = f"'{folder_id}' in parents and trashed=false"

    results = service.files().list(
        q=query,
        fields="files(id, name, mimeType)",
        orderBy="folder,name",
    ).execute()

    return results.get("files", [])


def download_file(service, file_id: str, filename: str):
    request = service.files().get_media(fileId=file_id)

    with open(filename, "wb") as f:
        downloader = MediaIoBaseDownload(f, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()


def export_google_doc(service, file_id: str, filename: str):
    request = service.files().export_media(
        fileId=file_id,
        mimeType="text/plain",
    )

    with open(filename, "wb") as f:
        downloader = MediaIoBaseDownload(f, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
