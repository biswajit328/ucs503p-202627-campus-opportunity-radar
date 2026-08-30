from app.ai.prompts import build_extraction_prompt
from app.ai.schemas import ExtractedOpportunity
from app.ai.service import AIService


def extract_opportunity(ai_service: AIService, raw_text: str) -> ExtractedOpportunity:
    prompt = build_extraction_prompt(raw_text)
    raw_json = ai_service.extract_json(prompt, ExtractedOpportunity)
    return ExtractedOpportunity.model_validate_json(raw_json)