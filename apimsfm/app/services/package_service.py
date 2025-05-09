from typing import List

from app.schemas.package import PackageModel
from app.repositories.package_repository import PackageRepository
from app.core.exceptions import PackageAlreadyExistsException

class PackageService:
    """Service for managing packages."""
    
    def __init__(self, repository: PackageRepository):
        """
        Initialize the PackageService.
        
        Args:
            repository (PackageRepository): Repository for packages
        """
        self.repository = repository
    
    def get_all_packages(self) -> List[PackageModel]:
        """
        Get all packages.
        
        Returns:
            List[PackageModel]: List of all packages
        """
        return self.repository.get_all()
    
    def get_package(self, name: str) -> PackageModel:
        """
        Get a package by name.
        
        Args:
            name (str): Package name
            
        Returns:
            PackageModel: The package
            
        Raises:
            PackageNotFoundException: If package not found
        """
        return self.repository.get_by_name(name)
    
    def create_package(self, package: PackageModel) -> PackageModel:
        """
        Create a new package.
        
        Args:
            package (PackageModel): Package to create
            
        Returns:
            PackageModel: Created package
            
        Raises:
            PackageAlreadyExistsException: If package already exists
        """
        if self.repository.exists(package.name):
            raise PackageAlreadyExistsException(package.name)
        
        return self.repository.create(package)
    
    def update_package(self, name: str, package: PackageModel) -> PackageModel:
        """
        Update an existing package.
        
        Args:
            name (str): Package name
            package (PackageModel): Updated package
            
        Returns:
            PackageModel: Updated package
            
        Raises:
            PackageNotFoundException: If package not found
        """
        # Ensure the name in the path matches the name in the body
        if name != package.name:
            raise ValueError("Package name in URL must match package name in body")
        
        return self.repository.update(name, package)
    
    def delete_package(self, name: str) -> None:
        """
        Delete a package.
        
        Args:
            name (str): Package name
            
        Raises:
            PackageNotFoundException: If package not found
        """
        self.repository.delete(name)