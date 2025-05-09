from typing import Optional
from fastapi import Cookie, HTTPException, status, Request, Depends

from app.auth.core.jwt import decode_access_token
from app.auth.enums.error_codes import AuthErrorCode
from app.auth.schemas.user import User, UserOut
from app.auth.repositories.user_repository import get_user_by_email
from app.auth.core.config import auth_settings
from app.auth.schemas.token import JWTPayload

async def get_current_user_token(
    request: Request,
    access_token: Optional[str] = Cookie(None, alias=auth_settings.ACCESS_COOKIE_NAME)
) -> Optional[str]:
    """
    Extract the current user's access token from cookies.
    
    Args:
        request: FastAPI request object
        access_token: Access token from cookies
        
    Returns:
        Access token if present, None otherwise
    """
    return access_token

async def get_optional_current_user(token: Optional[str] = Depends(get_current_user_token)) -> Optional[User]:
    """
    Get the current user from an access token (if present).
    
    Args:
        token: JWT access token
        
    Returns:
        User object if token is valid, None otherwise
    """
    if not token:
        return None
        
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
        
    return get_user_by_email(payload["sub"])

async def get_current_user(token: Optional[str] = Depends(get_current_user_token)) -> User:
    """
    Get the current user from an access token, raising an exception if not authenticated.
    
    Args:
        token: JWT access token
        
    Returns:
        User object
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.MISSING_TOKEN}
        )
        
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.INVALID_TOKEN}
        )
        
    user = get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": AuthErrorCode.USER_NOT_FOUND}
        )
        
    return user

async def get_current_user_data(token: Optional[str] = Depends(get_current_user_token)) -> UserOut:
    """
    Get current user data from token payload.
    
    Args:
        token: JWT access token
        
    Returns:
        UserOut object with public user data
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.MISSING_TOKEN}
        )
        
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.INVALID_TOKEN}
        )
        
    try:
        jwt_payload = JWTPayload(**payload)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.INVALID_TOKEN}
        )
        
    return UserOut(
        firstName=jwt_payload.firstName,
        lastName=jwt_payload.lastName,
        email=jwt_payload.sub,
        role=jwt_payload.role,
        profilePicture=jwt_payload.profilePicture,
        createdAt=jwt_payload.createdAt
    )

async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    """
    Verify that the current user is an admin.
    
    Args:
        user: Current user
        
    Returns:
        User object if admin
        
    Raises:
        HTTPException: If user is not an admin
    """
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "forbidden"}
        )
    return user