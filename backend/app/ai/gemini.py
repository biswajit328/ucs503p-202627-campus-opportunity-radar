import os

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

from app.ai.base import AIProvider

load_dotenv()

DEFAULT_MODEL = "gemini-3.6-flash"


class GeminiProvider(AIProvider):
    def __init__(self, model: str = DEFAULT_MODEL):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        self._client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                retry_options=types.HttpRetryOptions(
                    attempts=3,
                    initial_delay=1.0,
                    max_delay=10.0,
                    exp_base=2.0,
                    jitter=1.0,
                    http_status_codes=[408, 429, 500, 502, 503, 504],
                )
            )
        )
        self._model = model

    def generate_text(self, prompt: str) -> str:
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
        )
        return response.text

    def generate_structured(self, prompt: str, schema: type[BaseModel]) -> str:
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
        return response.text