# Weeks 3–4 : Three Bugs That Only Postgres, Not Python, Could Confirm

# Route Ordering, an Array Filter That Lied, and Enum Types That Outlive Their Tables

Roll No. 1024030256
Name: Biswajit Mandal

Weeks 3–4 covered the Opportunity MVP end to end on the backend:
the `Opportunity` and `OpportunityEligibility` models, admin-gated
CRUD, a multi-filter search endpoint, and bookmarking with a
database-enforced unique constraint. All of it landed. What's worth
recording is three specific moments where the code compiled, the
endpoint responded, and the result was still wrong — or would have
been wrong later, the kind of bug that doesn't announce itself.

---

## Incident 1 : A Route That Would Have Silently Swallowed `/search`

### Relevant Context

Two routes needed to exist on the same resource:
`GET /opportunities/{opportunity_id}` and `GET /opportunities/search`.
Both are single-segment paths sitting after `/opportunities`.

### Key Observation

FastAPI matches incoming requests against registered routes by path
*shape*, in the order they're registered — not by trying every route
and seeing which one's types happen to validate. If
`/{opportunity_id}` had been registered before `/search`, a request
to `/opportunities/search` would match that route first, FastAPI
would try to cast the literal string `"search"` into an `int`, and
the caller would get a `422 Validation Error` instead of ever
reaching the actual search logic — a failure with no obvious
connection to route ordering unless you already know to suspect it.

### Solution

Registered `/search` before `/{opportunity_id}` in the router file,
deliberately, with the ordering treated as intentional rather than
incidental:

```python
router = APIRouter(prefix="/opportunities", tags=["opportunities"])

@router.post("")                      # create
@router.get("")                       # list
@router.get("/search")                # must precede {opportunity_id}
@router.get("/{opportunity_id}")      # single fetch
@router.put("/{opportunity_id}")
@router.delete("/{opportunity_id}")
```

### Because

This one didn't need to be debugged — it was caught by asking "what
happens when both these paths exist on the same router" before
writing either handler, not after. Worth naming specifically because
it's the rare case this week where the fix was free: no wasted time,
just an order-of-registration decision made correctly on the first
pass, once the trap was recognized as a trap.

---

## Incident 2 : A Filter That Returned Results, Just Not the Right Ones

### Relevant Context

`eligible_branches` on `OpportunityEligibility` is a Postgres
`ARRAY(String)` column. Filtering opportunities by branch used
SQLAlchemy's relationship-and-array combinators:

```python
query = query.filter(
    Opportunity.eligibility.has(OpportunityEligibility.eligible_branches.any(branch))
)
```

`?branch=ECE` against seeded data that clearly included ECE-eligible
opportunities returned an empty array. Not an error — just nothing,
which is a worse failure mode, since nothing in the response
suggests anything went wrong.

### Key Observation

The instinct here could easily have been to distrust the data. It
wasn't the data. Direct queries against the table confirmed the rows
were exactly right:

```sql
SELECT opportunity_id, eligible_branches FROM opportunity_eligibility;
--  8 | {CSE,ECE}
--  9 | {CSE,ECE}

SELECT * FROM opportunity_eligibility WHERE 'CSE' = ANY(eligible_branches);
-- returns the expected rows
```

Postgres's own `ANY` operator worked correctly against the same
data the ORM was supposedly querying. That isolated the problem
precisely to how SQLAlchemy was translating `.has(...).any(...)`
into SQL — a case where two syntactically simple ORM comparators
composed in a way that didn't produce the query either one would
produce alone.

### Solution

Replaced the combinator chain with an explicit join and a direct
array filter:

```python
if branch or semester:
    query = query.join(Opportunity.eligibility)
    if branch:
        query = query.filter(OpportunityEligibility.eligible_branches.any(branch))
    if semester:
        query = query.filter(OpportunityEligibility.eligible_semesters.any(semester))
```

Verified not just by re-running the failing case, but by testing a
branch the seed data *didn't* have eligible everywhere
(`?branch=ECE` returning exactly the two matching rows, `?branch=IT`
returning exactly the other six) — proving the filter actually
discriminates, rather than just happening to return everything and
looking correct by accident.

### Because

An empty result set from a filter is a dangerous kind of bug because
it's indistinguishable, from the outside, from "there's genuinely
nothing that matches." The fix here mattered less than the
diagnostic method: comparing the ORM's output against raw SQL
against the same table is what actually located the fault, rather
than guessing between "bad data" and "bad query" and possibly fixing
the wrong one first.

---

## Incident 3 : Enum Types That Don't Know They're Supposed to Disappear

### Relevant Context

`Opportunity.category`, `.mode`, and `.status` are all Python
`enum.Enum` subclasses mapped through SQLAlchemy's `Enum(...)` type.
Autogenerate correctly created three named Postgres enum types
(`opportunitycategory`, `opportunitymode`, `opportunitystatus`)
alongside the table.

### Key Observation

`op.create_table(...)` with an `Enum` column creates a genuinely
separate database object — the type exists independently of the
table using it. Alembic's autogenerated `downgrade()` only contained
`op.drop_table(...)` calls. Dropping the table does not drop the
type. This isn't dangerous today, since nobody's running
`alembic downgrade` in normal operation, but it's the kind of gap
that turns into a real error much later: downgrade, then try to
upgrade again, and Postgres refuses with `type "opportunitycategory"
already exists` — a confusing message to receive months from now
with no memory of this decision.

This is the same category of gap hit earlier with the `citext`
extension in the skills/interests migration — autogenerate detects
what needs to be *created*, never what needs to be *un-created* for
objects outside plain tables and columns.

### Solution

Added explicit type drops to the end of `downgrade()`, by hand,
after the table drops:

```python
def downgrade() -> None:
    op.drop_table('opportunity_skills')
    op.drop_table('opportunity_eligibility')
    op.drop_index(op.f('ix_opportunities_title'), table_name='opportunities')
    op.drop_table('opportunities')
    op.execute("DROP TYPE IF EXISTS opportunitycategory")
    op.execute("DROP TYPE IF EXISTS opportunitymode")
    op.execute("DROP TYPE IF EXISTS opportunitystatus")
```

### Because

This has become a standing checklist item now, not a one-off fix:
any migration introducing a new Postgres-level object that isn't a
plain table or column — an enum type, an extension, a custom
domain — needs its teardown added by hand, because Alembic's
autogenerate will never suggest it. Two migrations in a row have now
needed this same manual addition; worth treating as a rule for every
migration going forward, not a surprise each time.

---

## Where the Backend Landed

By the end of Weeks 3–4: full opportunity CRUD gated correctly by
role (403 for students, not the more ambiguous 401, since the system
knows exactly who they are and is choosing to refuse them), a search
endpoint with seven combinable filters all verified against seeded
data that actually distinguishes matches from non-matches, and
bookmarking enforced uniquely at the database level rather than only
in application logic — the same discipline as the citext work from
Week 1. Thirty-three tests passing, all three of this week's
incidents caught before or during that test-writing process, not
after.
