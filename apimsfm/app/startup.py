from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.utils.openapi import add_api_key_security_schema
from app.core.bootstrap import run_bootstrap
from app.core.config import settings
from app.auth.core.config import auth_settings

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    """
    Lifespan context for FastAPI.
    Runs once at startup, handles:
    - Swagger API key schema injection
    - Directory setup
    - Default user and API key bootstrap
    """
    # Swagger X-API-KEY integration
    add_api_key_security_schema(app)

    # Create required directories
    settings.setup_directories()
    auth_settings.PROFILE_PICTURES_DIR.mkdir(parents=True, exist_ok=True)
    auth_settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Ensure admin + master API key exist
    run_bootstrap()

    yield  # App is running

    # Optional: shutdown logic
