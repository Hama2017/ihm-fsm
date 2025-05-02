import os
from pydantic_settings import BaseSettings
from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
from typing import List

class Settings(BaseSettings):
    """Application settings."""
    
    # Base directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    # Contract directories
    CONTRACTS_DIR: str = os.path.join(DATA_DIR, "contracts")
    DEPLOYED_CONTRACTS_DIR: str = os.path.join(CONTRACTS_DIR, "deployed")
    DRAFT_CONTRACTS_DIR: str = os.path.join(CONTRACTS_DIR,"draft")

    # Package directory
    PACKAGES_DIR: str = os.path.join(DATA_DIR, "packages")
    
    # Default packages path for contract generator
    DEFAULT_PACKAGES_PATHS: List[str] = [
        os.path.join(DATA_DIR, "packages", "p1.json"), 
        os.path.join(DATA_DIR, "packages", "p2.json")
    ]
    
    # API settings
    API_PREFIX: str = ""
    API_TITLE: str = "Multi-Scale Finite State Machine API"
    API_VERSION: str = "1.0.0"
    API_SUMMARY: str = "API for creating, compiling and deploying smart contracts following multi-scale finite state machine specification"
    API_DESCRIPTION: str = "This is a simple API for creating, compiling and deploying smart contracts following multi-scale finite state machine specification. It also allows you to execute functions of the deployed smart contracts."
    
    
    # Ethereum settings
    ETHEREUM_PROVIDER_URL: str = "http://localhost:8545"
    ETHEREUM_CHAIN_ID: int = 31337
    ETHEREUM_PUBLIC_KEY: str = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ETHEREUM_PRIVATE_KEY: str = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    ETHEREUM_SOL_VERSION: str = "0.8.0"
    
    # Create necessary directories
    def setup_directories(self):
        """Create necessary directories if they don't exist."""
        os.makedirs(self.DEPLOYED_CONTRACTS_DIR, exist_ok=True)
        os.makedirs(self.SLCA_CONTRACTS_DIR, exist_ok=True)
        os.makedirs(self.PACKAGES_DIR, exist_ok=True)
    
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