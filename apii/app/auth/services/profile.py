import os
import uuid
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import HTTPException, UploadFile, status

from app.auth.schemas.user import User, UserOut, UserSelfUpdate, UserPasswordUpdate
from app.auth.core.security import verify_password, hash_password
from app.auth.repositories.user_repository import get_user_by_email, update_user_info, update_user_password
from app.auth.core.config import auth_settings
from app.auth.enums.error_codes import AuthErrorCode

def update_user_profile(user: User, updates: UserSelfUpdate) -> UserOut:
    """
    Update the authenticated user's profile in the database.
    
    Args:
        user: Current user
        updates: Profile updates
        
    Returns:
        Updated user data
        
    Raises:
        HTTPException: If user not found
    """
    updates_dict = updates.model_dump(exclude_unset=True)
    if not update_user_info(user.email, **updates_dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"code": AuthErrorCode.USER_NOT_FOUND}
        )

    updated_user = get_user_by_email(user.email)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"code": AuthErrorCode.USER_NOT_FOUND}
        )
        
    return UserOut(**updated_user.model_dump())

def change_user_password(user: User, payload: UserPasswordUpdate) -> Dict[str, str]:
    """
    Change the authenticated user's password.
    
    Args:
        user: Current user
        payload: Password change data
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If old password is incorrect or update fails
    """
    if not verify_password(payload.oldPassword, user.hashedPassword):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail={"code": AuthErrorCode.INCORRECT_CURRENT_PASSWORD}
        )

    if not update_user_password(user.email, hash_password(payload.newPassword)):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail={"code": AuthErrorCode.PASSWORD_UPDATE_FAILED}
        )

    return {"message": "Password updated successfully"}

def upload_profile_picture(user: User, file: UploadFile) -> str:
    """
    Upload a profile picture for the user.
    
    Args:
        user: Current user
        file: Uploaded file
        
    Returns:
        Filename of the uploaded picture
        
    Raises:
        HTTPException: If file format is invalid or file is too large
    """
    if file.content_type not in auth_settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={"code": AuthErrorCode.INVALID_FILE_FORMAT}
        )

    content = file.file.read()
    if len(content) > auth_settings.MAX_PROFILE_PIC_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={"code": AuthErrorCode.FILE_TOO_LARGE}
        )

    extension = Path(file.filename).suffix
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = auth_settings.PROFILE_PICTURES_DIR / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(file_path, "wb") as f:
        f.write(content)

    if not update_user_info(user.email, profilePicture=filename):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"code": AuthErrorCode.USER_NOT_FOUND}
        )

    return filename

def delete_profile_picture(user: User) -> Dict[str, str]:
    """
    Delete the user's profile picture.
    
    Args:
        user: Current user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If deletion fails
    """
    if user.profilePicture:
        file_path = auth_settings.PROFILE_PICTURES_DIR / user.profilePicture
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                    detail={"code": AuthErrorCode.PROFILE_PICTURE_DELETION_FAILED}
                )
    
    update_user_info(user.email, profilePicture=None)

    return {"message": "Profile picture deleted successfully"}