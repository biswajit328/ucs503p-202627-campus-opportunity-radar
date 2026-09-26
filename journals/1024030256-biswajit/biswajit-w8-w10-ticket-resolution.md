# Weeks 8–10 : Three Decisions About What the Recommendation Engine Should Refuse to Do

# Three States Instead of Two, Scoring That Doesn't Filter, and a 404 That Isn't a Bug

Roll No. 1024030256
Name: Biswajit Mandal

Weeks 8–10 built the actual core of the product — the eligibility
engine, the weighted scoring formula, the ranked recommendations
endpoint, and application tracking. Unlike the earlier debugging-
heavy stretches, this one's more accurately described by what
*didn't* go into it — three separate points where the simpler,
more obvious version of something was deliberately not built,
because the simpler version would have been wrong in a way that
wouldn't show up until later.

---

## Incident 1 : Why Eligibility Needed Three States, Proven Against the Spec's Own Example

### Relevant Context

The spec's Section 10 gives a single worked example: a CSE, semester-4
student against an opportunity restricted to ECE, semester 6+. The
obvious implementation is a boolean — eligible or not.

### Key Observation

That example only has one honest answer because both facts are fully
known. Section 10 also says, in the very next line: *"If eligibility
information is uncertain, mark it as uncertain rather than inventing
eligibility."* A boolean has no way to represent that — it would be
forced to guess `True` or `False` for an opportunity where the AI
extraction step (Weeks 5–7) already flagged `is_uncertain: true`, or
where an admin entered no eligibility data at all. Collapsing "we
don't know" into "not eligible" would silently hide opportunities a
student might genuinely qualify for; collapsing it into "eligible"
would show things they might not.

### Solution

```python
EligibilityStatus = Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNCERTAIN"]
```

Tested directly against the spec's own example first, before any of
the edge cases:

```python
def test_not_eligible_wrong_branch_matches_spec_example():
    # Spec Section 10's own example: CSE/sem4 student, opportunity is ECE-only/sem6+
    result = check_eligibility(_student(branch="CSE", semester=4), _eligibility(branches=["ECE"], semesters=[6, 7, 8]))
    assert result.status == "NOT_ELIGIBLE"
```

Then the case a boolean can't express:
```python
def test_uncertain_flag_overrides_everything():
    result = check_eligibility(_student(), _eligibility(branches=["CSE"], semesters=[4], uncertain=True))
    assert result.status == "UNCERTAIN"
```

### Because

The three-state model isn't more complex for its own sake — it's the
minimum needed to keep a promise the spec makes explicitly. A model
that can only say yes or no would have to lie in exactly the cases
where honesty matters most: the ones where the source data was too
thin to know for sure.

---

## Incident 2 : Keeping the Scoring Function From Deciding What a Student Gets to See

### Relevant Context

`score_opportunity` needed to account for eligibility as part of its
30/25/20/15/10 weighted formula. The tempting shortcut: if an
opportunity isn't eligible, just return a score of zero, or skip it
entirely inside the scoring function itself.

### Key Observation

Doing eligibility-as-a-hard-gate *inside* the scoring function would
tangle two genuinely separate questions together: "how good a match
is this" and "should this be shown at all." The spec's own
architecture diagram in Section 2 draws these as sequential but
distinct stages — eligibility filtering, *then* ranking — not one
step. Baking the filter into the scorer would make the scoring
function untestable on its own terms (every eligibility test would
also be a scoring test) and would make a future change — like
showing `NOT_ELIGIBLE` opportunities in a separate "you don't
qualify yet" section instead of hiding them — require touching the
scoring math itself.

### Solution

Eligibility gets its own 25% weight inside scoring, contributing a
smooth 1.0 / 0.5 / 0.0 based on status — but the actual *filtering*
(dropping `NOT_ELIGIBLE` from the results entirely) happens one layer
up, in the recommendations service, after scoring has already run:

```python
for opportunity in opportunities:
    breakdown = score_opportunity(profile, opportunity)
    if breakdown.eligibility.status == "NOT_ELIGIBLE":
        continue
    scored.append(...)
```

### Because

This is a plain separation-of-concerns call, but a deliberate one —
`score_opportunity` can be fully tested with zero knowledge of what
happens to its output afterward, and the filtering policy can change
later (show ineligible items greyed out, offer a "close matches"
section, whatever the product needs eventually) without the scoring
math needing to move at all.

---

## Incident 3 : A 404, Not a 403, When One Student Reaches for Another's Application

### Relevant Context

`PATCH /applications/{id}` needed to prevent one student from
updating another student's tracked application. The obvious
implementation: fetch by ID, check if `student_profile_id` matches
the caller, return `403 Forbidden` if not.

### Key Observation

A `403` on an ID that genuinely exists confirms to the caller that
the resource is real — just not theirs. For a resource that's
private by nature (a student's own application status, not something
like an admin-only route where the caller already knows the target
exists), that confirmation is itself a small information leak: an
attacker could enumerate IDs and learn which ones are real
applications belonging to *someone*, even without ever seeing the
contents.

### Solution

The repository query filters by both fields at once, so "doesn't
exist" and "exists but isn't yours" produce an identical result:

```python
def get_application(db: Session, application_id: int, student_profile_id: int) -> Application | None:
    return (
        db.query(Application)
        .filter(Application.id == application_id, Application.student_profile_id == student_profile_id)
        .first()
    )
```

The service and route never see a distinction between the two cases
— both return `None`, both become a `404`:
```python
def test_cannot_update_another_students_application():
    ...
    response = client.patch(f"/applications/{application_id}", json={"status": "APPLIED"}, headers=student_b)
    assert response.status_code == 404
```

### Because

This mirrors the same 401-vs-403 distinction made back in Week 3–4's
admin guard, just from the opposite direction: there, the system
*should* say "I know who you are and you're not allowed" (403),
because admin status is a known, expected category. Here, the system
deliberately says nothing at all beyond "not found," because whether
a given ID belongs to *anyone in particular* isn't information
another student should be able to extract, even indirectly.

---

## Where the Recommendation Engine Landed

By the end of Weeks 8–10: a fully deterministic, Gemini-independent
core — eligibility, scoring, and tracking — sitting behind sixty-
three passing tests. Every one of this stretch's three incidents was
really the same instinct applied three times: build the version that
refuses to guess, refuses to conflate two different jobs into one
function, and refuses to leak more than it has to, even when the
simpler version would have looked identical in a quick manual test.
