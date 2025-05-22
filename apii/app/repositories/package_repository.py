from app.repositories.base_repository import FileSystemRepository
from app.schemas.package import PackageModel
from app.core.config import settings
from app.core.exceptions import PackageNotFoundException, PackageAlreadyExistsException
from app.core.config import settings
class PackageRepository(FileSystemRepository[PackageModel]):
    """Repository for managing code packages."""
    
    def __init__(self):
        """Initialize with packages directory."""
        super().__init__(
            directory=settings.PACKAGES_DIR,
            file_extension=settings.PACKAGE_EXTENSION,  # Package file extension
            model_class=PackageModel,
            not_found_exception=PackageNotFoundException,
            already_exists_exception=PackageAlreadyExistsException
        )