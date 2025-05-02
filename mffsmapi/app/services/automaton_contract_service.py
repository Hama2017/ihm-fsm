from datetime import datetime
from typing import List, Dict, Any

from app.schemas.automaton_contract import ContractAutomaton
from app.repositories.automaton_contract_repository import ContractAutomatonRepository
from app.core.exceptions import ContractAlreadyExistsException

class ContractAutomatonService:
    """Service for managing contract automatons."""
    
    def __init__(self, repository: ContractAutomatonRepository):
        """
        Initialize the ContractAutomatonService.
        
        Args:
            repository (ContractAutomatonRepository): Repository for contract automatons
        """
        self.repository = repository
    
    def get_all_contracts(self) -> List[ContractAutomaton]:
        """
        Get all contract automatons.
        
        Returns:
            List[ContractAutomaton]: List of all contract automatons
        """
        return self.repository.get_all()
    
    def get_contract(self, name: str) -> ContractAutomaton:
        """
        Get a contract automaton by name.
        
        Args:
            name (str): Contract name
            
        Returns:
            ContractAutomaton: The contract automaton
            
        Raises:
            ContractNotFoundException: If contract not found
        """
        return self.repository.get_by_name(name)
    
    def create_contract(self, contract: ContractAutomaton) -> Dict[str, Any]:
        """
        Create a new contract automaton.
        
        Args:
            contract (ContractAutomaton): Contract automaton to create
            
        Returns:
            Dict[str, Any]: Creation result
            
        Raises:
            ContractAlreadyExistsException: If contract already exists
        """
        # Set status to 'deployer' for new contracts
        contract.status = 'deployer'
        
        # Don't allow overriding existing contracts
        if self.repository.exists(contract.name):
            raise ContractAlreadyExistsException(contract.name)
        
        sanitized_name = self.repository._sanitize_name(contract.name)
        
        # Save the contract
        created_contract = self.repository.create(contract)
        
        return {
            "message": "Contract SLCA created successfully.",
            "filename": f"{sanitized_name}.slc",
            "contractName": sanitized_name
        }
    
    def update_contract(self, name: str, contract: ContractAutomaton) -> Dict[str, Any]:
        """
        Update an existing contract automaton.
        
        Args:
            name (str): Contract name
            contract (ContractAutomaton): Updated contract automaton
            
        Returns:
            Dict[str, Any]: Update result
            
        Raises:
            ContractNotFoundException: If contract not found
        """
        contract.updatedAt = datetime.now()
        
        sanitized_name = self.repository._sanitize_name(name)
        updated_contract = self.repository.update(name, contract)
        
        return {
            "message": "Contract SLCA updated successfully.",
            "filename": f"{sanitized_name}.slc"
        }
    
    def delete_contract(self, name: str) -> Dict[str, Any]:
        """
        Delete a contract automaton.
        
        Args:
            name (str): Contract name
            
        Returns:
            Dict[str, Any]: Deletion result
            
        Raises:
            ContractNotFoundException: If contract not found
        """
        sanitized_name = self.repository._sanitize_name(name)
        self.repository.delete(name)
        
        return {
            "message": "Contract SLCA deleted successfully.",
            "filename": f"{sanitized_name}.slc"
        }