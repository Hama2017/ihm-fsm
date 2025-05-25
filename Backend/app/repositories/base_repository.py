import os
import json
import re
from typing import List, TypeVar, Generic, Type, Any, Optional
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
    
    def _get_filepath(self, entity_id: str) -> str:
        """Get the full filepath for a given entity ID."""
        sanitized_id = self._sanitize_id(entity_id)
        return os.path.join(self.directory, f"{sanitized_id}{self.file_extension}")
    
    def _sanitize_id(self, entity_id: str) -> str:
        """Sanitize ID to be used as a filename."""
        entity_id = str(entity_id).strip()
        entity_id = re.sub(r'[^\w\-]', '_', entity_id)
        return entity_id
    
    def exists(self, entity_id: str) -> bool:
        """
        Check if a file with the given entity ID exists.
        
        Args:
            entity_id: ID of the entity to check
            
        Returns:
            True if the entity exists, False otherwise
        """
        filepath = self._get_filepath(entity_id)
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
    
    def get_by_id(self, entity_id: str) -> T:
        """
        Get a model by its ID.
        
        Args:
            entity_id: ID of the entity to retrieve
            
        Returns:
            The model instance
            
        Raises:
            Exception: If entity is not found
        """
        filepath = self._get_filepath(entity_id)
        if not os.path.exists(filepath):
            raise self.not_found_exception(entity_id)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return self.model_class(**data)
    
    def get_by_field(self, field_name: str, field_value: Any) -> List[T]:
        """
        Get all models where a specific field matches a value.
        
        Args:
            field_name: Name of the field to match
            field_value: Value to match
            
        Returns:
            List of models matching the criteria
        """
        all_entities = self.get_all()
        return [
            entity for entity in all_entities 
            if hasattr(entity, field_name) and getattr(entity, field_name) == field_value
        ]
    
    def create(self, model: T) -> T:
        """
        Create a new model file.
        
        Args:
            model: Model instance to create
            
        Returns:
            The created model
            
        Raises:
            ValueError: If model has no id attribute
            Exception: If entity already exists
        """
        if not hasattr(model, 'id'):
            raise ValueError("Model must have an 'id' attribute")
        
        if self.exists(model.id):
            raise self.already_exists_exception(model.id)
        
        filepath = self._get_filepath(model.id)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(model.model_dump(), f, indent=2, default=str)
        
        return model
    
    def update(self, entity_id: str, model: T) -> T:
        """
        Update an existing model file.
        
        Args:
            entity_id: ID of the entity to update
            model: Updated model instance
            
        Returns:
            The updated model
            
        Raises:
            ValueError: If model has no id attribute
            Exception: If entity is not found
        """
        if not hasattr(model, 'id'):
            raise ValueError("Model must have an 'id' attribute")
        
        # Ensure the ID remains the same
        model.id = entity_id
        
        if not self.exists(entity_id):
            raise self.not_found_exception(entity_id)
        
        filepath = self._get_filepath(entity_id)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(model.model_dump(), f, indent=2, default=str)
        
        return model
    
    def delete(self, entity_id: str) -> bool:
        """
        Delete a model file.
        
        Args:
            entity_id: ID of the entity to delete
            
        Returns:
            True if deleted successfully
            
        Raises:
            Exception: If entity is not found
        """
        filepath = self._get_filepath(entity_id)
        if not os.path.exists(filepath):
            raise self.not_found_exception(entity_id)
        
        os.remove(filepath)
        return True