from fastapi import APIRouter, Depends, HTTPException
from app.auth.api.dependencies import get_current_user
from app.auth.schemas.user import User
from app.api_keys.schemas.api_key_schema import APIKeyCreate, APIKeyOut, APIKeyUpdate
from app.api_keys.services import api_key_service
from app.auth.enums.roles import UserRole

# Create a router for admin-only API key management endpoints
router = APIRouter(prefix="/admin/api-keys", tags=["API Keys"])

# Dependency that ensures the user is an admin
def require_admin(user: User = Depends(get_current_user)):
    """
    Ensures that the authenticated user has the admin role.
    Raises HTTP 403 if not.
    """
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get(
    "/",
    response_model=list[APIKeyOut],
    summary="List all API keys",
    description="Returns a list of all registered API keys. Admin access required."
)
def list_keys(user: User = Depends(require_admin)):
    """
    List all API keys in the system.
    Only accessible to admin users.
    """
    return api_key_service.list_api_keys()

@router.post(
    "/",
    response_model=APIKeyOut,
    summary="Create a new API key",
    description="Generates and returns a new API key with the specified configuration. Admin access required."
)
def create_key(data: APIKeyCreate, user: User = Depends(require_admin)):
    """
    Create a new API key with the given parameters.
    """
    return api_key_service.create_api_key(data)

@router.patch(
    "/{key}",
    response_model=APIKeyOut,
    summary="Update an API key",
    description="Updates the label, permissions, or status of an existing API key. Admin access required."
)
def update_key(key: str, data: APIKeyUpdate, user: User = Depends(require_admin)):
    """
    Update an existing API key by its unique key string.
    """
    return api_key_service.update_api_key(key, data)

@router.patch(
    "/{key}/disable",
    summary="Disable an API key",
    description="Disables the specified API key, making it unusable. Admin access required."
)
def disable_key(key: str, user: User = Depends(require_admin)):
    """
    Disable the API key to prevent further usage.
    """
    return api_key_service.disable_api_key(key)

@router.delete(
    "/{key}",
    summary="Delete an API key",
    description="Permanently deletes the specified API key from the system. Admin access required."
)
def delete_key(key: str, user: User = Depends(require_admin)):
    """
    Delete the API key from the database.
    """
    return api_key_service.delete_api_key(key)
