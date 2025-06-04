from fastapi import APIRouter, Depends, Response, File, UploadFile, status
from typing import Dict, Any

from app.auth.schemas.user import User, UserOut, UserSelfUpdate, UserPasswordUpdate
from app.auth.services.profile import update_user_profile, change_user_password, upload_profile_picture, delete_profile_picture
from app.auth.api.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.patch("/", response_model=UserOut, summary="Update user profile")
def update_me(
    updates: UserSelfUpdate,
    user: User = Depends(get_current_user)
) -> UserOut:
    """
    Update the current user's profile information.
    
    Args:
        updates: Profile updates
        user: Current authenticated user
        
    Returns:
        Updated user information
    """
    return update_user_profile(user, updates)

@router.post("/change-password", summary="Change user password")
def change_password(
    payload: UserPasswordUpdate,
    user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Change the current user's password.
    
    Args:
        payload: Password change data
        user: Current authenticated user
        
    Returns:
        A success message
    """
    return change_user_password(user, payload)

@router.post("/picture", summary="Upload profile picture")
def upload_picture(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Upload a profile picture for the current user.
    
    Args:
        file: Uploaded image file
        user: Current authenticated user
        
    Returns:
        Information about the uploaded file
    """
    filename = upload_profile_picture(user, file)
    return {"filename": filename}

@router.delete("/picture", summary="Delete profile picture")
def remove_picture(user: User = Depends(get_current_user)) -> Dict[str, str]:
    """
    Delete the current user's profile picture.
    
    Args:
        user: Current authenticated user
        
    Returns:
        A success message
    """
    return delete_profile_picture(user)