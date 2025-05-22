from fastapi import APIRouter, Depends, status
from typing import List

from app.services.package_service import PackageService
from app.schemas.package import PackageModel
from app.api.dependencies import get_package_service
from app.auth.api.dependencies import get_current_user, get_admin_user
from app.auth.schemas.user import User

router = APIRouter(prefix="/packages", tags=["Packages"])

@router.get(
    "/",
    summary="Get all packages",
    response_description="All packages"
)
def get_all_packages(
    user: User = Depends(get_current_user),
    service: PackageService = Depends(get_package_service)
) -> List[PackageModel]:
    """
    Get all available packages.
    
    This endpoint requires authentication.
    """
    return service.get_all_packages()

@router.post(
    "/",
    summary="Create a package",
    response_description="The created package",
    status_code=status.HTTP_201_CREATED
)
def create_package(
    package: PackageModel,
    user: User = Depends(get_admin_user),  # Admin only
    service: PackageService = Depends(get_package_service)
) -> PackageModel:
    """
    Create a new package.
    
    This endpoint requires administrator privileges.
    """
    return service.create_package(package)

@router.get(
    "/{id}",
    summary="Get a package by ID",
    response_description="The package"
)
def get_package(
    id: str,
    user: User = Depends(get_current_user),
    service: PackageService = Depends(get_package_service)
) -> PackageModel:
    """
    Get a package by its ID.
    
    This endpoint requires authentication.
    """
    return service.get_package(id)

@router.put(
    "/{id}",
    summary="Update a package",
    response_description="The updated package"
)
def update_package(
    id: str,
    package: PackageModel,
    user: User = Depends(get_admin_user),  # Admin only
    service: PackageService = Depends(get_package_service)
) -> PackageModel:
    """
    Update an existing package.
    
    This endpoint requires administrator privileges.
    """
    return service.update_package(id, package)

@router.delete(
    "/{id}",
    summary="Delete a package",
    response_description="Success message",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_package(
    id: str,
    user: User = Depends(get_admin_user),  # Admin only
    service: PackageService = Depends(get_package_service)
) -> None:
    """
    Delete a package by its ID.
    
    This endpoint requires administrator privileges.
    """
    service.delete_package(id)
