from pydantic import BaseModel
from typing import Dict, List, Any, Optional

class ContractABI(BaseModel):
    """Contract ABI entry model.
    
    Represents an entry in a contract's ABI (Application Binary Interface),
    which describes the methods and events of the contract.
    """
    inputs: List[Dict[str, str]] = []
    name: str
    outputs: List[Dict[str, str]] = []
    stateMutability: str
    type: str

class AutomatonInfo(BaseModel):
    """Deployed automaton information model.
    
    Contains information about a deployed automaton, including its
    Ethereum address and ABI.
    """
    address: str
    abi: List[ContractABI]

class DeployedContract(BaseModel):
    """Deployed contract information model.
    
    Contains information about a fully deployed contract, including all
    its automatons.
    """
    name: str
    status: str = "deployed"
    automatons: Dict[str, AutomatonInfo]

class ExecutionRequest(BaseModel):
    """Contract function execution request model.
    
    Used to specify arguments for a contract function execution.
    """
    args: List[str] = []

class ExecutionResult(BaseModel):
    """Contract function execution result model.
    
    Contains the result of a contract function execution.
    """
    contract: str
    automaton: str
    function: str
    args: List[Any]
    result: Any