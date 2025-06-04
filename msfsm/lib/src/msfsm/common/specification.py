import json

from typing import List, Dict, Tuple
from msfsm.common.graph import Graph
from pydantic import BaseModel

from msfsm.common.package import Package


CONDITION_SEPARATOR = "__"


class TransitionModel(BaseModel):
    source: str
    destination: str
    trigger: str
    conditions: List[str]


class AutomatonModel(BaseModel):
    states: List[str]
    transitions: List[TransitionModel]


class SpecificationModel(BaseModel):
    name: str
    automatons: Dict[str, AutomatonModel]
    required_packages: List[str]


class Specification:
    """
    Specification class for loading and managing MSFSM specifications.
    Args:
        None
    """

    def __init__(self):
        self.data: SpecificationModel = None
        self.used_packages = None

    def load_from_file(self, path: str):
        """
        Load a specification from a JSON file and validate its structure.
        Args:
            path (str): Path to the JSON file.
        Returns:
            Specification: The current instance with loaded data.
        """
        try:
            with open(path) as f:
                data = json.load(f)

            self.data = SpecificationModel(**data)
            self.set_used_packages_by_automaton()

            return self
        except Exception as e:
            raise e
        
    def load_from_obj(self, obj):
        """
        Load a specification from a Python object and validate its structure.
        Args:
            obj (dict): The specification object.
        Returns:
            Specification: The current instance with loaded data.
        """
        self.data = obj
        self.set_used_packages_by_automaton()
        return self

    def get_dependency_graph(self) -> Tuple[Dict[str, int], Dict[int, List[int]]]:
        """
        Get the dependency graph of the automatons.
        Returns:
            Tuple[Dict[str, int], Dict[int, List[int]]]: A tuple containing a dictionary of automaton names to indices
            and a list of lists representing the graph.
        """
        keys = {key: idx for idx, key in enumerate(self.data.automatons.keys())}
        graph = [[] for _ in range(len(keys))]

        for automaton_name, automaton in self.data.automatons.items():
            graph[keys[automaton_name]] = []
            for transition in automaton.transitions:
                for condition in transition.conditions:
                    if condition.startswith("automata"):
                        graph[keys[automaton_name]].append(
                            keys[condition.split(CONDITION_SEPARATOR)[1]]
                        )

        return graph

    def set_used_packages_by_automaton(self):
        """
        Set the used packages for each automaton based on the conditions in the transitions.
        This method populates the `used_packages` attribute with a dictionary where keys are automaton names
        and values are lists of package names used in the conditions.
        """
        used_packages = {}
        for automaton_name, automaton in self.data.automatons.items():
            for transition in automaton.transitions:
                for condition in transition.conditions:
                    if automaton_name not in used_packages:
                        used_packages[automaton_name] = []
                    if condition.startswith("package"):
                        package_name = condition.split(CONDITION_SEPARATOR)[1]
                        if package_name not in used_packages:
                            used_packages[automaton_name].append(package_name)

        self.used_packages = used_packages

    def get_required_packages_obj(self) -> List[Package]:
        return [Package().load(p) for p in self.data.required_packages]

    def get_automatons_order(self) -> Tuple[Dict[str, int], Dict[int, List[int]]]:
        """
        Get the order of automatons based on their dependencies.
        This method uses a topological sort to determine the order of automatons.
        Returns:
            Tuple[Dict[str, int], Dict[int, List[int]]]: A tuple containing a dictionary of automaton names to indices
            and a list of lists representing the graph.
        """
        graph = self.get_dependency_graph()

        return Graph(graph).get_depths()
