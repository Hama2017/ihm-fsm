# app/auth/api/routes/authentication.py
from fastapi import APIRouter, Response, Request, Depends, Cookie
from typing import Dict, Any, Optional

from app.auth.schemas.user import UserCreate, UserLogin, UserOut
from app.auth.services.authentication import register_user, login_user, refresh_tokens, logout_user
from app.auth.api.dependencies import get_current_user_data
from app.auth.core.config import auth_settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", summary="Register a new user")
def register(user_data: UserCreate) -> Dict[str, str]:
    """
    Register a new user with the provided information.
    
    Args:
        user_data: User registration data
        
    Returns:
        A success message
    """
    return register_user(user_data)

@router.post("/login", response_model=UserOut, summary="Log in a user")
def login(
    credentials: UserLogin, 
    response: Response
) -> UserOut:
    """
    Authenticate a user and set authentication cookies.
    
    Args:
        credentials: User login credentials
        response: FastAPI response object
        
    Returns:
        User information
    """
    return login_user(credentials, response)

# app/auth/api/routes/authentication.py (continued)
@router.post("/refresh", summary="Refresh authentication tokens")
def refresh(
    request: Request, 
    response: Response,
    refresh_token: Optional[str] = Cookie(None, alias=auth_settings.REFRESH_COOKIE_NAME),
    access_token: Optional[str] = Cookie(None, alias=auth_settings.ACCESS_COOKIE_NAME),
) -> Dict[str, str]:
    """
    Refresh authentication tokens using a valid refresh token.
    
    Args:
        request: FastAPI request object
        response: FastAPI response object
        refresh_token: Current refresh token (from cookie)
        access_token: Current access token (from cookie)
        
    Returns:
        A success message
    """
    return refresh_tokens(refresh_token, access_token, response)

@router.get("/me", response_model=UserOut, summary="Get current user information")
def get_me(current_user: UserOut = Depends(get_current_user_data)) -> UserOut:
    """
    Get the currently authenticated user's information.
    
    Args:
        current_user: Current user data from token
        
    Returns:
        User information
    """
    return current_user

@router.post("/logout", summary="Log out the current user")
def logout(response: Response) -> Dict[str, str]:
    """
    Log out the current user by clearing authentication cookies.
    
    Args:
        response: FastAPI response object
        
    Returns:
        A success message
    """
    return logout_user(response)