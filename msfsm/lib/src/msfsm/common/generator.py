from msfsm.common.config import Config
from msfsm.common.package import Package
from msfsm.common.specification import Specification
from typing import List



class Generator:
    """
    Generator class for deploying code from MSFSM specification and packages.
    Args:
        specification_path (str): Path to the MSFSM specification file
        packages_path (List[str]): List of paths to the package files
        config (ConfigGenerator): Configuration object for the generator
    """

    def __init__(
        self,
        specification_path: str = None,
        specification_obj: dict = None,
        packages_path: List[str] = [],
        config: Config = None
    ):
        self.specification = self.load_specification(specification_path=specification_path, specification_obj=specification_obj)
        self.packages = self.load_packages(packages_path)

        self.config = config

    def load_specification(self, specification_path=None, specification_obj=None):
        """
        Load the specification from a file or an object.
        Args:
            specification_path (str): Path to the MSFSM specification file
            specification_obj (dict): Specification object
        """
        if specification_path:
            return Specification().load_from_file(specification_path)
        elif specification_obj:
            return Specification().load_from_obj(specification_obj)
        else:
            raise ValueError("Either specification_path or specification_obj must be provided.")

    def load_packages(self, packages_path: List[str]) -> None:
        """
        Load packages from the given paths.
        Args:
            packages_path (List[str]): List of paths to the package files
        Returns:
            packages (dict): Dictionary of loaded packages
        """
        packages = {}

        for path in packages_path:
            package = Package().load(path)
            packages[package.data.name] = package

        return packages