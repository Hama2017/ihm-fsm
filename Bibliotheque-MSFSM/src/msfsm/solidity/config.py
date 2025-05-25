from msfsm.common.config import Config
from pydantic import BaseModel


class EthereumPlatform(BaseModel):
    sol_version: str
    provider_url: str
    chain_id: int
    pub_key: str
    priv_key: str


class ConfigEthereum(Config):
    platform: EthereumPlatform