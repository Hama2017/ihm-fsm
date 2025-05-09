from fastapi import APIRouter, Depends, status
from typing import List

from app.services.package_service import PackageService
from app.schemas.package import PackageModel
from app.api.dependencies import get_package_service

router = APIRouter(prefix="/packages", tags=["Packages"])

@router.get(
    "/",
    summary="Get all packages",
    response_description="All packages"
)
def get_all_packages(
    service: PackageService = Depends(get_package_service)
) -> List[PackageModel]:
    """
    Get all available packages.
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
    service: PackageService = Depends(get_package_service)
) -> PackageModel:
    """
    Create a new package.
    """
    return service.create_package(package)

@router.get(
    "/{name}",
    summary="Get a package by name",
    response_description="The package"
)
def get_package(
    name: str,
    service: PackageService = Depends(get_package_service)
) -> PackageModel:
    """
    Get a package by its name.
    """
    return service.get_package(name)

@router.put(
    "/{name}",
    summary="Update a package",
    response_description="The updated package"
)
def update_package(
    name: str,
    package: PackageModel,
    service: PackageService = Depends(get_package_service)
) -> PackageModel:
    """
    Update an existing package.
    """
    return service.update_package(name, package)

@router.delete(
    "/{name}",
    summary="Delete a package",
    response_description="Success message",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_package(
    name: str,
    service: PackageService = Depends(get_package_service)
) -> None:
    """
    Delete a package by its name.
    """
    service.delete_package(name)