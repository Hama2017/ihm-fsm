from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple

from fastapi import HTTPException, Response, status
from fastapi.responses import JSONResponse

from app.auth.enums.roles import UserRole
from app.auth.schemas.user import User, UserCreate, UserLogin, UserOut
from app.auth.schemas.token import JWTPayload,TokenPairResponse
from app.auth.repositories.user_repository import get_user_by_email, add_user, update_user_refresh_token
from app.auth.core.security import hash_password, verify_password, generate_secure_token
from app.auth.core.jwt import create_access_token, decode_access_token
from app.auth.core.config import auth_settings
from app.auth.enums.error_codes import AuthErrorCode

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """
    Store access and refresh tokens in secure HTTP-only cookies.
    
    Args:
        response: FastAPI response object
        access_token: JWT access token
        refresh_token: Refresh token for token renewal
    """
    response.set_cookie(
        auth_settings.ACCESS_COOKIE_NAME, 
        access_token, 
        httponly=auth_settings.COOKIE_HTTPONLY, 
        secure=auth_settings.COOKIE_SECURE,
        samesite=auth_settings.COOKIE_SAMESITE
    )
    
    response.set_cookie(
        auth_settings.REFRESH_COOKIE_NAME, 
        refresh_token, 
        httponly=auth_settings.COOKIE_HTTPONLY, 
        secure=auth_settings.COOKIE_SECURE,
        samesite=auth_settings.COOKIE_SAMESITE
    )

def clear_auth_cookies(response: Response) -> None:
    """
    Remove access and refresh token cookies to log the user out.
    
    Args:
        response: FastAPI response object
    """
    response.delete_cookie(auth_settings.ACCESS_COOKIE_NAME)
    response.delete_cookie(auth_settings.REFRESH_COOKIE_NAME)

def register_user(user_data: UserCreate) -> Dict[str, str]:
    """
    Register a new user after checking email uniqueness.
    
    Args:
        user_data: User registration data
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If email is already in use
    """
    if get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={"code": AuthErrorCode.EMAIL_ALREADY_USED}
        )

    user = User(
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        email=user_data.email,
        hashedPassword=hash_password(user_data.password),
        role=UserRole.USER,
        profilePicture=None,
        createdAt=datetime.now(timezone.utc),
        refreshToken=None,
        refreshTokenExpiresAt=None
    )
    add_user(user)

    return {"message": "Register successful"}


def login_user(credentials: UserLogin, response: Response) -> Dict[str, Any]:
    """
    Authenticate a user and issue access/refresh tokens.
    
    Args:
        credentials: User login credentials
        response: FastAPI response object
        
    Returns:
        User data and tokens
    """
    user = get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashedPassword):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": AuthErrorCode.INVALID_CREDENTIALS}
        )

    jwt_payload = JWTPayload(
        sub=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        role=user.role,
        profilePicture=user.profilePicture,
        createdAt=user.createdAt.isoformat()
    )
    access_token = create_access_token(jwt_payload.model_dump())

    refresh_token = generate_secure_token()
    refresh_token_expiry = datetime.now(timezone.utc) + timedelta(days=auth_settings.REFRESH_TOKEN_EXPIRE_DAYS)
    update_user_refresh_token(user.email, refresh_token, refresh_token_expiry)
    
    # Set cookies for web clients
    set_auth_cookies(response, access_token, refresh_token)
    
    # Return user data with tokens for API clients
    user_out = UserOut(**user.model_dump())
    return {
        "user": user_out,
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

def refresh_tokens(
    refresh_token: Optional[str], 
    access_token: Optional[str], 
    response: Response
) -> TokenPairResponse:
    """
    Generate a new access token using a valid refresh token.
    
    Args:
        refresh_token: Current refresh token
        access_token: Current access token
        response: FastAPI response object
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If tokens are invalid or expired
    """
    if not refresh_token or not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": AuthErrorCode.MISSING_TOKENS}
        )

    payload = decode_access_token(access_token, ignore_exp=True)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": AuthErrorCode.INVALID_TOKEN_PAYLOAD}
        )

    email = payload["sub"]
    user = get_user_by_email(email)
    if not user or user.refreshToken != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": AuthErrorCode.INVALID_REFRESH_TOKEN}
        )

    if not user.refreshTokenExpiresAt or datetime.now(timezone.utc) > user.refreshTokenExpiresAt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": AuthErrorCode.REFRESH_TOKEN_EXPIRED}
        )

    jwt_payload = JWTPayload(
        sub=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        role=user.role,
        profilePicture=user.profilePicture,
        createdAt=user.createdAt.isoformat()
    )
    new_access_token = create_access_token(jwt_payload.model_dump())
    new_refresh_token = generate_secure_token()
    new_expiry = datetime.now(timezone.utc) + timedelta(days=auth_settings.REFRESH_TOKEN_EXPIRE_DAYS)
    update_user_refresh_token(user.email, new_refresh_token, new_expiry)
    
    set_auth_cookies(response, new_access_token, new_refresh_token)

    return TokenPairResponse(
        accessToken=new_access_token,
        refreshToken=new_refresh_token
    )

def logout_user(response: Response) -> Dict[str, str]:
    """
    Clear authentication cookies and log the user out.
    
    Args:
        response: FastAPI response object
        
    Returns:
        Success message
    """
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}