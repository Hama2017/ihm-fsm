import json
from typing import Optional, List
from datetime import datetime

from app.auth.schemas.user import User
from app.auth.core.config import auth_settings

def load_users() -> List[User]:
    """
    Load all users from the JSON file.
    
    Returns:
        List of User objects
    """
    if not auth_settings.USERS_FILE.exists():
        auth_settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        auth_settings.USERS_FILE.write_text("[]")
    
    with auth_settings.USERS_FILE.open("r") as f:
        return [User(**user) for user in json.load(f)]

def save_users(users: List[User]) -> None:
    """
    Save users to the JSON file.
    
    Args:
        users: List of User objects to save
    """
    auth_settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with auth_settings.USERS_FILE.open("w") as f:
        json.dump([user.model_dump() for user in users], f, indent=2, default=str)

def get_user_by_email(email: str) -> Optional[User]:
    """
    Find a user by email.
    
    Args:
        email: Email to search for
        
    Returns:
        User object if found, None otherwise
    """
    users = load_users()
    return next((user for user in users if user.email == email), None)

def add_user(user: User) -> None:
    """
    Add a new user.
    
    Args:
        user: User object to add
    """
    users = load_users()
    users.append(user)
    save_users(users)

def update_user_refresh_token(email: str, refreshToken: str, refreshTokenExpiresAt: datetime) -> None:
    """
    Update user's refresh token.
    
    Args:
        email: User's email
        refreshToken: New refresh token
        refreshTokenExpiresAt: Expiration timestamp
    """
    users = load_users()
    for user in users:
        if user.email == email:
            user.refreshToken = refreshToken
            user.refreshTokenExpiresAt = refreshTokenExpiresAt
            break
    save_users(users)

def delete_user_by_email(email: str) -> bool:
    """
    Delete a user by email.
    
    Args:
        email: Email of the user to delete
        
    Returns:
        True if user was deleted, False if not found
    """
    users = load_users()
    new_users = [user for user in users if user.email != email]
    if len(new_users) == len(users):
        return False
    save_users(new_users)
    return True

def update_user_info(
    email: str,
    firstName: Optional[str] = None,
    lastName: Optional[str] = None,
    role: Optional[str] = None,
    profilePicture: Optional[str] = None
) -> bool:
    """
    Update user information.
    
    Args:
        email: User's email
        firstName: New first name (optional)
        lastName: New last name (optional)
        role: New role (optional)
        profilePicture: New profile picture (optional)
        
    Returns:
        True if user was updated, False if not found
    """
    users = load_users()
    updated = False
    for user in users:
        if user.email == email:
            if firstName is not None:
                user.firstName = firstName
            if lastName is not None:
                user.lastName = lastName
            if role is not None:
                user.role = role
            if profilePicture is not None:
                user.profilePicture = profilePicture
            updated = True
            break
    if updated:
        save_users(users)
    return updated

def update_user_password(email: str, hashedPassword: str) -> bool:
    """
    Update user's password.
    
    Args:
        email: User's email
        hashedPassword: New hashed password
        
    Returns:
        True if password was updated, False if user not found
    """
    users = load_users()
    for user in users:
        if user.email == email:
            user.hashedPassword = hashedPassword
            save_users(users)
            return True
    return False