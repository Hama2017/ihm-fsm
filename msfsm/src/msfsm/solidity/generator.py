from typing import List
from msfsm.common.generator import Generator
from msfsm.common.package import Package
from msfsm.common.specification import Specification, TransitionModel
from msfsm.solidity.compiler import CompilerSolidity
from msfsm.solidity.config import ConfigEthereum
from msfsm.solidity.deployer import DeployerSolidity
from solcx import install_solc


class GeneratorSolidity(Generator):
    """
    Generator for Solidity code from MSFSM specification and packages.
    Args:
        specification (Specification): Specification object
        packages (List[Package]): List of Package objects
        config (ConfigEthereum): Configuration object for the generator
    """

    def __init__(
        self,
        specification_path: str = None,
        specification_obj: dict = None,
        packages_path: List[str] = [],
        config: ConfigEthereum = None
    ):
        super().__init__(specification_path, specification_obj, packages_path, config)

        install_solc(self.config.platform.sol_version)

        print(self.specification)

        self.result: List[str] = {
            key: "" for key, _ in self.specification.data.automatons.items()
        }
        self.keys: dict[int, str] = {
            (idx): key
            for idx, (key, _) in enumerate(self.specification.data.automatons.items())
        }
        self.deployed_smart_contract_info: dict = {
            key: {} for key, _ in self.specification.data.automatons.items()
        }

    def _set_pragma(self, automaton_name: str) -> None:
        """
        Sets the pragma statement for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set pragma for.
        """
        self.result[
            automaton_name
        ] += f"pragma solidity ^{self.config.platform.sol_version};"

    def _set_header(self, automaton_name: str) -> None:
        """
        Sets the header for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set header for.
        """
        self.result[automaton_name] += f"contract {automaton_name} {{"

    def _set_footer(self, automaton_name: str) -> None:
        """
        Sets the footer for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set footer for.
        """
        self.result[automaton_name] += "}"

    def _set_states(self, automaton_name: str) -> None:
        """
        Sets the states for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set states for.
        """
        self.result[automaton_name] += f"enum State {{"
        states = self.specification.data.automatons[automaton_name].states

        for idx, s in enumerate(states):
            self.result[automaton_name] += f"{s.upper()}"

            if idx < len(states) - 1:
                self.result[automaton_name] += ","

        self.result[automaton_name] += "}"
        self.result[
            automaton_name
        ] += f"State currentState = State.{states[0].upper()};"

    def _set_structs(self, automaton_name: str) -> None:
        """
        Sets the structs for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set structs for.
        """
        used_packages = set(self.specification.used_packages[automaton_name])

        for package_name in used_packages:
            structs = self.packages[package_name].data.structs

            for s in structs:
                self.result[automaton_name] += f"{s.code}"

    def _set_variables(self, automaton_name: str) -> None:
        """
        Sets the variables for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set variables for.
        """
        used_packages = set(self.specification.used_packages[automaton_name])

        for package_name in used_packages:
            variables = self.packages[package_name].data.variables

            for v in variables:
                self.result[automaton_name] += f"{v.code}"

    def _get_transitions_by_trigger_name(
        self, automaton_name: str, trigger_name: str
    ) -> List[TransitionModel]:
        """
        Returns a list of transitions for the given automaton name and trigger.
        Args:
            automaton_name (str): Name of the automaton to get transitions for.
            trigger_name (str): Trigger name for the transitions.
        Returns:
            list: A list of transitions.
        """
        transitions = self.specification.data.automatons[automaton_name].transitions
        return [t for t in transitions if t.trigger == trigger_name]

    def _get_conditions_by_trigger_name(
        self, automaton_name: str, trigger_name: str
    ) -> List[str]:
        """
        Returns a list of conditions for the given automaton name and trigger.
        Args:
            automaton_name (str): Name of the automaton to get conditions for.
            trigger_name (str): Trigger name for the conditions.
        Returns:
            list: A list of conditions.
        """
        transitions = self.specification.data.automatons[automaton_name].transitions
        return [t.conditions for t in transitions if t.trigger == trigger_name]

    def _get_unique_conditions(self, automaton_name: str, trigger_name: str) -> set:
        """
        Returns a set of unique conditions for the given automaton name and trigger.
        Args:
            automaton_name (str): Name of the automaton to get conditions for.
            trigger_name (str): Trigger name for the conditions.
        Returns:
            set: A set of unique conditions.
        """
        return set(
            [
                x
                for xs in self._get_conditions_by_trigger_name(
                    automaton_name, trigger_name
                )
                for x in xs
            ]
        )

    def _set_conditions_by_trigger_name(
        self, transitions, automaton_name: str, trigger_name: str
    ):
        """
        Sets the conditions for the given automaton name and trigger.
        Args:
            transitions (list): List of transitions for the automaton.
            automaton_name (str): Name of the automaton to set functions for.
            trigger_name (str): Trigger name for the conditions.
        """
        conditions = (
            " && ".join([c + "()" for c in transitions[0].conditions])
            + " && "
            + f"currentState == State.{transitions[0].source.upper()}"
        )
        self.result[automaton_name] += f"if ({conditions}) {{"
        self.result[
            automaton_name
        ] += f"currentState = State.{transitions[0].destination.upper()};"
        self.result[automaton_name] += "}"

        for t in transitions[1:]:
            conditions = (
                " && ".join([c + "()" for c in t.conditions])
                + " && "
                + f"currentState == State.{t.source.upper()}"
            )
            self.result[automaton_name] += f"else if ({conditions}) {{"
            self.result[
                automaton_name
            ] += f"currentState = State.{t.destination.upper()};"
            self.result[automaton_name] += "}"

    def _set_requires_by_trigger_name(
        self, transitions, automaton_name: str, trigger_name: str
    ):
        """
        Sets the require statements for the given automaton name and trigger.
        Args:
            transitions (list): List of transitions for the automaton.
            automaton_name (str): Name of the automaton to set functions for.
            trigger_name (str): Trigger name for the require statements.
        """
        self.result[automaton_name] += f"require("

        for idx, t in enumerate(transitions):
            self.result[automaton_name] += f"currentState == State.{t.source.upper()}"

            if idx != len(transitions) - 1:
                self.result[automaton_name] += "||"

        self.result[automaton_name] += ");"

    def _set_default_functions(
        self, automaton_name
    ):
        """
        Sets the default functions for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set functions for.
        """
        for pacakge_name, p in self.packages.items():
            for function_name, f in p.data.functions.items():
                if f.default:
                    self.result[automaton_name] += f.code

    def _set_transitional_functions_by_trigger_name(
        self, automaton_name: str, trigger_name: str
    ):
        """
        Sets the transitional functions for the given automaton name and trigger.
        Args:
            automaton_name (str): Name of the automaton to set functions for.
            trigger_name (str): Trigger name for the transitional functions.
        """
        transitions = self._get_transitions_by_trigger_name(
            automaton_name, trigger_name
        )

        self.result[automaton_name] += f"function {trigger_name}() public {{"
        self._set_requires_by_trigger_name(transitions, automaton_name, trigger_name)
        self._set_conditions_by_trigger_name(transitions, automaton_name, trigger_name)
        self.result[automaton_name] += "}"

    def _set_conditional_functions_by_trigger_name(
        self, automaton_name: str, trigger: str
    ):
        """
        Sets the conditional functions for the given automaton name and trigger.
        Args:
            automaton_name (str): Name of the automaton to set functions for.
            trigger (str): Trigger name for the conditional functions.
        """
        conditions = self._get_unique_conditions(automaton_name, trigger)

        for c in conditions:
            condition_type = c.split("__")[0]
            package_name = c.split("__")[1]
            function_name = c.split("__")[2]

            if condition_type == "package":  # package function
                self.result[automaton_name] += (
                    self.packages[package_name].data.functions[function_name].code
                )
            elif condition_type == "automata":  # delegate call function
                self.result[
                    automaton_name
                ] += f"function {c}() public returns (bool) {{"
                self.result[
                    automaton_name
                ] += f'(bool success, ) = address({self.deployed_smart_contract_info[package_name]["address"]}).delegatecall(abi.encodeWithSignature("is_completed()"));'
                self.result[automaton_name] += "return success;"
                self.result[automaton_name] += "}"
            else:
                raise ValueError(f"Unknown condition type: {condition_type}")

    def _set_functions(self, automaton_name: str):
        """
        Sets the functions for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to set functions for.
        """
        triggers = set(
            [
                t.trigger
                for t in self.specification.data.automatons[automaton_name].transitions
            ]
        )

        for t in triggers:
            self._set_conditional_functions_by_trigger_name(automaton_name, t)

        for t in triggers:
            self._set_transitional_functions_by_trigger_name(automaton_name, t)

        self._set_default_functions(automaton_name)

    def generate(self, automaton_name: str):
        """
        Generates the Solidity code for the given automaton name.
        Args:
            automaton_name (str): Name of the automaton to generate code for.
        """
        self._set_pragma(automaton_name)
        self._set_header(automaton_name)
        self._set_states(automaton_name)
        self._set_variables(automaton_name)
        self._set_structs(automaton_name)
        self._set_functions(automaton_name)
        self._set_footer(automaton_name)

    def deploy(self):
        """
        Deploys the generated Solidity code to the blockchain.
        """
        automaton_order = self.specification.get_automatons_order()

        for depth in range(1, len(automaton_order) + 1):
            for automaton_index in automaton_order[depth]:
                automaton_name = self.keys[automaton_index]

                self.generate(self.keys[automaton_index])

                abi, bytecode = CompilerSolidity(
                    self.keys[automaton_index], self.result[automaton_name], self.config
                ).compile()

                self.deployed_smart_contract_info[automaton_name]["address"] = (
                    DeployerSolidity(
                        automaton_name, abi, bytecode, self.config
                    ).deploy()
                )
                self.deployed_smart_contract_info[automaton_name]["abi"] = abi
