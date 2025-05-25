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
        specification_path="./tests/data/dag2.json",
        packages_path=["./tests/data/p1.json", "./tests/data/p2.json"],
        config=config
    )

    generator.deploy()
    generator.save_to_file(path="./examples")

    deployed_smart_contracts = generator.deployed_smart_contract_info
    
    # # Créer les executors
    # executor0 = ExecutorSolidity(
    #     contract_address=deployed_smart_contracts["Automata0"]["address"],
    #     contract_abi=deployed_smart_contracts["Automata0"]["abi"],
    #     config=config,
    # )
    # executor1 = ExecutorSolidity(
    #     contract_address=deployed_smart_contracts["Automata1"]["address"],
    #     contract_abi=deployed_smart_contracts["Automata1"]["abi"],
    #     config=config,
    # )
    # executor2 = ExecutorSolidity(
    #     contract_address=deployed_smart_contracts["Automata2"]["address"],
    #     contract_abi=deployed_smart_contracts["Automata2"]["abi"],
    #     config=config,
    # )
    # executor3 = ExecutorSolidity(
    #     contract_address=deployed_smart_contracts["Automata3"]["address"],
    #     contract_abi=deployed_smart_contracts["Automata3"]["abi"],
    #     config=config,
    # )

    # print("\n=== État initial ===")
    # print(f"Automata0 state: {executor0.execute('get_current_state', [])}")
    # print(f"Automata1 state: {executor1.execute('get_current_state', [])}")
    
    # print("\n=== Test 1: Essayer d'exécuter Automata1.a() sans Automata0 complété ===")
    # try:
    #     executor1.execute("a", [])
    #     print(" ERREUR: Automata1.a() ne devrait pas fonctionner!")
    # except Exception as e:
    #     print(" Correct: Automata1.a() a échoué car Automata0 n'est pas COMPLETED")
    #     print(f"   Erreur: {str(e)}")
    
    # print("\n=== Test 2: Compléter Automata0 ===")
    # print("Exécution Automata0.a()...")
    # executor0.execute("a", [])
    # print(f"Automata0 state après a(): {executor0.execute('get_current_state', [])} (devrait être 1 = Q1)")
    
    # print("Exécution Automata0.b()...")
    # executor0.execute("b", [])
    # print(f"Automata0 state après b(): {executor0.execute('get_current_state', [])} (devrait être 2 = COMPLETED)")
    # print(f"Automata0 is_completed: {executor0.execute('is_completed', [])}")
    
    # print("\n=== Test 3: Maintenant Automata1.a() devrait fonctionner ===")
    # executor1.execute("a", [])
    # print(f"✅ Automata1 state après a(): {executor1.execute('get_current_state', [])} (devrait être 1 = Q1)")
    
    # print("\n=== Test 4: Essayer Automata1.b() sans Automata2 complété ===")
    # try:
    #     executor1.execute("b", [])
    #     print(" ERREUR: Automata1.b() ne devrait pas fonctionner!")
    # except Exception as e:
    #     print(" Correct: Automata1.b() a échoué car Automata2 n'est pas COMPLETED")
    
    # print("\n=== Test 5: État final ===")
    # print(f"Automata0: state={executor0.execute('get_current_state', [])}, completed={executor0.execute('is_completed', [])}")
    # print(f"Automata1: state={executor1.execute('get_current_state', [])}, completed={executor1.execute('is_completed', [])}")
    # print(f"Automata2: state={executor2.execute('get_current_state', [])}, completed={executor2.execute('is_completed', [])}")
    # print(f"Automata3: state={executor3.execute('get_current_state', [])}, completed={executor3.execute('is_completed', [])}")


if __name__ == "__main__":
    main()