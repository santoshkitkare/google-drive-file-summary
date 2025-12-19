import os
import uuid
from typing import Dict
from app.core.config import settings

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.discovery import build as build_api

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.readonly",
]

# In-memory session store
_SESSION_STORE: Dict[str, dict] = {}


def login_with_google(auth_code: str) -> str:
    print("Starting OAuth flow with auth code:", auth_code)
    if os.path.exists("credentials.json"):
        print
        flow = Flow.from_client_secrets_file(
            "credentials.json",
            scopes=SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URL,
        )
    else:
        print("Using client config from environment variables")
        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uris": [settings.GOOGLE_REDIRECT_URL],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URL,
        )
        print("OAuth flow created with client config")
    flow.fetch_token(code=auth_code)
    creds: Credentials = flow.credentials

    print("OAuth flow completed, credentials obtained")
    # Fetch user info explicitly (stable)
    oauth2_service = build_api(
        "oauth2", "v2", credentials=creds, cache_discovery=False
    )
    user_info = oauth2_service.userinfo().get().execute()
    print("User info retrieved:", user_info)

    session_id = str(uuid.uuid4())
    print("Generated session ID:", session_id)

    _SESSION_STORE[session_id] = {
        "credentials": creds,
        "email": user_info.get("email"),
        "name": user_info.get("name"),
    }

    print("Session stored for user:", user_info.get("email"))
    return session_id


def get_session(session_id: str) -> dict:
    session = _SESSION_STORE.get(session_id)
    if not session:
        raise ValueError("Session expired or invalid")
    return session


def get_drive_service(session_id: str):
    session = get_session(session_id)
    return build("drive", "v3", credentials=session["credentials"])
