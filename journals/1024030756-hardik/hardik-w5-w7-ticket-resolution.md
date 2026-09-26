# Weeks 5–7 : Building on Top of Something That Doesn't Hold Still

# A Model That Got Retired Mid-Project, and Teaching an LLM to Doubt Itself

Roll No. 1024030756
Name: Hardik Satija

Weeks 5–7 meant the Gemini integration: turning raw, informally
written opportunity text into structured fields the rest of Nexora
already knows how to use. The interesting part of this stretch
wasn't the happy path — asking an LLM to extract fields and getting
fields back is the easy 80%. It was the parts specific to building
on top of a third-party model that changes out from under you, and
designing around the fact that a confident-sounding answer and a
correct answer aren't the same thing.

---

## Incident 1 : The Model I Researched Was Retired Before the Code Ran

### Relevant Context

The `GeminiProvider` was built against `gemini-2.5-flash`, chosen
deliberately as the stable, well-established, cost-appropriate model
for a straightforward extraction task rather than reaching for
whatever was newest. The very first real request against it failed:

```
google.genai.errors.ClientError: 404 NOT_FOUND.
'This model models/gemini-2.5-flash is no longer available to new
users. Please update your code to use models/gemini-3.6-flash...'
```

### Key Observation

Everything *before* the failure had worked correctly — the API key
was accepted, the request reached Google's servers, the SDK's error
handling surfaced a clean, specific message rather than a generic
timeout or an opaque stack trace. The 404 wasn't a bug in the
integration at all; it was Google retiring a model for new accounts
in the time between researching it and actually running code against
it. The error message contained its own fix, spelled out exactly.

### Solution

```python
DEFAULT_MODEL = "gemini-3.6-flash"  # was gemini-2.5-flash
```

One line, because the model name had deliberately been isolated as a
single named constant rather than scattered as a string literal
through the codebase — exactly the situation that constant existed
to make easy.

### Because

This is the clearest argument this project has produced for why the
`AIProvider` / `AIService` abstraction from Section 20 of the spec
mattered in practice, not just on paper. A model getting retired
out from under a live integration isn't a hypothetical risk with a
provider that ships new model generations every few months — it's
the first thing that actually happened. Isolating "which model" to
one constant, and "which provider" to one class, is what turned a
potential half-day debugging session into a one-line fix once the
error message was actually read.

---

## Incident 2 : Designing the Extraction Schema Around Bugs That Hadn't Happened Yet

### Relevant Context

The `ExtractedOpportunity` schema needed fields for category and
mode — both of which map directly onto existing Python enums
(`OpportunityCategory`, `OpportunityMode`) already used by the
`Opportunity` model itself.

### Key Observation

Two design choices here were made proactively, based on checking the
current SDK's documentation and open issues before writing any code,
rather than discovering them the hard way:

First, the extraction schema is entirely flat — no field is a nested
Pydantic model. `python-genai`'s `response_schema` has a known, still
open bug with nested BaseModel classes, where the SDK's own
schema-flattening logic (`$defs` / `$ref` resolution) doesn't handle
them correctly. Every field here is a plain string, a list of
strings, or a boolean, specifically to never touch that code path.

Second, `category` and `mode` are typed as the real project enums
directly in the schema, not as free-text strings validated
afterward. Passing a Python `Enum` into `response_schema` constrains
Gemini's actual output — the model literally cannot return a
category outside the nine real values, because the schema it's
generating against only allows those nine.

### Solution

```python
class ExtractedOpportunity(BaseModel):
    title: str
    category: OpportunityCategory   # constrains output at generation time
    organizer: str
    skills: list[str]
    eligible_branches: list[str]
    eligible_academic_levels: list[str]
    mode: OpportunityMode           # same constraint
    deadline: str
    location: str
    is_uncertain: bool
    uncertainty_notes: str
```

### Because

Both choices moved a category of validation work from "after the
fact, in Python, hoping to catch what Gemini got wrong" to "made
structurally impossible at generation time." Enum-constrained output
in particular means the eventual validation layer never has to ask
"is this a real category" at all — that question is already answered
by the schema itself, one less thing to get wrong later.

---

## Incident 3 : Teaching the Validation Layer Not to Trust the Model's Own Confidence

### Relevant Context

`ExtractedOpportunity` includes `is_uncertain`, a field the model
sets itself when it judges the source text ambiguous. The instinct
is to treat that field as authoritative — if the model says it's
confident, why second-guess it?

### Key Observation

A model reporting high confidence is not the same claim as a model
being right, and testing against a deliberately vague input made the
gap concrete. Given source text as thin as *"Some workshop happening
soon, contact the club for details,"* Gemini correctly returned
`is_uncertain: true` with real reasoning — but nothing in the schema
*guarantees* that self-assessment will always be internally
consistent. A model could plausibly return `is_uncertain: false`
while still leaving `eligible_branches` empty, and nothing about the
type system would catch that contradiction.

### Solution

The validation layer checks for exactly that contradiction,
independent of what the model claimed about itself:

```python
if not extracted.is_uncertain and not extracted.eligible_branches and not extracted.eligible_academic_levels:
    issues.append("Marked as certain, but no eligibility was extracted.")
    needs_review = True
```

Verified with the vague-workshop case specifically: even though the
model *did* self-report uncertainty correctly that time, the check
exists so a future case where it doesn't still gets caught.

### Because

This is the concrete version of the spec's instruction to never
blindly trust LLM output — not a vague caution, but a specific,
testable rule: the model's self-reported confidence is treated as
one input to a review decision, never as the review decision itself.

---

## Where the AI Integration Landed

By the end of Weeks 5–7: raw, messy opportunity text goes in, and a
structured, schema-constrained, independently-validated result comes
out — through an admin-only endpoint that degrades to a clear error
rather than crashing if Gemini itself fails. The model changed under
the project once already in this stretch; the abstraction held.
