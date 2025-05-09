from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import uuid

from fastapi import HTTPException, Request, Response, UploadFile
from app.schemas.token import JWTPayload

from app.schemas.user import User, UserCreate, UserLogin, UserOut, UserSelfUpdate, UserPasswordUpdate, TokenPairResponse
from app.repositories.user_repository import (
    get_user_by_email,
    add_user,
    update_user_refresh_token,
    update_user_password,
    update_user_info,
)

from app.core.config import settings
from app.core.enums import ErrorCode
from app.core.security import hash_password, verify_password, generate_secure_token
from app.auth.jwt import create_access_token, decode_access_token
from app.core.enums import ErrorCode

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_EXPIRE_DAYS = 30

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Store access and refresh tokens in secure HTTP-only cookies."""
    response.set_cookie(ACCESS_COOKIE_NAME, access_token, httponly=True, samesite="Lax")
    response.set_cookie(REFRESH_COOKIE_NAME, refresh_token, httponly=True, samesite="Lax")

def clear_auth_cookies(response: Response):
    """Remove access and refresh token cookies to log the user out."""
    response.delete_cookie(ACCESS_COOKIE_NAME)
    response.delete_cookie(REFRESH_COOKIE_NAME)

def handle_register(user_data: UserCreate):
    """Register a new user after checking email uniqueness."""
    if get_user_by_email(user_data.email):
        raise HTTPException(status_code=400, detail={"code": ErrorCode.EMAIL_ALREADY_USED.value})

    user = User(
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        email=user_data.email,
        hashedPassword=hash_password(user_data.password),
        role="user",
        profilePicture=None,
        createdAt=datetime.utcnow(),
        refreshToken=None,
        refreshTokenExpiresAt=None
    )
    add_user(user)

    return {
        "message": "Register successful"
    }
    
def handle_login(credentials: UserLogin, response: Response) -> UserOut:
    """Authenticate a user and issue access/refresh tokens."""
    user = get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashedPassword):
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_CREDENTIALS.value})

    jwt_payload = JWTPayload(
        sub=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        role=user.role,
        profilePicture=user.profilePicture,
        createdAt=user.createdAt.isoformat()
    )
    access_token = create_access_token(jwt_payload.dict())

    refresh_token = generate_secure_token()
    refresh_token_expiry = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    update_user_refresh_token(user.email, refresh_token, refresh_token_expiry)
    set_auth_cookies(response, access_token, refresh_token)

    return UserOut(**user.dict())

def handle_refresh_token(request: Request, response: Response):
    """Generate a new access token using a valid refresh token."""
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    access_token = request.cookies.get(ACCESS_COOKIE_NAME)

    if not refresh_token or not access_token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.MISSING_TOKENS.value})

    payload = decode_access_token(access_token, ignore_exp=True)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN_PAYLOAD.value})

    email = payload["sub"]
    user = get_user_by_email(email)
    if not user or user.refreshToken != refresh_token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_REFRESH_TOKEN.value})

    if not user.refreshTokenExpiresAt or datetime.utcnow() > user.refreshTokenExpiresAt:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.REFRESH_TOKEN_EXPIRED.value})

    jwt_payload = JWTPayload(
        sub=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        role=user.role,
        profilePicture=user.profilePicture,
        createdAt=user.createdAt.isoformat()
    )
    new_access_token = create_access_token(jwt_payload.dict())
    new_refresh_token = generate_secure_token()
    new_expiry = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    update_user_refresh_token(user.email, new_refresh_token, new_expiry)
    set_auth_cookies(response, new_access_token, new_refresh_token)

    return {"message": "Tokens refreshed successfully"}

def handle_get_me(request: Request) -> UserOut:
    """Return the current user's public data using decoded JWT payload."""
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.MISSING_TOKEN.value})

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN.value})

    try:
        user_data = JWTPayload(**payload)
    except Exception:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN.value})

    return UserOut(
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        email=user_data.sub,
        role=user_data.role,
        profilePicture=user_data.profilePicture,
        createdAt=user_data.createdAt
    )

def handle_update_me(request: Request, updates: UserSelfUpdate) -> UserOut:
    """Update the authenticated user's profile in the database."""
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.MISSING_TOKEN.value})

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN.value})

    email = payload["sub"]
    updates_dict = updates.dict(exclude_unset=True)
    if not update_user_info(email, **updates_dict):
        raise HTTPException(status_code=404, detail={"code": ErrorCode.USER_NOT_FOUND.value})

    updated_user = get_user_by_email(email)
    return UserOut(**updated_user.dict())

def handle_change_password(request: Request, payload: UserPasswordUpdate):
    """Change the authenticated user's password."""
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.MISSING_TOKEN.value})

    payload_token = decode_access_token(token)
    if not payload_token or "sub" not in payload_token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN.value})

    email = payload_token["sub"]
    user = get_user_by_email(email)
    if not user or not verify_password(payload.oldPassword, user.hashedPassword):
        raise HTTPException(status_code=403, detail={"code": ErrorCode.INCORRECT_CURRENT_PASSWORD.value})

    if not update_user_password(email, hash_password(payload.newPassword)):
        raise HTTPException(status_code=500, detail={"code": ErrorCode.PASSWORD_UPDATE_FAILED.value})

    return {"message": "Password updated successfully"}

def handle_logout(response: Response):
    """Clear authentication cookies and log the user out."""
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}


def handle_upload_profile_picture(request: Request, file: UploadFile) -> str:


    MAX_PROFILE_PIC_SIZE = 2 * 1024 * 1024  # 2 Mo
    ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"]

    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.MISSING_TOKEN.value})

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN.value})

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail={"code": "invalid_file_format"})

    content = file.file.read()
    if len(content) > MAX_PROFILE_PIC_SIZE:
        raise HTTPException(status_code=400, detail={"code": "file_too_large"})

    extension = Path(file.filename).suffix
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = settings.PROFILE_PICTURES_DIR / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)

    email = payload["sub"]
    if not update_user_info(email, profilePicture=filename):
        raise HTTPException(status_code=404, detail={"code": ErrorCode.USER_NOT_FOUND.value})

    return filename


def handle_delete_profile_picture(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.MISSING_TOKEN.value})

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail={"code": ErrorCode.INVALID_TOKEN.value})

    email = payload["sub"]
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail={"code": ErrorCode.USER_NOT_FOUND.value})

    if user.profilePicture:
        file_path = settings.PROFILE_PICTURES_DIR / user.profilePicture
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                raise HTTPException(status_code=500, detail={"code": "profile_picture_deletion_failed"})
    
    update_user_info(email, profilePicture=None)

    return {"message": "Profile picture deleted successfully"}