from pydantic import BaseModel

from app.ai.base import AIProvider
from app.ai.gemini import GeminiProvider


class AIService:
    def __init__(self, provider: AIProvider | None = None):
        self._provider = provider or GeminiProvider()

    def generate_text(self, prompt: str) -> str:
        return self._provider.generate_text(prompt)

    def extract_json(self, prompt: str, schema: type[BaseModel]) -> str:
        return self._provider.generate_structured(prompt, schema)