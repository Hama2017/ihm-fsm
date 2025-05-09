# app/api/routes/smart_contract_routes.py
from fastapi import APIRouter, Depends, status, Query
from typing import Dict, List, Any, Optional

from msfsm.common.specification import SpecificationModel

from app.services.smart_contract_service import SmartContractService
from app.schemas.smart_contract import ExecutionRequest, ExecutionResult
from app.api.dependencies import get_smart_contract_service, get_current_user

router = APIRouter(prefix="/smart-contracts", tags=["Smart Contracts"])

@router.post(
    "/deploy",
    summary="Deploy smart contract(s) from a finite state machine specification",
    response_description="The deployed smart contract(s)",
    status_code=status.HTTP_201_CREATED
)
def deploy_smart_contract(
    specification: SpecificationModel,
    user_id: Optional[str] = Depends(get_current_user),
    service: SmartContractService = Depends(get_smart_contract_service)
) -> Dict[str, Any]:
    """
    Create, compile and deploy smart contract(s) following multi-scale
    finite state machine specification of a contract.
    """
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
    user_id: Optional[str] = Depends(get_current_user),
    service: SmartContractService = Depends(get_smart_contract_service)
) -> Dict[str, Any]:
    """
    Delete a deployed smart contract file.
    """
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
    user_id: Optional[str] = Depends(get_current_user),
    service: SmartContractService = Depends(get_smart_contract_service)
) -> ExecutionResult:
    """
    Execute a function from a specific automaton in the deployed smart contract.
    """
    return service.execute_contract_function(
        contract_name=contract_name,
        automaton_name=clause_name,
        function_name=function_name,
        args=execution_request.args,
        user_id=user_id
    )