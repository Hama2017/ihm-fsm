from app.repositories.base_repository import FileSystemRepository
from app.schemas.automaton_contract import AutomatonContract
from app.core.config import settings
from app.core.exceptions import AutomatonContractNotFoundException, AutomatonContractAlreadyExistsException
from app.enums.contract_status import ContractStatus

class AutomatonContractRepository(FileSystemRepository[AutomatonContract]):
    """Repository for managing automaton contracts."""

    def __init__(self):
        """Initialize with draft contracts directory."""
        super().__init__(
            directory=settings.CONTRACT_STATUS_DIRS[ContractStatus.DRAFT],
            file_extension=settings.AUTOMATON_CONTRACT_EXTENSION,  # Smart Legal Contract Automaton
            model_class=AutomatonContract,
            not_found_exception=AutomatonContractNotFoundException,
            already_exists_exception=AutomatonContractAlreadyExistsException
        )