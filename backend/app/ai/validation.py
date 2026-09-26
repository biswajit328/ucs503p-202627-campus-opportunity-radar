from datetime import date

from pydantic import BaseModel

from app.ai.schemas import ExtractedOpportunity


class ExtractionReview(BaseModel):
    needs_review: bool
    issues: list[str] = []
    parsed_deadline: date | None = None


def validate_extraction(extracted: ExtractedOpportunity) -> ExtractionReview:
    issues: list[str] = []
    needs_review = extracted.is_uncertain

    if not extracted.title.strip():
        issues.append("Title is empty.")
        needs_review = True

    if not extracted.organizer.strip():
        issues.append("Organizer is empty.")
        needs_review = True

    parsed_deadline: date | None = None
    try:
        parsed_deadline = date.fromisoformat(extracted.deadline)
    except (ValueError, TypeError):
        issues.append(f"Deadline '{extracted.deadline}' is not a valid date.")
        needs_review = True

    if parsed_deadline is not None and parsed_deadline < date.today():
        issues.append(f"Deadline {parsed_deadline.isoformat()} is already in the past.")
        needs_review = True

    if not extracted.is_uncertain and not extracted.eligible_branches and not extracted.eligible_academic_levels:
        issues.append(
            "Marked as certain, but no eligibility (branches or academic levels) was extracted."
        )
        needs_review = True

    if not extracted.skills:
        issues.append("No skills were extracted.")

    return ExtractionReview(needs_review=needs_review, issues=issues, parsed_deadline=parsed_deadline)