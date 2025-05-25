# Modification de app/auth/core/config.py

from pathlib import Path
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

class AuthSettings(BaseSettings):
    """
    Authentication-specific settings.
    
    These settings are separated from the main application settings to provide
    a clear boundary and make it easier to modify auth-related configurations.
    """
    # JWT settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "MLKJHGFDSA1234567890QWERTYUIOPZXCVBHB")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Cookie settings
    ACCESS_COOKIE_NAME: str = os.getenv("ACCESS_COOKIE_NAME", "access_token")
    REFRESH_COOKIE_NAME: str = os.getenv("REFRESH_COOKIE_NAME", "refresh_token")
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "False").lower() in ("true", "1", "t")
    COOKIE_HTTPONLY: bool = os.getenv("COOKIE_HTTPONLY", "True").lower() in ("true", "1", "t")
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")
    
    # User profile settings
    PROFILE_PICTURES_DIR: Path = Path(os.getenv("PROFILE_PICTURES_DIR", "data/users/profile"))
    MAX_PROFILE_PIC_SIZE: int = int(os.getenv("MAX_PROFILE_PIC_SIZE", str(2 * 1024 * 1024)))  # 2 MB
    ALLOWED_MIME_TYPES: list[str] = os.getenv("ALLOWED_MIME_TYPES", "image/jpeg,image/png,image/gif").split(",")
    
    # User repository
    USERS_FILE: Path = Path(os.getenv("USERS_FILE", "data/users/users.json"))
    
    # Default Admin credentials
    DEFAULT_ADMIN_EMAIL: str = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@localhost.com")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    DEFAULT_ADMIN_FIRST_NAME: str = os.getenv("DEFAULT_ADMIN_FIRST_NAME", "MAXENCE")
    DEFAULT_ADMIN_LAST_NAME: str = os.getenv("DEFAULT_ADMIN_LAST_NAME", "LAMBARD")

app_env = os.getenv("APP_ENV", "dev")
env_file = f".env.{app_env}"

if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    # Fallback to standard .env if the specific file doesn't exist
    load_dotenv()
    
auth_settings = AuthSettings()