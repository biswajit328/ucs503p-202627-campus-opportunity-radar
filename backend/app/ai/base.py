from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Any AI provider must implement this. Nothing else in the app
    should depend on Gemini specifically — only on this interface."""

    @abstractmethod
    def generate_text(self, prompt: str) -> str:
        raise NotImplementedError