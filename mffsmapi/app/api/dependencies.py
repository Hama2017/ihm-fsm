"""
Dependencies for FastAPI application.
This module contains all the dependencies used in the application routes.
"""

from app.services.smart_contract_service import ContractService
from app.services.automaton_contract_service import ContractAutomatonService
from app.services.package_service import PackageService

from app.repositories.smart_contract_repository import DeployedContractRepository
from app.repositories.automaton_contract_repository import ContractAutomatonRepository
from app.repositories.package_repository import PackageRepository

# Repository dependencies
def get_deployed_contract_repository() -> DeployedContractRepository:
    """
    Dependency for obtaining a DeployedContractRepository instance.
    
    Returns:
        DeployedContractRepository: Repository for deployed contracts
    """
    return DeployedContractRepository()

def get_contract_automaton_repository() -> ContractAutomatonRepository:
    """
    Dependency for obtaining a ContractAutomatonRepository instance.
    
    Returns:
        ContractAutomatonRepository: Repository for contract automatons
    """
    return ContractAutomatonRepository()

def get_package_repository() -> PackageRepository:
    """
    Dependency for obtaining a PackageRepository instance.
    
    Returns:
        PackageRepository: Repository for packages
    """
    return PackageRepository()

# Service dependencies
def get_contract_service() -> ContractService:
    """
    Dependency for obtaining a ContractService instance.
    
    Returns:
        ContractService: Service for managing deployed contracts
    """
    repository = get_deployed_contract_repository()
    return ContractService(repository=repository)

def get_contract_automaton_service() -> ContractAutomatonService:
    """
    Dependency for obtaining a ContractAutomatonService instance.
    
    Returns:
        ContractAutomatonService: Service for managing contract automatons
    """
    repository = get_contract_automaton_repository()
    return ContractAutomatonService(repository=repository)

def get_package_service() -> PackageService:
    """
    Dependency for obtaining a PackageService instance.
    
    Returns:
        PackageService: Service for managing packages
    """
    repository = get_package_repository()
    return PackageService(repository=repository)