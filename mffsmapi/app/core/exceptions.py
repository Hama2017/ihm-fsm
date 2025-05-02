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

# Contract specific exceptions
class ContractNotFoundException(EntityNotFoundException):
    """Exception raised when a contract is not found."""
    
    def __init__(self, contract_name: str):
        super().__init__(entity_name=contract_name)
        self.detail = f"Contract '{contract_name}' not found."

class ContractAlreadyExistsException(EntityAlreadyExistsException):
    """Exception raised when trying to create a contract that already exists."""
    
    def __init__(self, contract_name: str):
        super().__init__(entity_name=contract_name)
        self.detail = f"A contract with name '{contract_name}' already exists."

class AutomatonNotFoundException(EntityNotFoundException):
    """Exception raised when an automaton is not found in a contract."""
    
    def __init__(self, automaton_name: str, contract_name: str):
        super().__init__(entity_name=automaton_name)
        self.detail = f"Automaton '{automaton_name}' not found in contract '{contract_name}'."

# Package specific exceptions
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

class PackageValidationException(HTTPException):
    """Exception raised when package validation fails."""
    
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Package validation failed: {message}"
        )

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