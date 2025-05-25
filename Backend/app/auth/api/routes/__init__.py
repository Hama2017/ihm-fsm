# app/auth/api/routes/__init__.py
"""
Authentication and user profile routes.
"""
from fastapi import APIRouter

from app.auth.api.routes.authentication import router as auth_router
from app.auth.api.routes.profile import router as profile_router

# Create a combined router for all auth-related endpoints
router = APIRouter()

# Include the individual routers
router.include_router(auth_router)
router.include_router(profile_router)