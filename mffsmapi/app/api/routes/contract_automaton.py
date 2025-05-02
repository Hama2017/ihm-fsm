from fastapi import APIRouter, Depends, status
from typing import Dict, List, Any

from app.services.automaton_contract_service import ContractAutomatonService
from app.schemas.automaton_contract import ContractAutomaton
from app.api.dependencies import get_contract_automaton_service

router = APIRouter(prefix="/contract-automaton", tags=["Contract Automaton"])

@router.get(
    "/",
    summary="List all contract automatons",
    response_description="List of contract automatons"
)
def list_contracts(
    service: ContractAutomatonService = Depends(get_contract_automaton_service)
) -> Dict[str, List[ContractAutomaton]]:
    """
    List all contract automatons.
    """
    contracts = service.get_all_contracts()
    return {"contracts": contracts}

@router.post(
    "/",
    summary="Create a new contract automaton",
    response_description="Creation result",
    status_code=status.HTTP_201_CREATED
)
def create_contract(
    contract: ContractAutomaton,
    service: ContractAutomatonService = Depends(get_contract_automaton_service)
) -> Dict[str, Any]:
    """
    Create a new contract automaton.
    """
    return service.create_contract(contract)

@router.get(
    "/{contract_name}",
    summary="Get a contract automaton by name",
    response_description="Contract automaton"
)
def get_contract(
    contract_name: str,
    service: ContractAutomatonService = Depends(get_contract_automaton_service)
) -> ContractAutomaton:
    """
    Get a contract automaton by name.
    """
    return service.get_contract(contract_name)

@router.put(
    "/{contract_name}",
    summary="Update a contract automaton",
    response_description="Update result"
)
def update_contract(
    contract_name: str,
    contract: ContractAutomaton,
    service: ContractAutomatonService = Depends(get_contract_automaton_service)
) -> Dict[str, Any]:
    """
    Update a contract automaton.
    """
    return service.update_contract(contract_name, contract)

@router.delete(
    "/{contract_name}",
    summary="Delete a contract automaton",
    response_description="Deletion result"
)
def delete_contract(
    contract_name: str,
    service: ContractAutomatonService = Depends(get_contract_automaton_service)
) -> Dict[str, Any]:
    """
    Delete a contract automaton.
    """
    return service.delete_contract(contract_name)