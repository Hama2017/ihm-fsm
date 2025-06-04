from typing import Optional
from fastapi import Cookie, HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

from app.auth.core.jwt import decode_access_token
from app.auth.enums.error_codes import AuthErrorCode
from app.auth.enums.roles import UserRole
from app.auth.schemas.user import User
from app.auth.repositories.user_repository import get_user_by_email
from app.auth.core.config import auth_settings

# Setup bearer token authentication
oauth2_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(oauth2_scheme),
    access_token: Optional[str] = Cookie(None, alias=auth_settings.ACCESS_COOKIE_NAME)
) -> User:
    """
    Validate access token from either cookie or Authorization header and get the current user.
    
    This function tries both authentication methods:
    1. Bearer token in Authorization header (for API clients)
    2. HTTP-only cookie (for web clients)
    
    Args:
        request: FastAPI request object
        credentials: Bearer token credentials
        access_token: Access token from cookie
        
    Returns:
        User object
        
    Raises:
        HTTPException: If authentication fails
    """
    # Check both authentication methods
    token = None
    
    # First try Bearer token from Authorization header
    if credentials and credentials.credentials:
        token = credentials.credentials
    # Then try cookie-based authentication
    elif access_token:
        token = access_token
    
    # If no token found in either place, authentication fails
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.MISSING_TOKEN},
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validate the token
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": AuthErrorCode.INVALID_TOKEN},
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the user from the database
    user = get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": AuthErrorCode.USER_NOT_FOUND},
        )
    
    return user

async def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(oauth2_scheme),
    access_token: Optional[str] = Cookie(None, alias=auth_settings.ACCESS_COOKIE_NAME)
) -> Optional[User]:
    """
    Get the current user from an access token (if present) from either cookie or header.
    Does not raise an exception if authentication fails.
    
    Args:
        request: FastAPI request object
        credentials: Bearer token credentials
        access_token: Access token from cookie
        
    Returns:
        User object if token is valid, None otherwise
    """
    try:
        return await get_current_user(request, credentials, access_token)
    except HTTPException:
        return None

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
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": AuthErrorCode.INSUFFICIENT_PERMISSIONS}
        )
    return user