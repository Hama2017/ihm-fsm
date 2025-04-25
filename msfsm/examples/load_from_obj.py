from msfsm.solidity.config import ConfigEthereum, EthereumPlatform
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

    specification_obj = {
        "name": "Test",
        "automatons": {
            "Automata0": {
                "states": [
                    "q0",
                    "q1",
                    "completed"
                ],
                "transitions": [
                    {
                        "source": "q0",
                        "destination": "q1",
                        "trigger": "a",
                        "conditions": [
                            "package__p1__c1"
                        ]
                    },
                    {
                        "source": "q1",
                        "destination": "completed",
                        "trigger": "b",
                        "conditions": [
                            "package__p1__c2"
                        ]
                    }
                ]
            },
            "Automata1": {
                "states": [
                    "q0",
                    "q1",
                    "q2",
                    "completed"
                ],
                "transitions": [
                    {
                        "source": "q0",
                        "destination": "q1",
                        "trigger": "a",
                        "conditions": [
                            "automata__Automata0__is_completed"
                        ]
                    },
                    {
                        "source": "q1",
                        "destination": "q2",
                        "trigger": "b",
                        "conditions": [
                            "automata__Automata2__is_completed"
                        ]
                    },
                    {
                        "source": "q2",
                        "destination": "completed",
                        "trigger": "c",
                        "conditions": [
                            "automata__Automata3__is_completed"
                        ]
                    }
                ]
            },
            "Automata2": {
                "states": [
                    "q0",
                    "q1",
                    "completed"
                ],
                "transitions": [
                    {
                        "source": "q0",
                        "destination": "q1",
                        "trigger": "a",
                        "conditions": [
                            "package__p2__c1"
                        ]
                    },
                    {
                        "source": "q1",
                        "destination": "completed",
                        "trigger": "b",
                        "conditions": [
                            "automata__Automata0__is_completed"
                        ]
                    }
                ]
            },
            "Automata3": {
                "states": [
                    "q0",
                    "q1",
                    "completed"
                ],
                "transitions": [
                    {
                        "source": "q0",
                        "destination": "q1",
                        "trigger": "a",
                        "conditions": [
                            "package__p2__c1"
                        ]
                    },
                    {
                        "source": "q1",
                        "destination": "completed",
                        "trigger": "b",
                        "conditions": [
                            "automata__Automata2__is_completed"
                        ]
                    }
                ]
            },
            "Automata4": {
                "states": [
                    "q0",
                    "q1",
                    "completed"
                ],
                "transitions": [
                    {
                        "source": "q0",
                        "destination": "q1",
                        "trigger": "a",
                        "conditions": [
                            "package__p2__c1"
                        ]
                    },
                    {
                        "source": "q1",
                        "destination": "completed",
                        "trigger": "b",
                        "conditions": [
                            "automata__Automata3__is_completed"
                        ]
                    }
                ]
            }
        },
        "required_packages": [
            "p1",
            "p2"
        ]
    }

    generator = GeneratorSolidity(
        specification_obj=specification_obj,
        packages_path=["./tests/data/p1.json", "./tests/data/p2.json"],
        config=config
    )

    generator.deploy()

if __name__ == "__main__":
    main()