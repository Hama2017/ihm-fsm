from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.schemas.automaton_contract import AutomatonContract
from app.repositories.automaton_contract_repository import AutomatonContractRepository
from app.core.exceptions import AutomatonContractNotFoundException, AutomatonContractAlreadyExistsException
from app.utils.history_tracker import HistoryTracker
from app.core.enums import ContractStatus, HistoryTrackerEventType
from app.core.config import settings


class AutomatonContractService:
    """Service for managing automaton contracts."""

    def __init__(self, repository: AutomatonContractRepository):
        self.repository = repository
        self.history_tracker = HistoryTracker()

    def get_all_contracts(self) -> List[AutomatonContract]:
        return self.repository.get_all()

    def get_contract(self, name: str) -> AutomatonContract:
        return self.repository.get_by_name(name)

    def create_contract(self, contract: AutomatonContract, user_id: Optional[str] = None) -> Dict[str, Any]:
        contract.status = ContractStatus.DRAFT.value

        if user_id:
            contract.createdBy = user_id

        now = datetime.now(timezone.utc)
        contract.createdAt = now
        contract.updatedAt = now

        if self.repository.exists(contract.name):
            raise AutomatonContractAlreadyExistsException(contract.name)

        sanitized_name = self.repository._sanitize_name(contract.name)
        created_contract = self.repository.create(contract)

        self.history_tracker.record_event(
            contract_name=contract.name,
            event_type=HistoryTrackerEventType.CREATE,
            user_id=user_id,
            details={"automatons_count": len(contract.automates)}
        )

        return {
            "message": "Automaton contract created successfully.",
            "filename": f"{sanitized_name}{settings.AUTOMATON_CONTRACT_EXTENSION}",
            "contractName": sanitized_name
        }

    def update_contract(self, name: str, contract: AutomatonContract, user_id: Optional[str] = None) -> Dict[str, Any]:
        contract.updatedAt = datetime.now(timezone.utc)

        try:
            existing_contract = self.repository.get_by_name(name)
            contract.createdAt = existing_contract.createdAt
            contract.createdBy = existing_contract.createdBy
        except AutomatonContractNotFoundException:
            pass

        sanitized_name = self.repository._sanitize_name(name)
        updated_contract = self.repository.update(name, contract)

        self.history_tracker.record_event(
            contract_name=name,
            event_type=HistoryTrackerEventType.UPDATE,
            user_id=user_id,
            details={"automatons_count": len(contract.automates)}
        )

        return {
            "message": "Automaton contract updated successfully.",
            "filename": f"{sanitized_name}{settings.AUTOMATON_CONTRACT_EXTENSION}"
        }

    def delete_contract(self, name: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        sanitized_name = self.repository._sanitize_name(name)
        self.repository.delete(name)

        self.history_tracker.record_event(
            contract_name=name,
            event_type=HistoryTrackerEventType.DELETE,
            user_id=user_id
        )

        return {
            "message": "Automaton contract deleted successfully.",
            "filename": f"{sanitized_name}{settings.AUTOMATON_CONTRACT_EXTENSION}"
        }
