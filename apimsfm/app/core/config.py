import os
from typing import List
from pydantic_settings import BaseSettings
from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
from app.enums.contract_status import ContractStatus
from pathlib import Path

class Settings(BaseSettings):
    """Application settings."""

    # Extensions
    AUTOMATON_CONTRACT_EXTENSION: str = ".slac"
    SMART_CONTRACT_EXTENSION: str = ".slc"
    PACKAGE_EXTENSION: str = ".json"

    # Base directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")

    # Contract directories
    CONTRACTS_DIR: str = os.path.join(DATA_DIR, "contracts")
    CONTRACT_STATUS_DIRS: dict[ContractStatus, str] = {
        ContractStatus.DEPLOYED: os.path.join(CONTRACTS_DIR, ContractStatus.DEPLOYED.value),
        ContractStatus.DRAFT: os.path.join(CONTRACTS_DIR, ContractStatus.DRAFT.value),
    }

    # Package directory
    PACKAGES_DIR: str = os.path.join(DATA_DIR, "packages")

    # History directory
    HISTORY_DIR: str = os.path.join(DATA_DIR, "history")

    # User file path
    USERS_FILE: Path = Path(DATA_DIR) / "users" / "users.json"
    
    # Profile pictures directory
    PROFILE_PICTURES_DIR: Path = Path(DATA_DIR) / "users" / "profile"


    # Default packages path for contract generator
    DEFAULT_PACKAGES_PATHS: List[str] = [
        os.path.join(DATA_DIR, "packages", "p1.json"),
        os.path.join(DATA_DIR, "packages", "p2.json")
    ]

    # API settings
    API_PREFIX: str = "/api/v1"
    API_TITLE: str = "Multi-Scale Finite State Machine API"
    API_VERSION: str = "1.0.0"
    API_SUMMARY: str = "API for creating, compiling and deploying smart contracts based on finite state machine specifications"
    API_DESCRIPTION: str = "This is a simple API for creating, compiling and deploying smart contracts following multi-scale finite state machine specification. "

    # CORS settings
    CORS_ALLOW_ORIGINS: List[str] = ["http://localhost:5173"]  # TODO: Replace with frontend URLs in production
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # Ethereum settings
    ETHEREUM_PROVIDER_URL: str = "http://localhost:8545"
    ETHEREUM_CHAIN_ID: int = 31337
    ETHEREUM_PUBLIC_KEY: str = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ETHEREUM_PRIVATE_KEY: str = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    ETHEREUM_SOL_VERSION: str = "0.8.0"

    # JWT settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "changeme-in-prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

    # Create necessary directories
    def setup_directories(self):
        """Create necessary directories if they don't exist."""
        for path in self.CONTRACT_STATUS_DIRS.values():
            os.makedirs(path, exist_ok=True)
        os.makedirs(self.PACKAGES_DIR, exist_ok=True)
        os.makedirs(self.HISTORY_DIR, exist_ok=True)
        os.makedirs(os.path.join(self.DATA_DIR, "users"), exist_ok=True)
        os.makedirs(self.PROFILE_PICTURES_DIR, exist_ok=True)


    # Get contract directory by status
    def get_contract_dir(self, status: ContractStatus) -> str:
        """Return the path to the directory for the given contract status."""
        return self.CONTRACT_STATUS_DIRS[status]

    # Ethereum configuration
    @property
    def ethereum_config(self) -> ConfigEthereum:
        """Return Ethereum configuration for MSFSM."""
        return ConfigEthereum(
            target="ethereum",
            platform=EthereumPlatform(
                sol_version=self.ETHEREUM_SOL_VERSION,
                provider_url=self.ETHEREUM_PROVIDER_URL,
                chain_id=self.ETHEREUM_CHAIN_ID,
                pub_key=self.ETHEREUM_PUBLIC_KEY,
                priv_key=self.ETHEREUM_PRIVATE_KEY,
            ),
        )


settings = Settings()
