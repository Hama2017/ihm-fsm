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

    def get_package(self, id: str) -> PackageModel:
        """
        Get a package by id.

        Args:
            id (str): Package ID

        Returns:
            PackageModel: The package

        Raises:
            PackageNotFoundException: If package not found
        """
        return self.repository.get_by_id(id)

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
        if self.repository.exists(package.id):
            raise PackageAlreadyExistsException(package.id)

        return self.repository.create(package)

    def update_package(self, id: str, package: PackageModel) -> PackageModel:
        """
        Update an existing package.

        Args:
            id (str): Package ID
            package (PackageModel): Updated package

        Returns:
            PackageModel: Updated package

        Raises:
            PackageNotFoundException: If package not found
        """
        # Ensure the ID in the path matches the ID in the body
        if id != package.id:
            raise ValueError("Package ID in URL must match package ID in body")

        return self.repository.update(id, package)

    def delete_package(self, id: str) -> None:
        """
        Delete a package.

        Args:
            id (str): Package ID

        Raises:
            PackageNotFoundException: If package not found
        """
        self.repository.delete(id)
