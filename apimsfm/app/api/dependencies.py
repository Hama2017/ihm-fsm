# app/api/dependencies.py
"""
Dependencies for FastAPI application.
This module contains all the dependencies used in the application routes.
"""

from fastapi import Header, HTTPException, status
from typing import Optional

from app.services.smart_contract_service import SmartContractService
from app.services.automaton_contract_service import AutomatonContractService
from app.services.package_service import PackageService

from app.repositories.smart_contract_repository import SmartContractRepository
from app.repositories.automaton_contract_repository import AutomatonContractRepository
from app.repositories.package_repository import PackageRepository

# Repository dependencies
def get_smart_contract_repository() -> SmartContractRepository:
    """
    Dependency for obtaining a SmartContractRepository instance.
    
    Returns:
        SmartContractRepository: Repository for deployed smart contracts
    """
    return SmartContractRepository()

def get_automaton_contract_repository() -> AutomatonContractRepository:
    """
    Dependency for obtaining a AutomatonContractRepository instance.
    
    Returns:
        AutomatonContractRepository: Repository for automaton contracts
    """
    return AutomatonContractRepository()

def get_package_repository() -> PackageRepository:
    """
    Dependency for obtaining a PackageRepository instance.
    
    Returns:
        PackageRepository: Repository for packages
    """
    return PackageRepository()

# Service dependencies
def get_smart_contract_service() -> SmartContractService:
    """
    Dependency for obtaining a SmartContractService instance.
    
    Returns:
        SmartContractService: Service for managing deployed smart contracts
    """
    repository = get_smart_contract_repository()
    return SmartContractService(repository=repository)

def get_automaton_contract_service() -> AutomatonContractService:
    """
    Dependency for obtaining a AutomatonContractService instance.
    
    Returns:
        AutomatonContractService: Service for managing automaton contracts
    """
    repository = get_automaton_contract_repository()
    return AutomatonContractService(repository=repository)

def get_package_service() -> PackageService:
    """
    Dependency for obtaining a PackageService instance.
    
    Returns:
        PackageService: Service for managing packages
    """
    repository = get_package_repository()
    return PackageService(repository=repository)

# User dependencies
async def get_current_user(x_user_id: Optional[str] = Header(None)) -> Optional[str]:
    """
    Dependency for obtaining the current user ID from request headers.
    In a real application, this would validate tokens or other auth mechanisms.
    
    Args:
        x_user_id: User ID from request header
        
    Returns:
        Optional[str]: User ID if provided, None otherwise
    """
    return x_user_id

async def get_required_user(x_user_id: str = Header(...)) -> str:
    """
    Dependency for requiring a user ID in request headers.
    
    Args:
        x_user_id: User ID from request header
        
    Returns:
        str: User ID
        
    Raises:
        HTTPException: If no user ID is provided
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User authentication required for this operation"
        )
    return x_user_id