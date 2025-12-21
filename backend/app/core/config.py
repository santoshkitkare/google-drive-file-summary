import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    GOOGLE_SCOPES = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/drive.readonly",
    ]

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    MAX_SUMMARY_WORDS = 300
    MAX_TEXT_CHARS = 12000
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URL = os.getenv("GOOGLE_REDIRECT_URL", "postmessage")
    SESSION_SECRET = os.getenv("SESSION_SECRET")


settings = Settings()
