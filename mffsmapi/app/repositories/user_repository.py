import json
from typing import Optional, List
from pathlib import Path
from datetime import datetime

from app.schemas.user import User
from app.core.config import settings

def load_users() -> List[User]:
    if not settings.USERS_FILE.exists():
        settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        settings.USERS_FILE.write_text("[]")
    with settings.USERS_FILE.open("r") as f:
        return [User(**user) for user in json.load(f)]

def save_users(users: List[User]) -> None:
    with settings.USERS_FILE.open("w") as f:
        json.dump([user.model_dump() for user in users], f, indent=2, default=str)

def get_user_by_email(email: str) -> Optional[User]:
    users = load_users()
    return next((user for user in users if user.email == email), None)

def add_user(user: User) -> None:
    users = load_users()
    users.append(user)
    save_users(users)

def update_user_refresh_token(email: str, refreshToken: str, refreshTokenExpiresAt: datetime) -> None:
    users = load_users()
    for user in users:
        if user.email == email:
            user.refreshToken = refreshToken
            user.refreshTokenExpiresAt = refreshTokenExpiresAt
            break
    save_users(users)


def delete_user_by_email(email: str) -> bool:
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
    users = load_users()
    for user in users:
        if user.email == email:
            user.hashedPassword = hashedPassword
            save_users(users)
            return True
    return False
