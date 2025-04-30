import json
import os
from typing import List
from fastapi import APIRouter, HTTPException
from app.database.models.package import Package, PackageModel

router = APIRouter(prefix="/package", tags=["package"])

DATA_DIR = "./data"
PACKAGE_DIR = os.path.join(DATA_DIR, "packages")
os.makedirs(PACKAGE_DIR, exist_ok=True)

@router.get(
    "/",
    summary="Get all packages",
    response_description="All packages"
)
def get_all_packages() -> List[PackageModel]:
    """
    Get all available packages from the data/packages directory
    """
    packages = []
    
    for filename in os.listdir(PACKAGE_DIR):
        if filename.endswith('.json'):
            filepath = os.path.join(PACKAGE_DIR, filename)
            try:
                package = Package().load(filepath)
                packages.append(package.data)
            except Exception as e:
                # Skip invalid files
                continue
    
    return packages

@router.post(
    "/",
    summary="Create a package",
    response_description="The created package",
    status_code=201
)
def create_package(package: PackageModel) -> PackageModel:
    """
    Create a new package in data/packages directory
    """
    package_path = os.path.join(PACKAGE_DIR, f"{package.name}.json")
    if os.path.exists(package_path):
        raise HTTPException(status_code=409, detail=f"Package '{package.name}' already exists")
    
    try:
        with open(package_path, 'w') as f:
            json.dump(package.model_dump(), f, indent=4)
        
        return package
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid package: {str(e)}")

@router.get(
    "/{name}",
    summary="Get a package by name",
    response_description="The package"
)
def get_package(name: str) -> PackageModel:
    """
    Get a package by its name from data/packages directory
    """
    package_path = os.path.join(PACKAGE_DIR, f"{name}.json")
    if not os.path.exists(package_path):
        raise HTTPException(status_code=404, detail=f"Package '{name}' not found")
    
    try:
        package = Package().load(package_path)
        return package.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading package: {str(e)}")

@router.put(
    "/{name}",
    summary="Update a package",
    response_description="The updated package"
)
def update_package(name: str, package: PackageModel) -> PackageModel:
    """
    Update an existing package in data/packages directory
    """
    package_path = os.path.join(PACKAGE_DIR, f"{name}.json")
    if not os.path.exists(package_path):
        raise HTTPException(status_code=404, detail=f"Package '{name}' not found")
    
    # Ensure the name in the path matches the name in the body
    if name != package.name:
        raise HTTPException(status_code=400, detail="Package name in URL must match package name in body")
    
    try:
        # Save the updated package to file
        with open(package_path, 'w') as f:
            json.dump(package.model_dump(), f, indent=4)
        
        return package
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid package: {str(e)}")

@router.delete(
    "/{name}",
    summary="Delete a package",
    response_description="Success message",
    status_code=204
)
def delete_package(name: str):
    """
    Delete a package by its name from data/packages directory
    """
    package_path = os.path.join(PACKAGE_DIR, f"{name}.json")
    if not os.path.exists(package_path):
        raise HTTPException(status_code=404, detail=f"Package '{name}' not found")
    
    try:
        os.remove(package_path)
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting package: {str(e)}")