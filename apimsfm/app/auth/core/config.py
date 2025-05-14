from pathlib import Path
from pydantic_settings import BaseSettings

class AuthSettings(BaseSettings):
    """
    Authentication-specific settings.
    
    These settings are separated from the main application settings to provide
    a clear boundary and make it easier to modify auth-related configurations.
    """
    # JWT settings
    JWT_SECRET_KEY: str = "MLKJHGFDSA1234567890QWERTYUIOPZXCVBHB" # Replace with a secure key in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1 
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Cookie settings
    ACCESS_COOKIE_NAME: str = "access_token"
    REFRESH_COOKIE_NAME: str = "refresh_token"
    COOKIE_SECURE: bool = False  # Set to True in production with HTTPS
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"
    
    # User profile settings
    PROFILE_PICTURES_DIR: Path = Path("data/users/profile")
    MAX_PROFILE_PIC_SIZE: int = 2 * 1024 * 1024  # 2 MB
    ALLOWED_MIME_TYPES: list[str] = ["image/jpeg", "image/png", "image/gif"]
    
    # User repository
    USERS_FILE: Path = Path("data/users/users.json")
    
    # Default Admin credentials
    DEFAULT_ADMIN_EMAIL: str = "admin@localhost.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"
    DEFAULT_ADMIN_FIRST_NAME: str = "Admin"
    DEFAULT_ADMIN_LAST_NAME: str = "User"



auth_settings = AuthSettings()