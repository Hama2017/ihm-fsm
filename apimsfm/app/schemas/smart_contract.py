from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone


class ContractABI(BaseModel):
    """Contract ABI entry model."""
    inputs: List[Dict[str, str]] = []
    name: str
    outputs: List[Dict[str, str]] = []
    stateMutability: str
    type: str

class AutomatonInfo(BaseModel):
    """Deployed automaton information model."""
    address: str
    abi: List[ContractABI]

class SmartContract(BaseModel):
    """Deployed smart contract model."""
    name: str
    deployed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deployed_by: Optional[str] = None  # User ID who deployed the contract
    source_contract: Optional[str] = None  # Reference to the original automaton contract
    automatons: Dict[str, AutomatonInfo]
    description: Optional[str] = None

class ExecutionRequest(BaseModel):
    """Contract function execution request model."""
    args: List[str] = []

class ExecutionResult(BaseModel):
    """Contract function execution result model."""
    contract: str
    automaton: str
    function: str
    args: List[Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    result: Any