from google.oauth2.credentials import Credentials
import os
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

# SCOPES = [
#     "openid",
#     "email",
#     "profile",
#     "https://www.googleapis.com/auth/drive.readonly",
# ]

SCOPES = [[
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.readonly",
]]

def get_drive_service(auth_code: str):
    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=SCOPES,
        redirect_uri="postmessage"
    )

    flow.fetch_token(code=auth_code)
    creds: Credentials = flow.credentials

    return build("drive", "v3", credentials=creds)
