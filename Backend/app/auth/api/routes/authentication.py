from fastapi import APIRouter, Response, Request, Depends, Cookie
from typing import Dict, Any, Optional

from app.auth.schemas.token import TokenPairResponse
from app.auth.schemas.user import UserCreate, UserLogin, UserOut
from app.auth.services.authentication import register_user, login_user, refresh_tokens, logout_user
from app.auth.api.dependencies import get_current_user
from app.auth.core.config import auth_settings
from app.auth.schemas.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", summary="Register a new user")
def register(user_data: UserCreate) -> Dict[str, str]:
    """
    Register a new user with the provided information.
    """
    return register_user(user_data)

@router.post("/login", summary="Log in a user")
def login(
    credentials: UserLogin, 
    response: Response
) -> Dict[str, Any]:
    """
    Authenticate a user and set authentication cookies.
    Also returns tokens in response body for API clients.
    """
    return login_user(credentials, response)

@router.post("/refresh", summary="Refresh authentication tokens")
def refresh(
    request: Request, 
    response: Response,
    refresh_token: Optional[str] = Cookie(None, alias=auth_settings.REFRESH_COOKIE_NAME),
    access_token: Optional[str] = Cookie(None, alias=auth_settings.ACCESS_COOKIE_NAME),
) -> TokenPairResponse:
    """
    Refresh authentication tokens using a valid refresh token.
    """
    return refresh_tokens(refresh_token, access_token, response)

@router.get("/me", response_model=UserOut, summary="Get current user information")
def get_me(user: User = Depends(get_current_user)) -> UserOut:
    """
    Get the currently authenticated user's information.
    """
    return UserOut(**user.model_dump())

@router.post("/logout", summary="Log out the current user")
def logout(response: Response) -> Dict[str, str]:
    """
    Log out the current user by clearing authentication cookies.
    """
    return logout_user(response)