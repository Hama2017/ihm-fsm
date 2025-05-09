# app/main.py (updated)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.smart_contract import router as smart_contract_router
from app.api.routes.automaton_contract import router as automaton_contract_router
from app.api.routes.package import router as package_router
from app.api.routes.history import router as history_router
from app.auth.api.routes import router as auth_router  # Import the new auth router

from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    summary=settings.API_SUMMARY,
    version=settings.API_VERSION
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# API prefix
api_prefix = settings.API_PREFIX

# Register routers
app.include_router(smart_contract_router, prefix=api_prefix, tags=["Smart Contracts"])
app.include_router(automaton_contract_router, prefix=api_prefix, tags=["Automaton Contracts"])
app.include_router(package_router, prefix=api_prefix, tags=["Packages"])
app.include_router(history_router, prefix=api_prefix, tags=["History"])
app.include_router(auth_router, prefix=api_prefix)  # Include the auth router

# Ensure required directories exist at startup
settings.setup_directories()

# Make sure auth directories also exist
from app.auth.core.config import auth_settings
auth_settings.PROFILE_PICTURES_DIR.mkdir(parents=True, exist_ok=True)
auth_settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)