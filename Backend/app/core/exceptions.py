from fastapi import HTTPException, status
from app.enums.error_codes import ErrorCode


# Base exceptions
class EntityNotFoundException(HTTPException):
    """Base exception for when an entity is not found."""

    def __init__(self, entity_name: str, error_code: str = ErrorCode.GENERAL_NOT_FOUND):
        self.entity_name = entity_name
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": error_code,
                "message": f"Entity '{entity_name}' not found."
            }
        )


class EntityAlreadyExistsException(HTTPException):
    """Base exception for when an entity already exists."""

    def __init__(self, entity_name: str, error_code: str = ErrorCode.GENERAL_CONFLICT):
        self.entity_name = entity_name
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": error_code,
                "message": f"Entity '{entity_name}' already exists."
            }
        )


# AutomatonContract-specific exceptions
class AutomatonContractNotFoundException(EntityNotFoundException):
    """Exception raised when an automaton contract is not found."""

    def __init__(self, contract_name: str):
        super().__init__(
            entity_name=contract_name,
            error_code=ErrorCode.CONTRACT_NOT_FOUND
        )
        self.detail = {
            "code": ErrorCode.CONTRACT_NOT_FOUND,
            "message": f"Automaton contract '{contract_name}' not found."
        }


class AutomatonContractAlreadyExistsException(EntityAlreadyExistsException):
    """Exception raised when trying to create an automaton contract that already exists."""

    def __init__(self, contract_name: str):
        super().__init__(
            entity_name=contract_name,
            error_code=ErrorCode.CONTRACT_ALREADY_EXISTS
        )
        self.detail = {
            "code": ErrorCode.CONTRACT_ALREADY_EXISTS,
            "message": f"An automaton contract with name '{contract_name}' already exists."
        }


# SmartContract-specific exceptions
class SmartContractNotFoundException(EntityNotFoundException):
    """Exception raised when a deployed smart contract is not found."""

    def __init__(self, contract_name: str):
        super().__init__(
            entity_name=contract_name,
            error_code=ErrorCode.CONTRACT_NOT_FOUND
        )
        self.detail = {
            "code": ErrorCode.CONTRACT_NOT_FOUND,
            "message": f"Smart contract '{contract_name}' not found."
        }


class AutomatonNotFoundException(EntityNotFoundException):
    """Exception raised when an automaton is not found in a contract."""

    def __init__(self, automaton_name: str, contract_name: str):
        super().__init__(
            entity_name=automaton_name,
            error_code=ErrorCode.AUTOMATON_NOT_FOUND
        )
        self.detail = {
            "code": ErrorCode.AUTOMATON_NOT_FOUND,
            "message": f"Automaton '{automaton_name}' not found in contract '{contract_name}'.",
            "details": {
                "automaton_name": automaton_name,
                "contract_name": contract_name
            }
        }


# Package-specific exceptions
class PackageNotFoundException(EntityNotFoundException):
    """Exception raised when a package is not found."""

    def __init__(self, package_name: str):
        super().__init__(
            entity_name=package_name,
            error_code=ErrorCode.PACKAGE_NOT_FOUND
        )
        self.detail = {
            "code": ErrorCode.PACKAGE_NOT_FOUND,
            "message": f"Package '{package_name}' not found."
        }


class PackageAlreadyExistsException(EntityAlreadyExistsException):
    """Exception raised when trying to create a package that already exists."""

    def __init__(self, package_name: str):
        super().__init__(
            entity_name=package_name,
            error_code=ErrorCode.PACKAGE_ALREADY_EXISTS
        )
        self.detail = {
            "code": ErrorCode.PACKAGE_ALREADY_EXISTS,
            "message": f"Package '{package_name}' already exists."
        }


# Operation exceptions
class ContractDeploymentException(HTTPException):
    """Exception raised when contract deployment fails."""

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": ErrorCode.CONTRACT_DEPLOYMENT_FAILED,
                "message": f"Contract deployment failed: {message}"
            }
        )


class ContractExecutionException(HTTPException):
    """Exception raised when contract execution fails."""

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": ErrorCode.CONTRACT_EXECUTION_FAILED,
                "message": f"Contract execution failed: {message}"
            }
        )


class ValidationFailedException(HTTPException):
    """Exception raised when validation of a contract fails."""

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": ErrorCode.CONTRACT_VALIDATION_FAILED,
                "message": f"Validation failed: {message}"
            }
        )