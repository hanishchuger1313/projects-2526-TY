from typing import List
import secrets
from dotenv import load_dotenv

# 🔥 Load env
load_dotenv()

try:
    from pydantic_settings import BaseSettings
except ModuleNotFoundError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    database_name: str = "stcg_db"

    secret_key: str = secrets.token_urlsafe(32)
    session_days: int = 7
    cookie_name: str = "stcg_session"

    cookie_samesite: str = "lax"
    cookie_secure: bool = False

    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

    max_file_size_mb: int = 0
    allowed_file_types: List[str] = [".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg"]

    ocr_enabled: bool = True
    tesseract_path: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    poppler_path: str = r"C:\Poppler\poppler-25.12.0\Library\bin"

    tesseract_config: str = "--oem 3 --psm 6 -l eng"
    ocr_dpi: int = 250
    ocr_max_pages: int = 20
    ocr_stop_after_chars: int = 20000

    min_password_length: int = 8
    max_requirements_per_doc: int = 0
    min_text_length: int = 10

    validation_threshold: int = 70

    # 🔥 ONLY THIS LINE (CORRECT)
    openai_api_key: str

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()