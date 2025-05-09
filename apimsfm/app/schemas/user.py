from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Base model for internal user data
class User(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    hashedPassword: str
    role: Optional[str] = "user"
    profilePicture: Optional[str] = None
    createdAt: datetime
    refreshToken: Optional[str] = None
    refreshTokenExpiresAt: Optional[datetime] = None


# Schema used to create a user
class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str

# Schema used to log in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for returned user data
class UserOut(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    role: str
    profilePicture: Optional[str] = None
    createdAt: datetime

# Schema used to update user by admin
class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    profilePicture: Optional[str] = None

#Schema used to update user by themselves
class UserSelfUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    profilePicture: Optional[str] = None

# Schema for password update
class UserPasswordUpdate(BaseModel):
    oldPassword: str
    newPassword: str

#  Schema for token pair
class TokenPairResponse(BaseModel):
    accessToken: str
    refreshToken: str