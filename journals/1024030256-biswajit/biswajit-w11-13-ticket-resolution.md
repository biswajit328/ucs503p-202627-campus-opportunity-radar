# Weeks 11–13 : Does the Design Still Hold When Someone New Uses It

# A Type Mismatch Caught Before It Ran, and an Eligibility Engine Tested by a Caller It Never Expected

Roll No. 1024030256
Name: Biswajit Mandal

Weeks 11–13 connected two things that had, until now, only existed
in isolation: the AI extraction pipeline from Weeks 5–7, sitting
unused behind its own standalone endpoint, and the eligibility
engine from Weeks 8–10, built and tested entirely against
admin-entered data. The organizer submission workflow is what
actually wires them together — an organizer submits raw text, an
admin reviews the AI's extraction, and approval creates a real
opportunity from it. My share of this stretch was less about new
logic and more about a question worth asking of any design before
trusting it: does it still hold up the first time something *other*
than what it was built and tested against actually uses it.

---

## Incident 1 : A Bug That Never Got a Traceback

### Relevant Context

`approve_submission`'s first draft copied `extracted.deadline`
straight onto `Opportunity.deadline`:

```python
opportunity = Opportunity(
    ...
    deadline=extracted.deadline,
    ...
)
```

### Key Observation

`extracted.deadline` is a plain string — `ExtractedOpportunity`'s
schema deliberately keeps it that way, since Gemini's date output
needs its own parsing and validation step before it can be trusted
(the whole point of the review layer from Weeks 5–7). `Opportunity.
deadline`, on the SQLAlchemy model, is a genuine `DateTime` column.
Assigning a string there wouldn't fail at the point of assignment —
Python doesn't type-check that — it would fail later, at
`db.commit()`, with a database-level error that would point at the
INSERT statement, not at the actual mistake three lines up.

### Solution

Caught while reading the draft back before running it, not from a
traceback. The fix uses the already-validated `parsed_deadline` from
`ExtractionReview` — the same object `validate_extraction` produces
specifically to hand back a real `date`, not a raw string — rather
than reaching past it back to the unvalidated field:

```python
if review.parsed_deadline is None:
    raise InvalidExtractionError("Extracted deadline is not a valid date")

deadline_dt = datetime.combine(review.parsed_deadline, time.min, tzinfo=timezone.utc)
```

### Because

This is the actual payoff of building the validation layer as its
own explicit step back in Weeks 5–7, rather than trusting Gemini's
output directly: the corrected code doesn't reach for
`extracted.deadline` at all once a validated alternative exists.
Worth writing down specifically because no test ever caught this —
it was caught by reading the code with the question "what type is
actually flowing through here" before it ran, which is a habit worth
keeping deliberate rather than assuming tests will always catch
everything.

---

## Incident 2 : Making Sure a User Can't End Up Half-Promoted

### Relevant Context

Creating an organization needed to do two things together: insert
the `Organization` row, and change the owning user's role from
`STUDENT` to `ORGANIZER`.

### Key Observation

These two writes happening as genuinely separate operations creates
a real, if narrow, failure window — an org could be created and the
role update could fail (or simply be forgotten in a future edit to
this function) leaving a user who owns an organization but is still
typed as a plain student, unable to actually submit anything through
it.

### Solution

Both writes happen inside the same service function, against the
same session, committed together:

```python
def create_my_organization(db: Session, user: User, name: str) -> Organization:
    if get_organization_by_owner(db, user.id):
        raise OrganizationAlreadyExistsError()
    org = create_organization(db, name, user.id)
    user.role = UserRole.ORGANIZER
    db.commit()
    return org
```

Tested directly, not just assumed:
```python
def test_create_organization_promotes_to_organizer():
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    me = client.get("/users/me", headers=headers)
    assert me.json()["role"] == "ORGANIZER"
```

### Because

Small deliberate choice, but the kind that matters more as the
system grows: any time two writes represent one real-world event
("this user is now an organizer"), they should live inside one
function that either fully succeeds or fully doesn't, rather than
being two calls a future edit could accidentally separate.

---

## Incident 3 : An Engine Tested Against One Kind of Data, Now Facing Another

### Relevant Context

Every eligibility test from Weeks 8–10 ran against opportunities
with a real `OpportunityEligibility` row attached — admin-created,
always present. Organizer-approved opportunities don't get one at
all; mapping the AI's raw text (`"3rd Year"`) to a specific semester
number was deliberately left undone, as a known, named gap.

### Key Observation

This meant `check_eligibility` was about to be called, for the first
time, against an opportunity where `eligibility` is `None` — a case
the function was written to handle from day one (`if eligibility is
None or eligibility.is_uncertain: return UNCERTAIN`), but never
actually exercised by anything other than a direct unit test until
now.

### Solution

No code change was needed here — that's the actual point. The
recommendations page, tested live against real organizer-submitted
opportunities, showed exactly the expected behavior: a yellow
"Eligibility uncertain" badge on both Coding Club submissions,
correctly distinct from the green checkmarked branch/semester
reasons on the admin-created ones sitting right next to them in the
same result set.

### Because

A function passing its own unit tests is a much weaker claim than a
function behaving correctly when a completely different part of the
system starts calling it in a way its author didn't specifically
anticipate. The `None`-eligibility branch was written defensively
back in Weeks 8–10 without a concrete caller in mind yet; watching it
fire correctly, unmodified, against real data from a pipeline built
weeks later is the actual confirmation the original design was
sound, not just passing tests written to match its own assumptions.

---

## Where the Backend Landed

By the end of Weeks 11–13, every priority in the original spec's
list is implemented and connected — not just built in isolation, but
proven to work together: extraction feeds submissions, submissions
feed real opportunities, and the eligibility and scoring engines
handle those opportunities correctly without needing to know or care
where they came from.
