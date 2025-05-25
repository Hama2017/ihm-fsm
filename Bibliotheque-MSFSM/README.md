# MSFSM

The msfsm module is designed to generate, compile, and deploy smart contracts from a multi-scale specification of non-deterministic finite state machines. Currently, it only supports generating Solidity code for Ethereum platform.

Here is a simple example of how to use the msfsm module to deploy a Solidity smart contract from a specification:
```python
from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
from msfsm.solidity.generator import GeneratorSolidity

config = ConfigEthereum(
    target="ethereum",
    platform=EthereumPlatform(
        sol_version="0.8.0",
        provider_url="http://localhost:8545",
        chain_id=31337,
        pub_key="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        priv_key="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ),
)

generator = GeneratorSolidity(
    specification_path="./tests/data/dag.json",
    packages_path=["./tests/data/p1.json", "./tests/data/p2.json"],
    config=config
)

generator.deploy()
```

This is only for research purposes. The msfsm module is not intended for production use and should not be used in any production environment. The authors of this module are not responsible for any damages or losses that may occur as a result of using this module. Use at your own risk.

## Examples

You can run some examples with the following command:
```bash
poetry run python examples/{example_name}.py
```