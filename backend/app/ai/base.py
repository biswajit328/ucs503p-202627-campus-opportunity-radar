from abc import ABC, abstractmethod

from pydantic import BaseModel


class AIProvider(ABC):
    """Any AI provider must implement this. Nothing else in the app
    should depend on Gemini specifically — only on this interface."""

    @abstractmethod
    def generate_text(self, prompt: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate_structured(self, prompt: str, schema: type[BaseModel]) -> str:
        """Return raw JSON text conforming to the given Pydantic schema."""
        raise NotImplementedError