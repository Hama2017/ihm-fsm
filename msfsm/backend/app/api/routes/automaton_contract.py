from fastapi import APIRouter, Depends, status, Query
from typing import Dict, List, Optional, Any

from app.services.automaton_contract_service import AutomatonContractService
from app.schemas.automaton_contract import AutomatonContract
from app.api.dependencies import get_automaton_contract_service
from app.auth.api.dependencies import get_current_user
from app.auth.schemas.user import User

router = APIRouter(prefix="/automaton-contracts", tags=["Automaton Contracts"])

@router.get(
    "/",
    summary="List all automaton contracts",
    response_description="List of automaton contracts"
)
def list_automaton_contracts(
    user: User = Depends(get_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, List[AutomatonContract]]:
    """
    List all automaton contracts.
    
    This endpoint requires authentication.
    """
    contracts = service.get_all_contracts()
    return {"contracts": contracts}

@router.get(
    "/by-user/{user_id}",
    summary="List automaton contracts by user",
    response_description="List of automaton contracts created by the specified user"
)
def list_automaton_contracts_by_user(
    user_id: str,
    user: User = Depends(get_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, List[AutomatonContract]]:
    """
    List all automaton contracts created by a specific user.
    
    This endpoint requires authentication.
    """
    contracts = service.get_contracts_by_user(user_id)
    return {"contracts": contracts}

@router.post(
    "/",
    summary="Create a new automaton contract",
    response_description="Creation result",
    status_code=status.HTTP_201_CREATED
)
def create_automaton_contract(
    contract: AutomatonContract,
    user: User = Depends(get_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, Any]:
    """
    Create a new automaton contract.
    
    This endpoint requires authentication.
    """
    return service.create_contract(contract, user.email)

@router.get(
    "/{contract_id}",
    summary="Get an automaton contract by ID",
    response_description="Automaton contract"
)
def get_automaton_contract(
    contract_id: str,
    user: User = Depends(get_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> AutomatonContract:
    """
    Get an automaton contract by its ID.
    
    This endpoint requires authentication.
    """
    return service.get_contract_by_id(contract_id)

@router.put(
    "/{contract_id}",
    summary="Update an automaton contract",
    response_description="Update result"
)
def update_automaton_contract(
    contract_id: str,
    contract: AutomatonContract,
    user: User = Depends(get_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, Any]:
    """
    Update an automaton contract by ID.
    
    This endpoint requires authentication.
    """
    return service.update_contract(contract_id, contract, user.email)

@router.delete(
    "/{contract_id}",
    summary="Delete an automaton contract",
    response_description="Deletion result"
)
def delete_automaton_contract(
    contract_id: str,
    user: User = Depends(get_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, Any]:
    """
    Delete an automaton contract by ID.
    
    This endpoint requires authentication.
    """
    return service.delete_contract(contract_id, user.email)