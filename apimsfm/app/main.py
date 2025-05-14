from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.smart_contract import router as smart_contract_router
from app.api.routes.automaton_contract import router as automaton_contract_router
from app.api.routes.package import router as package_router
from app.api.routes.history import router as history_router
from app.auth.api.routes import router as auth_router
from app.api_keys.routes.api_key_routes import router as api_key_router

from app.middleware.api_key import APIKeyMiddleware
from app.core.config import settings
from app.startup import app_lifespan

# FastAPI app instance with security and docs config
app = FastAPI(
    title=settings.API_TITLE,
    description=(
        settings.API_DESCRIPTION + "\n\n"
        "## 🔐 Authentication\n\n"
        "This API supports two authentication mechanisms:\n\n"
        "1. **Bearer Token** (for API clients):\n"
        "   Use the header: `Authorization: Bearer your_token_here`\n\n"
        "2. **HTTP-only Cookies** (for web clients):\n"
        "   Automatically set via `/auth/login`\n\n"
        "## 🔑 API Key Requirement\n\n"
        "All endpoints require an API key header:\n"
        "`X-API-KEY: your_api_key_here`\n\n"
        "⚠️ Without it, you'll get 403 Forbidden."
    ),
    version=settings.API_VERSION,
    summary=settings.API_SUMMARY,
    lifespan=app_lifespan,  # Use the modern FastAPI lifespan
)

# Apply API key middleware
app.add_middleware(APIKeyMiddleware)

# Apply CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Define API prefix
api_prefix = settings.API_PREFIX

# Register routes with tags
app.include_router(smart_contract_router, prefix=api_prefix, tags=["Smart Contracts"])
app.include_router(automaton_contract_router, prefix=api_prefix, tags=["Automaton Contracts"])
app.include_router(package_router, prefix=api_prefix, tags=["Packages"])
app.include_router(history_router, prefix=api_prefix, tags=["History"])
app.include_router(auth_router, prefix=api_prefix)
app.include_router(api_key_router, prefix=api_prefix, tags=["API Keys"])
