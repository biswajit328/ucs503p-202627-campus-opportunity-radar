from app.models.opportunity_eligibility import OpportunityEligibility
from app.models.student_profile import StudentProfile
from app.recommendation.eligibility import check_eligibility


def _student(branch: str = "CSE", semester: int = 4) -> StudentProfile:
    return StudentProfile(name="Test", branch=branch, semester=semester, year=2)


def _eligibility(branches=None, semesters=None, uncertain=False) -> OpportunityEligibility:
    return OpportunityEligibility(
        eligible_branches=branches or [],
        eligible_semesters=semesters or [],
        is_uncertain=uncertain,
    )


def test_eligible_when_branch_and_semester_match():
    result = check_eligibility(
        _student(branch="CSE", semester=4),
        _eligibility(branches=["CSE", "IT"], semesters=[4, 5, 6]),
    )
    assert result.status == "ELIGIBLE"


def test_not_eligible_wrong_branch_matches_spec_example():
    # Spec Section 10's own example: CSE/sem4 student, opportunity is ECE-only/sem6+
    result = check_eligibility(
        _student(branch="CSE", semester=4),
        _eligibility(branches=["ECE"], semesters=[6, 7, 8]),
    )
    assert result.status == "NOT_ELIGIBLE"


def test_not_eligible_wrong_semester_only():
    result = check_eligibility(
        _student(branch="CSE", semester=2),
        _eligibility(branches=["CSE"], semesters=[6, 7, 8]),
    )
    assert result.status == "NOT_ELIGIBLE"


def test_branch_match_is_case_insensitive():
    result = check_eligibility(
        _student(branch="cse", semester=4),
        _eligibility(branches=["CSE"], semesters=[4]),
    )
    assert result.status == "ELIGIBLE"


def test_uncertain_flag_overrides_everything():
    result = check_eligibility(
        _student(branch="CSE", semester=4),
        _eligibility(branches=["CSE"], semesters=[4], uncertain=True),
    )
    assert result.status == "UNCERTAIN"


def test_no_eligibility_data_is_uncertain():
    result = check_eligibility(_student(), None)
    assert result.status == "UNCERTAIN"


def test_empty_eligibility_lists_means_open_to_everyone():
    result = check_eligibility(
        _student(branch="ME", semester=1),
        _eligibility(branches=[], semesters=[], uncertain=False),
    )
    assert result.status == "ELIGIBLE"
    assert "all branches" in result.reasons[0]