from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
from msfsm.solidity.generator import GeneratorSolidity


def main():
    config = ConfigEthereum(
        target="ethereum",
        platform=EthereumPlatform(
            sol_version="0.8.29",
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

    generator.save_to_file(
        path="./examples",
    )

if __name__ == "__main__":
    main()