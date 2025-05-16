import json
import logging
from typing import Dict, List, Optional
from pydantic import BaseModel, ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StructModel(BaseModel):
    name: str
    code: str


class VariableModel(BaseModel):
    name: str
    code: str


class FunctionModel(BaseModel):
    code: str
    default: bool
    label: Optional[str] = None
    description: Optional[str] = None


class PackageModel(BaseModel):
    id: str
    label: Optional[str] = None
    description: Optional[str] = None
    functions: Dict[str, FunctionModel]
    structs: List[StructModel] = []
    variables: List[VariableModel] = []


class Package:
    def __init__(self):
        self.data: Optional[PackageModel] = None
    
    def load(self, path: str):
        """
        Load a package from a JSON file and validate its structure.
        Args:
            path (str): Path to the JSON file.
        Returns:
            Package: The current instance with loaded data.
        """
        try:
            with open(path, "r") as f:
                data = json.load(f)
            
            self.data = PackageModel(**data)
            return self
        except ValidationError as ve:
            logger.error("Validation failed: %s", ve)
            raise ve
        except Exception as e:
            logger.error("Failed to load package: %s", e)
            raise e