from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build


def get_drive_service(auth_code: str):
    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=["https://www.googleapis.com/auth/drive.readonly"],
        redirect_uri="http://localhost:5173",
    )

    flow.fetch_token(code=auth_code)
    creds: Credentials = flow.credentials

    return build("drive", "v3", credentials=creds)
