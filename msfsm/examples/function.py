from msfsm.common.generator import Generator
from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
from msfsm.solidity.executor import ExecutorSolidity
from msfsm.solidity.generator import GeneratorSolidity


def main():
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

    deployed_smart_contracts = generator.deployed_smart_contract_info
    contract_automata1 = deployed_smart_contracts["Automata0"]

    executor = ExecutorSolidity(
        contract_automata1["address"],
        contract_automata1["abi"],
        config
    )
    executor.execute(
        "get_current_state",
        []
    )

if __name__ == "__main__":
    main()