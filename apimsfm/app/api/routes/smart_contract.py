# app/api/routes/smart_contract.py
from fastapi import APIRouter, Depends, status, Query
from typing import Dict, List, Any, Optional

from msfsm.common.specification import SpecificationModel

from app.services.smart_contract_service import SmartContractService
from app.schemas.smart_contract import ExecutionRequest, ExecutionResult
from app.api.dependencies import get_smart_contract_service
from app.auth.api.dependencies import get_current_user, get_optional_current_user
from app.auth.schemas.user import User

router = APIRouter(prefix="/smart-contracts", tags=["Smart Contracts"])

@router.post(
    "/deploy",
    summary="Deploy smart contract(s) from a finite state machine specification",
    response_description="The deployed smart contract(s)",
    status_code=status.HTTP_201_CREATED
)
def deploy_smart_contract(
    specification: SpecificationModel,
    user: Optional[User] = Depends(get_optional_current_user),
    service: SmartContractService = Depends(get_smart_contract_service)
) -> Dict[str, Any]:
    """
    Create, compile and deploy smart contract(s) following multi-scale
    finite state machine specification of a contract.
    
    This endpoint allows deploying smart contracts based on a specification document.
    The contracts are deployed to the blockchain network configured in the application.
    
    Args:
        specification: The specification model for the contract
        user: The authenticated user (optional)
        service: The smart contract service
        
    Returns:
        Dictionary containing deployment information
    """
    user_id = user.email if user else None
    return service.deploy_contract(specification, user_id)

@router.get(
    "/{contract_name}",
    summary="Get information about a deployed smart contract",
    response_description="Contract information including ABI and addresses"
)
def get_smart_contract(
    contract_name: str,
    service: SmartContractService = Depends(get_smart_contract_service)
) -> Dict[str, Any]:
    """
    Get information about a deployed smart contract including its ABI and addresses.
    
    Args:
        contract_name: Name of the contract to retrieve
        service: The smart contract service
        
    Returns:
        Contract information
    """
    return service.get_deployed_contract(contract_name)

@router.get(
    "/",
    summary="Get all deployed smart contracts",
    response_description="List of deployed smart contracts"
)
def get_all_smart_contracts(
    service: SmartContractService = Depends(get_smart_contract_service)
) -> List[Dict[str, Any]]:
    """
    Get information about all deployed smart contracts.
    
    Args:
        service: The smart contract service
        
    Returns:
        List of contract information
    """
    return service.get_all_deployed_contracts()

@router.delete(
    "/{contract_name}",
    summary="Delete a deployed smart contract file",
    response_description="Result of deletion",
    status_code=status.HTTP_200_OK
)
def delete_smart_contract(
    contract_name: str,
    user: Optional[User] = Depends(get_optional_current_user),
    service: SmartContractService = Depends(get_smart_contract_service)
) -> Dict[str, Any]:
    """
    Delete a deployed smart contract file.
    
    Args:
        contract_name: Name of the contract to delete
        user: The authenticated user (optional)
        service: The smart contract service
        
    Returns:
        Result of the deletion operation
    """
    user_id = user.email if user else None
    return service.delete_deployed_contract(contract_name, user_id)

@router.post(
    "/{contract_name}/clause/{clause_name}/function/{function_name}/execute",
    summary="Execute a function from a specific automaton in the contract",
    response_description="Result of the execution"
)
def execute_smart_contract_function(
    contract_name: str,
    clause_name: str,
    function_name: str,
    execution_request: ExecutionRequest,
    user: Optional[User] = Depends(get_optional_current_user),
    service: SmartContractService = Depends(get_smart_contract_service)
) -> ExecutionResult:
    """
    Execute a function from a specific automaton in the deployed smart contract.
    
    This endpoint allows calling functions on deployed contracts. The function
    is executed on the blockchain and the result is returned.
    
    Args:
        contract_name: Name of the contract
        clause_name: Name of the clause/automaton
        function_name: Name of the function to execute
        execution_request: Request containing function arguments
        user: The authenticated user (optional)
        service: The smart contract service
        
    Returns:
        Result of the function execution
    """
    user_id = user.email if user else None
    return service.execute_contract_function(
        contract_name=contract_name,
        automaton_name=clause_name,
        function_name=function_name,
        args=execution_request.args,
        user_id=user_id
    )