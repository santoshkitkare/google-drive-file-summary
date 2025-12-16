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
    MAX_SUMMARY_WORDS = 300
    MAX_TEXT_CHARS = 12000


settings = Settings()
