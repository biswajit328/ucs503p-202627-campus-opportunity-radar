from app.ai.prompts import build_extraction_prompt
from app.ai.schemas import ExtractedOpportunity
from app.ai.service import AIService
from app.ai.validation import ExtractionReview, validate_extraction


def extract_opportunity(ai_service: AIService, raw_text: str) -> ExtractedOpportunity:
    prompt = build_extraction_prompt(raw_text)
    raw_json = ai_service.extract_json(prompt, ExtractedOpportunity)
    return ExtractedOpportunity.model_validate_json(raw_json)


def extract_and_review(ai_service: AIService, raw_text: str) -> tuple[ExtractedOpportunity, ExtractionReview]:
    extracted = extract_opportunity(ai_service, raw_text)
    review = validate_extraction(extracted)
    return extracted, review