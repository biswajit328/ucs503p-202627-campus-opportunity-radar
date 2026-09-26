# Weeks 5–7 : Keeping an Unreliable Dependency From Making the Whole Suite Unreliable

# Testing AI-Dependent Code Without Needing AI to Run the Tests

Roll No. 1024030256
Name: Biswajit Mandal

Weeks 5–7 added the one thing every other part of this backend has
deliberately avoided: a dependency on a live, external, occasionally
slow, occasionally-changing third-party service. Every prior test in
this project runs against infrastructure fully under our control —
a real but disposable Postgres instance, no network calls outside
localhost. Gemini breaks that pattern by definition. My share of
this stretch wasn't writing the extraction logic itself — that was
Hardik's — it was making sure adding it didn't quietly compromise
the CI discipline the rest of the backend already had.

---

## Incident 1 : A Design Decision Made Before the Problem Existed

### Relevant Context

The very first version of `AIProvider` and `AIService` — built
before any extraction logic existed, before there was even anything
to test — was already shaped as an interface plus an injectable
implementation, not a direct dependency on the Gemini SDK:

```python
class AIService:
    def __init__(self, provider: AIProvider | None = None):
        self._provider = provider or GeminiProvider()
```

### Key Observation

At the time this was written, there was no test yet that needed a
fake provider. The constructor accepting an optional `AIProvider`
was a bet that testing AI-dependent code without hitting the real
API would matter later, made before the cost of *not* having that
seam was visible. It paid off directly: every extraction and
validation test written since — `test_ai_extraction.py`,
`test_ai_validation.py`, `test_ingestion.py` — runs in the same
suite as everything else, in the same ~20 seconds, with no network
call to Google, no API quota consumed, and no flakiness from an
external service's latency.

### Solution

No code change here — this incident is really about a decision that
already existed being validated by everything built on top of it.
The relevant "solution" was resisting the shortcut of just calling
`GeminiProvider()` directly wherever text needed extracting, which
would have been faster to write initially and much more expensive to
retrofit once thirty-some tests already existed calling it directly.

### Because

CI existing at all only matters if what runs in it is representative
and fast. A test suite that occasionally fails because Google's API
was slow, or skips itself because a `GEMINI_API_KEY` secret isn't
configured on a contributor's fork, is a test suite people start
ignoring. The fix for that problem needed to be architectural,
decided before there was anything to fix.

---

## Incident 2 : The Injection Seam Existed at the Service Layer, Not the Route

### Relevant Context

`test_ingestion.py` needed to substitute a fake AI provider for the
`/ingestion/extract` route specifically. The route, however,
constructs its own service inline:

```python
@router.post("/extract")
def extract_opportunity_route(payload, _admin):
    extracted, review = extract_and_review(AIService(), payload.raw_text)
```

Every other injectable dependency in this backend — the database
session, the current user — goes through FastAPI's `Depends(...)`
system, which `TestClient` can override cleanly per test. `AIService`
here isn't wired that way; it's constructed directly inside the
function body.

### Key Observation

Two real options existed: refactor the route to accept `AIService`
via `Depends(get_ai_service)`, matching the pattern used everywhere
else, or substitute the class itself at the module level for the
duration of a test. The first is more consistent with the rest of
the codebase's conventions. The second is smaller, doesn't touch
route code that's already tested and working, and is a completely
standard pytest mechanism for exactly this situation.

### Solution

```python
def _patch_ai_service(monkeypatch, canned_json: str):
    monkeypatch.setattr(
        ingestion_module,
        "AIService",
        lambda: AIService(provider=FakeProvider(canned_json)),
    )
```

`monkeypatch` replaces the name `AIService` inside the `ingestion`
module for the lifetime of a single test, then automatically restores
it afterward — no manual cleanup, no risk of one test's substitution
leaking into another.

### Because

Chose the smaller change deliberately, and am noting the alternative
here rather than pretending it wasn't considered: routing `AIService`
through `Depends(...)` the way the database session already is would
be the more architecturally consistent choice, and is worth doing if
another AI-dependent route gets added later and this pattern needs
repeating a second time. One route, one working test file — the
inconsistency is a reasonable trade for now, not a permanent
decision.

---

## Incident 3 : Deciding Where the Codebase's "No Broad Excepts" Rule Bends

### Relevant Context

Every other route in this backend catches specific exceptions —
`ProfileNotFoundError`, `EmailAlreadyRegisteredError`, and so on —
and converts each to a precise HTTP status. The ingestion route
breaks that pattern:

```python
try:
    extracted, review = extract_and_review(AIService(), payload.raw_text)
except Exception:
    raise HTTPException(status_code=502, detail="AI extraction failed...")
```

### Key Observation

A bare `except Exception` is exactly the kind of thing that would get
flagged in review anywhere else in this codebase, and for good
reason — it hides real bugs behind a generic error. This route is
different in one specific way none of the others are: it's the only
code path in the entire application that depends on a service outside
our own infrastructure. A timeout, a malformed response, a quota
limit, a model retirement like the one hit earlier this stretch —
none of these are bugs in our code, and none of them should be able
to take down the endpoint with an unhandled `500`.

### Solution

Kept the broad catch, specifically here, specifically because the
spec's own Section 26 requires it: *"If Gemini fails, the system
should NOT completely stop functioning."* Verified this doesn't mask
anything in our own logic by keeping the validation and parsing
steps — the code we actually control — outside anything that could
silently succeed on bad input; the broad catch only wraps the actual
external call.

### Because

Consistency matters, but consistency for its own sake would have been
the wrong call here. The rule "catch specific exceptions" exists to
prevent hiding bugs in code we own; it doesn't apply cleanly to a
boundary where the failure mode is, by definition, unpredictable and
external. Worth writing down as the one deliberate exception to an
otherwise firm project convention, so it reads as a decision later,
not an inconsistency.

---

## Where the Testing Discipline Landed

By the end of Weeks 5–7: forty-four tests passing, four of them
exercising AI-dependent code paths, none of them making a real
network call. CI stayed exactly as fast and exactly as free of
external dependencies as it was before this phase started — the one
part of the stack that's inherently unreliable never got the chance
to make the test suite unreliable along with it.
