from typing import Literal

from pydantic import BaseModel

from app.models.opportunity_eligibility import OpportunityEligibility
from app.models.student_profile import StudentProfile

EligibilityStatus = Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNCERTAIN"]


class EligibilityResult(BaseModel):
    status: EligibilityStatus
    reasons: list[str]


def check_eligibility(
    student: StudentProfile, eligibility: OpportunityEligibility | None
) -> EligibilityResult:
    if eligibility is None or eligibility.is_uncertain:
        return EligibilityResult(
            status="UNCERTAIN",
            reasons=["Eligibility criteria could not be confidently determined from the source."],
        )

    reasons: list[str] = []
    branch_ok = True
    semester_ok = True

    if eligibility.eligible_branches:
        branch_ok = any(
            b.strip().lower() == student.branch.strip().lower() for b in eligibility.eligible_branches
        )
        if branch_ok:
            reasons.append(f"{student.branch} is an eligible branch")
        else:
            reasons.append(
                f"{student.branch} is not in the eligible branches "
                f"({', '.join(eligibility.eligible_branches)})"
            )

    if eligibility.eligible_semesters:
        semester_ok = student.semester in eligibility.eligible_semesters
        if semester_ok:
            reasons.append(f"Semester {student.semester} is eligible")
        else:
            semesters = ", ".join(str(s) for s in eligibility.eligible_semesters)
            reasons.append(f"Semester {student.semester} is not eligible (open to: {semesters})")

    if not reasons:
        reasons.append("Open to all branches and semesters")

    status: EligibilityStatus = "ELIGIBLE" if (branch_ok and semester_ok) else "NOT_ELIGIBLE"
    return EligibilityResult(status=status, reasons=reasons)