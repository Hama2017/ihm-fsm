from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.schemas.automaton_contract import AutomatonContract
from app.repositories.automaton_contract_repository import AutomatonContractRepository
from app.core.exceptions import AutomatonContractNotFoundException, AutomatonContractAlreadyExistsException
from app.utils.history_tracker import HistoryTracker
from app.enums.contract_status import ContractStatus
from app.enums.history_events import HistoryTrackerEventType

from app.core.config import settings

class AutomatonContractService:
    """Service for managing automaton contracts."""

    def __init__(self, repository: AutomatonContractRepository):
        self.repository = repository
        self.history_tracker = HistoryTracker()

    def get_all_contracts(self) -> List[AutomatonContract]:
        """Get all automaton contracts."""
        return self.repository.get_all()

    def get_contract_by_id(self, contract_id: str) -> AutomatonContract:
        """
        Get a contract by its ID.
        
        Args:
            contract_id: The ID of the contract to retrieve
            
        Returns:
            The contract
            
        Raises:
            AutomatonContractNotFoundException: If contract is not found
        """
        return self.repository.get_by_id(contract_id)
    
    def get_contracts_by_user(self, user_id: str) -> List[AutomatonContract]:
        """
        Get all contracts created by a specific user.
        
        Args:
            user_id: The ID of the user who created the contracts
            
        Returns:
            List of contracts created by the user
        """
        return self.repository.get_by_field('createdBy', user_id)

    def create_contract(self, contract: AutomatonContract, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new automaton contract.
        
        Args:
            contract: Contract data
            user_id: ID of the user creating the contract
            
        Returns:
            Dictionary with creation information
            
        Raises:
            AutomatonContractAlreadyExistsException: If contract with the same ID already exists
        """
        contract.status = ContractStatus.DRAFT.value

        if user_id:
            contract.createdBy = user_id

        now = datetime.now(timezone.utc)
        contract.createdAt = now
        contract.updatedAt = now

        created_contract = self.repository.create(contract)

        self.history_tracker.record_event(
            contract_id=created_contract.id,
            event_type=HistoryTrackerEventType.CREATE,
            user_id=user_id,
            details={"automatons_count": len(contract.automates)}
        )

        return {
            "message": "Automaton contract created successfully.",
            "contractId": created_contract.id,
            "contractName": created_contract.name
        }
    
    def update_contract(self, contract_id: str, contract: AutomatonContract, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Update a contract by its ID.
        
        Args:
            contract_id: The ID of the contract to update
            contract: The updated contract data
            user_id: The ID of the user making the update
            
        Returns:
            Dictionary with update information
            
        Raises:
            AutomatonContractNotFoundException: If contract is not found
        """
        contract.updatedAt = datetime.now(timezone.utc)
        
        # Get existing contract to preserve creation info
        existing_contract = self.get_contract_by_id(contract_id)
        
        # Preserve creation info
        contract.createdAt = existing_contract.createdAt
        contract.createdBy = existing_contract.createdBy
        # Preserve the original ID
        contract.id = contract_id
        
        updated_contract = self.repository.update(contract_id, contract)

        self.history_tracker.record_event(
            contract_id=contract_id,
            event_type=HistoryTrackerEventType.UPDATE,
            user_id=user_id,
            details={"automatons_count": len(contract.automates)}
        )

        return {
            "message": "Automaton contract updated successfully.",
            "contractId": contract_id,
            "contractName": updated_contract.name
        }
    
    def delete_contract(self, contract_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Delete a contract by its ID.
        
        Args:
            contract_id: The ID of the contract to delete
            user_id: The ID of the user making the deletion
            
        Returns:
            Dictionary with deletion information
            
        Raises:
            AutomatonContractNotFoundException: If contract is not found
        """
        # Get the contract to get its name before deletion for history
        contract = self.get_contract_by_id(contract_id)
        contract_name = contract.name
        
        self.repository.delete(contract_id)

        self.history_tracker.record_event(
            contract_id=contract_id,
            event_type=HistoryTrackerEventType.DELETE,
            user_id=user_id
        )

        return {
            "message": "Automaton contract deleted successfully.",
            "contractId": contract_id,
            "contractName": contract_name
        }