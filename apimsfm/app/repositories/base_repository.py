import os
import json
import re
from typing import List, TypeVar, Generic, Type, Any, Callable, Optional
from pydantic import BaseModel

from app.core.exceptions import EntityNotFoundException, EntityAlreadyExistsException

T = TypeVar('T', bound=BaseModel)

class FileSystemRepository(Generic[T]):
    """Base repository for file system operations."""
    
    def __init__(
        self, 
        directory: str, 
        file_extension: str, 
        model_class: Type[T],
        not_found_exception: Type[Exception] = EntityNotFoundException,
        already_exists_exception: Type[Exception] = EntityAlreadyExistsException
    ):
        """
        Initialize the repository.
        
        Args:
            directory: Directory where files are stored
            file_extension: File extension to use (with dot, e.g. '.json')
            model_class: Pydantic model class for deserialization
            not_found_exception: Exception to raise when entity is not found
            already_exists_exception: Exception to raise when entity already exists
        """
        self.directory = directory
        self.file_extension = file_extension
        self.model_class = model_class
        self.not_found_exception = not_found_exception
        self.already_exists_exception = already_exists_exception
        
        # Ensure directory exists
        os.makedirs(directory, exist_ok=True)
    
    def _get_filepath(self, name: str) -> str:
        """Get the full filepath for a given name."""
        sanitized_name = self._sanitize_name(name)
        return os.path.join(self.directory, f"{sanitized_name}{self.file_extension}")
    
    def _sanitize_name(self, name: str) -> str:
        """Sanitize name to be used as a filename."""
        name = name.strip()
        name = re.sub(r'[^\w\-]', '_', name)
        return name
    
    def exists(self, name: str) -> bool:
        """
        Check if a file with the given name exists.
        
        Args:
            name: Name of the entity to check
            
        Returns:
            True if the entity exists, False otherwise
        """
        filepath = self._get_filepath(name)
        return os.path.exists(filepath)
    
    def get_all(self) -> List[T]:
        """
        Get all models from directory.
        
        Returns:
            List of all models
        """
        result = []
        for filename in os.listdir(self.directory):
            if filename.endswith(self.file_extension):
                filepath = os.path.join(self.directory, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    result.append(self.model_class(**data))
                except Exception:
                    # Skip invalid files
                    continue
        return result
    
    def get_by_name(self, name: str) -> T:
        """
        Get a model by name.
        
        Args:
            name: Name of the entity to retrieve
            
        Returns:
            The model instance
            
        Raises:
            Exception: If entity is not found (type specified in constructor)
        """
        filepath = self._get_filepath(name)
        if not os.path.exists(filepath):
            raise self.not_found_exception(name)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return self.model_class(**data)
    
    def create(self, model: T) -> T:
        """
        Create a new model file.
        
        Args:
            model: Model instance to create
            
        Returns:
            The created model
            
        Raises:
            ValueError: If model has no name attribute
            Exception: If entity already exists (type specified in constructor)
        """
        if not hasattr(model, 'name'):
            raise ValueError("Model must have a 'name' attribute")
        
        filepath = self._get_filepath(model.name)
        if os.path.exists(filepath):
            raise self.already_exists_exception(model.name)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(model.model_dump(), f, indent=2, default=str)
        
        return model
    
    def update(self, name: str, model: T) -> T:
        """
        Update an existing model file.
        
        Args:
            name: Name of the entity to update
            model: Updated model instance
            
        Returns:
            The updated model
            
        Raises:
            ValueError: If model has no name attribute
            Exception: If entity is not found (type specified in constructor)
        """
        if not hasattr(model, 'name'):
            raise ValueError("Model must have a 'name' attribute")
        
        filepath = self._get_filepath(name)
        if not os.path.exists(filepath):
            raise self.not_found_exception(name)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(model.model_dump(), f, indent=2, default=str)
        
        return model
    
    def delete(self, name: str) -> bool:
        """
        Delete a model file.
        
        Args:
            name: Name of the entity to delete
            
        Returns:
            True if deleted successfully
            
        Raises:
            Exception: If entity is not found (type specified in constructor)
        """
        filepath = self._get_filepath(name)
        if not os.path.exists(filepath):
            raise self.not_found_exception(name)
        
        os.remove(filepath)
        return True