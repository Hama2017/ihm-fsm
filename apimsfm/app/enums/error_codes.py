from enum import Enum

class ErrorCode(str, Enum):
    """
    Application error codes for internationalization.
    
    These codes are designed to be used with frontend internationalization
    to display appropriate localized error messages.
    """
    # Contract errors
    CONTRACT_NOT_FOUND = "contract.not_found"
    CONTRACT_ALREADY_EXISTS = "contract.already_exists"
    CONTRACT_DEPLOYMENT_FAILED = "contract.deployment_failed"
    CONTRACT_EXECUTION_FAILED = "contract.execution_failed"
    
    # Automaton errors
    AUTOMATON_NOT_FOUND = "automaton.not_found"
    
    # Package errors
    PACKAGE_NOT_FOUND = "package.not_found"
    PACKAGE_ALREADY_EXISTS = "package.already_exists"
    
    # Validation errors
    VALIDATION_FAILED = "validation.failed"