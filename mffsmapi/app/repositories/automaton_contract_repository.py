from app.repositories.base_repository import FileSystemRepository
from app.schemas.automaton_contract import ContractAutomaton
from app.core.config import settings
from app.core.exceptions import ContractNotFoundException, ContractAlreadyExistsException

class ContractAutomatonRepository(FileSystemRepository[ContractAutomaton]):
    """Repository for managing contract automatons."""
    
    def __init__(self):
        """Initialize with SLCA contracts directory."""
        super().__init__(
            directory=settings.SLCA_CONTRACTS_DIR,
            file_extension=".deployed",
            model_class=ContractAutomaton,
            not_found_exception=ContractNotFoundException,
            already_exists_exception=ContractAlreadyExistsException
        )