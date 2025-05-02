import os
import json
from typing import Dict, List, Any

from app.core.config import settings
from app.core.exceptions import ContractNotFoundException

class DeployedContractRepository:
    """Repository for deployed contracts."""
    
    def __init__(self):
        """Initialize the repository with the deployed contracts directory."""
        self.directory = settings.DEPLOYED_CONTRACTS_DIR
        os.makedirs(self.directory, exist_ok=True)
    
    def _get_filepath(self, name: str) -> str:
        """
        Get the full filepath for a given contract name.
        
        Args:
            name: Name of the contract
            
        Returns:
            Full path to the contract file
        """
        return os.path.join(self.directory, f"{name}.json")
    
    def exists(self, name: str) -> bool:
        """
        Check if a deployed contract with the given name exists.
        
        Args:
            name: Name of the contract
            
        Returns:
            True if the contract exists, False otherwise
        """
        filepath = self._get_filepath(name)
        return os.path.exists(filepath)
    
    def get_all(self) -> List[Dict[str, Any]]:
        """
        Get all deployed contracts.
        
        Returns:
            List of all deployed contracts
        """
        result = []
        for filename in os.listdir(self.directory):
            if filename.endswith('.json'):
                filepath = os.path.join(self.directory, filename)
                try:
                    with open(filepath, 'r') as f:
                        contract_data = json.load(f)
                    result.append(contract_data)
                except Exception:
                    # Skip invalid files
                    continue
        return result
    
    def get_by_name(self, name: str) -> Dict[str, Any]:
        """
        Get a deployed contract by name.
        
        Args:
            name: Name of the contract
            
        Returns:
            Contract data
            
        Raises:
            ContractNotFoundException: If contract not found
        """
        filepath = self._get_filepath(name)
        if not os.path.exists(filepath):
            raise ContractNotFoundException(name)
        
        with open(filepath, 'r') as f:
            return json.load(f)
    
    def save(self, name: str, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save a deployed contract.
        
        Args:
            name: Name of the contract
            contract_data: Contract data to save
            
        Returns:
            Saved contract data
        """
        filepath = self._get_filepath(name)
        
        with open(filepath, 'w') as f:
            json.dump(contract_data, f, indent=2)
        
        return contract_data