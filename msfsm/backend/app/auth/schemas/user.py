from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.auth.enums.roles import UserRole

# Base model for internal user data
class User(BaseModel):
    """Complete user model with all fields."""
    firstName: str
    lastName: str
    email: EmailStr
    hashedPassword: str
    role: str = UserRole.USER
    profilePicture: Optional[str] = None
    createdAt: datetime
    refreshToken: Optional[str] = None
    refreshTokenExpiresAt: Optional[datetime] = None

# Schema used to create a user
class UserCreate(BaseModel):
    """Schema for user registration."""
    firstName: str
    lastName: str
    email: EmailStr
    password: str

# Schema used to log in
class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str

# Schema for returned user data
class UserOut(BaseModel):
    """Schema for user information returned to clients."""
    firstName: str
    lastName: str
    email: EmailStr
    role: str
    profilePicture: Optional[str] = None
    createdAt: datetime

# Schema used to update user by admin
class UserUpdate(BaseModel):
    """Schema for admin user updates."""
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    profilePicture: Optional[str] = None

# Schema used to update user by themselves
class UserSelfUpdate(BaseModel):
    """Schema for user self-updates."""
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    profilePicture: Optional[str] = None

# Schema for password update
class UserPasswordUpdate(BaseModel):
    """Schema for password updates."""
    oldPassword: str
    newPassword: str