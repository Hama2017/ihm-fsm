from fastapi import APIRouter, Depends, status, Query
from typing import Dict, List, Optional, Any

from app.services.automaton_contract_service import AutomatonContractService
from app.schemas.automaton_contract import AutomatonContract
from app.api.dependencies import get_automaton_contract_service
from app.auth.api.dependencies import get_current_user, get_optional_current_user
from app.auth.schemas.user import User

router = APIRouter(prefix="/automaton-contracts", tags=["Automaton Contracts"])

@router.get(
    "/",
    summary="List all automaton contracts",
    response_description="List of automaton contracts"
)
def list_automaton_contracts(
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, List[AutomatonContract]]:
    """
    List all automaton contracts.
    """
    contracts = service.get_all_contracts()
    return {"contracts": contracts}

@router.post(
    "/",
    summary="Create a new automaton contract",
    response_description="Creation result",
    status_code=status.HTTP_201_CREATED
)
def create_automaton_contract(
    contract: AutomatonContract,
    user: Optional[User] = Depends(get_optional_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, Any]:
    """
    Create a new automaton contract.
    """
    user_id = user.email if user else None
    return service.create_contract(contract, user_id)

@router.get(
    "/{contract_name}",
    summary="Get an automaton contract by name",
    response_description="Automaton contract"
)
def get_automaton_contract(
    contract_name: str,
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> AutomatonContract:
    """
    Get an automaton contract by name.
    """
    return service.get_contract(contract_name)

@router.put(
    "/{contract_name}",
    summary="Update an automaton contract",
    response_description="Update result"
)
def update_automaton_contract(
    contract_name: str,
    contract: AutomatonContract,
    user: Optional[User] = Depends(get_optional_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, Any]:
    """
    Update an automaton contract.
    """
    user_id = user.email if user else None
    return service.update_contract(contract_name, contract, user_id)

@router.delete(
    "/{contract_name}",
    summary="Delete an automaton contract",
    response_description="Deletion result"
)
def delete_automaton_contract(
    contract_name: str,
    user: Optional[User] = Depends(get_optional_current_user),
    service: AutomatonContractService = Depends(get_automaton_contract_service)
) -> Dict[str, Any]:
    """
    Delete an automaton contract.
    """
    user_id = user.email if user else None
    return service.delete_contract(contract_name, user_id)