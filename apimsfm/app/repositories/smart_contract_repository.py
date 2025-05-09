import os
import json
from typing import Dict, List, Any
from datetime import datetime

from app.core.config import settings
from app.core.exceptions import SmartContractNotFoundException
from app.core.config import settings
from app.enums.contract_status import ContractStatus

class SmartContractRepository:
    """Repository for deployed smart contracts."""

    def __init__(self):
        """Initialize the repository."""
        self.directory = settings.CONTRACT_STATUS_DIRS[ContractStatus.DEPLOYED]
        self.file_extension = settings.SMART_CONTRACT_EXTENSION  # Smart Legal Contract
        os.makedirs(self.directory, exist_ok=True)

    def _get_filepath(self, name: str) -> str:
        """Get the full filepath for a given contract name."""
        return os.path.join(self.directory, f"{name}{self.file_extension}")

    def exists(self, name: str) -> bool:
        """Check if a deployed contract with the given name exists."""
        filepath = self._get_filepath(name)
        return os.path.exists(filepath)

    def get_all(self) -> List[Dict[str, Any]]:
        """Get all deployed contracts."""
        result = []
        for filename in os.listdir(self.directory):
            if filename.endswith(self.file_extension):
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
        """Get a deployed contract by name."""
        filepath = self._get_filepath(name)
        if not os.path.exists(filepath):
            raise SmartContractNotFoundException(name)

        with open(filepath, 'r') as f:
            return json.load(f)

    def save(self, name: str, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a deployed contract."""
        filepath = self._get_filepath(name)

        # Ensure deployed_at timestamp is included
        if "deployed_at" not in contract_data:
            contract_data["deployed_at"] = datetime.now(datetime.timezone.utc).isoformat()

        with open(filepath, 'w') as f:
            json.dump(contract_data, f, indent=2)

        return contract_data

    def delete(self, name: str) -> bool:
        """Delete a deployed contract."""
        filepath = self._get_filepath(name)
        if not os.path.exists(filepath):
            raise SmartContractNotFoundException(name)

        os.remove(filepath)
        return True