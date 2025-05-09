# app/core/exceptions.py
from fastapi import HTTPException, status


# Base exceptions
class EntityNotFoundException(HTTPException):
    """Base exception for when an entity is not found."""

    def __init__(self, entity_name: str):
        self.entity_name = entity_name
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_name}' not found."
        )


class EntityAlreadyExistsException(HTTPException):
    """Base exception for when an entity already exists."""

    def __init__(self, entity_name: str):
        self.entity_name = entity_name
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Entity '{entity_name}' already exists."
        )


# AutomatonContract-specific exceptions
class AutomatonContractNotFoundException(EntityNotFoundException):
    """Exception raised when an automaton contract is not found."""

    def __init__(self, contract_name: str):
        super().__init__(entity_name=contract_name)
        self.detail = f"Automaton contract '{contract_name}' not found."


class AutomatonContractAlreadyExistsException(EntityAlreadyExistsException):
    """Exception raised when trying to create an automaton contract that already exists."""

    def __init__(self, contract_name: str):
        super().__init__(entity_name=contract_name)
        self.detail = f"An automaton contract with name '{contract_name}' already exists."


# SmartContract-specific exceptions
class SmartContractNotFoundException(EntityNotFoundException):
    """Exception raised when a deployed smart contract is not found."""

    def __init__(self, contract_name: str):
        super().__init__(entity_name=contract_name)
        self.detail = f"Smart contract '{contract_name}' not found."


class AutomatonNotFoundException(EntityNotFoundException):
    """Exception raised when an automaton is not found in a contract."""

    def __init__(self, automaton_name: str, contract_name: str):
        super().__init__(entity_name=automaton_name)
        self.detail = f"Automaton '{automaton_name}' not found in contract '{contract_name}'."


# Package-specific exceptions
class PackageNotFoundException(EntityNotFoundException):
    """Exception raised when a package is not found."""

    def __init__(self, package_name: str):
        super().__init__(entity_name=package_name)
        self.detail = f"Package '{package_name}' not found."


class PackageAlreadyExistsException(EntityAlreadyExistsException):
    """Exception raised when trying to create a package that already exists."""

    def __init__(self, package_name: str):
        super().__init__(entity_name=package_name)
        self.detail = f"Package '{package_name}' already exists."


# Operation exceptions
class ContractDeploymentException(HTTPException):
    """Exception raised when contract deployment fails."""

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contract deployment failed: {message}"
        )


class ContractExecutionException(HTTPException):
    """Exception raised when contract execution fails."""

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contract execution failed: {message}"
        )


class ValidationFailedException(HTTPException):
    """Exception raised when validation of a contract fails."""

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {message}"
        )