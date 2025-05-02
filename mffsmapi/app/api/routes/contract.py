from fastapi import APIRouter, Depends, status
from typing import Dict, List, Any

from msfsm.common.specification import SpecificationModel

from app.services.smart_contract_service import ContractService
from app.schemas.smart_contract import ExecutionRequest, ExecutionResult
from app.api.dependencies import get_contract_service

router = APIRouter(prefix="/contract", tags=["contract"])

@router.post(
    "/deploy",
    summary="Deploy smart contract(s) from a finite state machine specification",
    response_description="The deployed smart contract(s)",
    status_code=status.HTTP_201_CREATED
)
def deploy_contract(
    specification: SpecificationModel,
    service: ContractService = Depends(get_contract_service)
) -> Dict[str, Any]:
    """
    Create, compile and deploy smart contract(s) following multi-scale 
    finite state machine specification of a contract.
    """
    return service.deploy_contract(specification)

@router.get(
    "/deployed/{contract_name}",
    summary="Get information about a deployed contract",
    response_description="Contract information including ABI and addresses"
)
def get_deployed_contract(
    contract_name: str,
    service: ContractService = Depends(get_contract_service)
) -> Dict[str, Any]:
    """
    Get information about a deployed contract including its ABI and addresses.
    """
    return service.get_deployed_contract(contract_name)

@router.get(
    "/deployed",
    summary="Get all deployed contracts",
    response_description="List of deployed contracts"
)
def get_all_deployed_contracts(
    service: ContractService = Depends(get_contract_service)
) -> List[Dict[str, Any]]:
    """
    Get information about all deployed contracts.
    """
    return service.get_all_deployed_contracts()

@router.post(
    "/execute/{contract_name}/clause/{clause_name}/function/{function_name}",
    summary="Execute a function from a specific automaton in the contract",
    response_description="Result of the execution"
)
def execute_contract(
    contract_name: str,
    clause_name: str,
    function_name: str,
    execution_request: ExecutionRequest,
    service: ContractService = Depends(get_contract_service)
) -> ExecutionResult:
    """
    Execute a function from a specific automaton in the contract.
    """
    return service.execute_contract_function(
        contract_name=contract_name,
        automaton_name=clause_name,
        function_name=function_name,
        args=execution_request.args
    )