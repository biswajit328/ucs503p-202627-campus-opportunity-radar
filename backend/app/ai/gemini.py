import os

from dotenv import load_dotenv
from google import genai

from app.ai.base import AIProvider

load_dotenv()

DEFAULT_MODEL = "gemini-3.6-flash"


class GeminiProvider(AIProvider):
    def __init__(self, model: str = DEFAULT_MODEL):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        self._client = genai.Client(api_key=api_key)
        self._model = model

    def generate_text(self, prompt: str) -> str:
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
        )
        return response.text