from fastapi import APIRouter, HTTPException, Response, Request, status
from fastapi import UploadFile, File
from app.auth.service import handle_upload_profile_picture,handle_delete_profile_picture
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenPairResponse, UserPasswordUpdate, UserSelfUpdate
from app.auth.service import (
    handle_register,
    handle_login,
    handle_refresh_token,
    handle_get_me,
    handle_logout,
    handle_update_me,
    handle_change_password
)

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user_data: UserCreate):
    return handle_register(user_data)

@router.post("/login", response_model=UserOut)
def login(credentials: UserLogin, response: Response):
    return handle_login(credentials, response)

@router.post("/refresh")
def refresh(request: Request, response: Response):
    return handle_refresh_token(request, response)

@router.get("/me", response_model=UserOut)
def get_me(request: Request):
    return handle_get_me(request)

@router.post("/logout")
def logout(response: Response):
    return handle_logout(response)

@router.patch("/me", response_model=UserOut)
def update_me(request: Request, updates: UserSelfUpdate):
    return handle_update_me(request, updates)

@router.post("/me/change-password")
def change_password(request: Request, payload: UserPasswordUpdate):
    return handle_change_password(request, payload)


@router.post("/me/profile-picture")
def upload_profile_picture(request: Request, file: UploadFile = File(...)):
    filename = handle_upload_profile_picture(request, file)
    return {"filename": filename}


@router.delete("/me/profile-picture")
def delete_profile_picture(request: Request):
    return handle_delete_profile_picture(request)

