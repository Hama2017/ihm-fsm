from enum import Enum

class ErrorCode(str, Enum):
    """
    Application error codes for internationalization.
    
    These codes are designed to be used with frontend internationalization
    to display appropriate localized error messages.
    

    """
    # General errors
    GENERAL_NOT_FOUND = "general.not_found"
    GENERAL_BAD_REQUEST = "general.bad_request"
    GENERAL_INTERNAL_ERROR = "general.internal_error"
    GENERAL_VALIDATION_FAILED = "general.validation_failed"
    GENERAL_UNAUTHORIZED = "general.unauthorized"
    GENERAL_FORBIDDEN = "general.forbidden"
    GENERAL_CONFLICT = "general.conflict"
    
    # Contract errors
    CONTRACT_NOT_FOUND = "contract.not_found"
    CONTRACT_ALREADY_EXISTS = "contract.already_exists"
    CONTRACT_VALIDATION_FAILED = "contract.validation_failed"
    CONTRACT_DEPLOYMENT_FAILED = "contract.deployment_failed"
    CONTRACT_EXECUTION_FAILED = "contract.execution_failed"
    CONTRACT_UNAUTHORIZED_ACCESS = "contract.unauthorized_access"
    CONTRACT_INVALID_STATE = "contract.invalid_state"
    CONTRACT_COMPILATION_FAILED = "contract.compilation_failed"
    
    # Automaton errors
    AUTOMATON_NOT_FOUND = "automaton.not_found"
    AUTOMATON_ALREADY_EXISTS = "automaton.already_exists"
    AUTOMATON_INVALID_STRUCTURE = "automaton.invalid_structure"
    AUTOMATON_STATE_NOT_FOUND = "automaton.state_not_found"
    AUTOMATON_TRANSITION_NOT_FOUND = "automaton.transition_not_found"
    AUTOMATON_CYCLIC_DEPENDENCY = "automaton.cyclic_dependency"
    
    # Package errors
    PACKAGE_NOT_FOUND = "package.not_found"
    PACKAGE_ALREADY_EXISTS = "package.already_exists"
    PACKAGE_INVALID_STRUCTURE = "package.invalid_structure"
    PACKAGE_MISSING_FUNCTION = "package.missing_function"
    PACKAGE_DEPENDENCY_NOT_FOUND = "package.dependency_not_found"