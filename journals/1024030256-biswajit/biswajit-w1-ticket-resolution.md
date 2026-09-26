# Week 1 : Four Backend Bugs That Only Show Up Once Something Real Depends on Them

# Postgres, Password Hashing, Model Resolution, and a Race Condition

Roll No. 1024030256
Name: Biswajit Mandal

My share of Week 1 was the backend half of the MVP: PostgreSQL,
SQLAlchemy models, Alembic migrations, authentication, and the
Student Profile schema with its normalized skills/interests design.
The layered service/repository pattern itself came together quickly.
What actually ate the week were four moments where code that looked
correct turned out to be correct only by accident, and only revealed
itself once a real container booted, a real password got hashed, a
real test suite ran, or a real concurrent write happened.

---

## Incident 1 : Postgres 18 Refused to Start

### Relevant Context

`docker-compose.yml` mounted a named volume at the path every
Postgres tutorial from the last decade uses:

```yaml
volumes:
  - pgdata:/var/lib/postgresql/data
```

The container built, the image pulled, and then exited immediately
with status 1.

### Key Observation

`docker logs` had the answer directly:

> In 18+, these Docker images are configured to store database data
> in a format which is compatible with "pg_ctlcluster" — using
> major-version-specific directory names. Counter to that, there
> appears to be PostgreSQL data in `/var/lib/postgresql/data`.

Postgres 18's Docker image changed its expected mount point from
`/var/lib/postgresql/data` to `/var/lib/postgresql` itself, so it can
manage version-specific subdirectories underneath. Every
`postgres:15`-era compose file circulating online mounts the old
path.

### Solution

```yaml
volumes:
  - pgdata:/var/lib/postgresql
```

Followed by `docker compose down -v` to clear the volume that had
already been half-initialized under the wrong layout, since starting
clean was simpler than migrating a database that never successfully
booted in the first place.

### Because

This is the kind of change that doesn't error at build time — the
image pulls fine, the compose file validates, and the failure only
shows up in a runtime log line most people don't read on a healthy
start. Pinning to `postgres:18` explicitly, rather than `latest`, was
already the plan for reproducibility; this was the first time it
mattered *why*.

---

## Incident 2 : Every Password Hash Failed, and the Traceback Lied About It

### Relevant Context

`hash_password()` was routed through `passlib`'s bcrypt handler — the
standard, textbook way to do this in a FastAPI tutorial. Every single
call to `/auth/register` failed with:

```
ValueError: password cannot be longer than 72 bytes, truncate
manually if necessary (e.g. my_password[:72])
```

on a test password sixteen characters long.

### Key Observation

The string bcrypt was actually choking on, visible further up the
traceback, was `01234567890123...` repeated for 72 bytes — not
anything anyone typed. `passlib` runs an internal self-test the first
time its bcrypt backend loads, to detect a truncation bug from old
bcrypt versions. `passlib` hasn't been meaningfully maintained since
2020; the `bcrypt` package it depends on has, and modern versions
(4.1+) made the 72-byte limit a hard error instead of a silent
truncation. `passlib`'s outdated self-test trips that new strictness
before a real password is ever touched.

### Solution

Dropped `passlib` from the hashing path entirely and called `bcrypt`
directly:

```python
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
```

No new dependency required — `bcrypt` was already installed as
`passlib[bcrypt]`'s own dependency.

### Because

The real lesson wasn't about bcrypt specifically. It was that a stack
trace's deepest frame is where the exception was *raised*, not
necessarily where the interesting information is — the actual clue
(a 72-byte string of digits that clearly wasn't a real password) was
sitting several frames up, in arguments nobody passed directly.

---

## Incident 3 : A Model That Only Failed Under `pytest`, Never Under Alembic

### Relevant Context

`alembic upgrade head` ran clean and created every table correctly.
The moment `pytest` touched anything involving the `User` model,
though:

```
sqlalchemy.exc.InvalidRequestError: When initializing mapper
Mapper[User(users)], expression 'StudentProfile' failed to locate a
name ('StudentProfile').
```

### Key Observation

`User.student_profile` is declared as `relationship("StudentProfile")`
— a string, not a direct class reference, because `User` and
`StudentProfile` import each other and a direct reference would be
circular. SQLAlchemy resolves that string lazily, by searching
whatever model classes happen to be registered *at the moment it's
first needed* — not at import time of the file that defines it.

`alembic/env.py` explicitly imports both `User` and `StudentProfile`
before running anything, so by the time a migration touches `User`,
SQLAlchemy already knows both classes exist. `pytest`'s import chain
never went through `student_profile.py` at all — it only reached
`User` via `main → api.auth → services → repositories → models.user`.
The class the relationship needed to resolve simply hadn't been
imported by anything in that chain.

### Solution

```python
# app/models/__init__.py
from app.models.user import User
from app.models.student_profile import StudentProfile

__all__ = ["User", "StudentProfile"]
```

Because importing any submodule of a package always runs that
package's `__init__.py` first, this guarantees both classes are
registered together the moment *either* one is imported, regardless
of which file happens to import it first.

### Because

This is a correctness bug that's specifically invisible to whoever
wrote it, since Alembic — the thing tested first — happened to
import things in an order that hid it completely. It only surfaced
because the test suite exercised a different import path than the
migration tooling did. A green Alembic run says nothing about whether
the models are safe to import from application code.

---

## Incident 4 : Three Students Type "Python" Three Different Ways

### Relevant Context

Skills and interests are meant to be shared, deduplicated rows —
`skills` and `interests` tables, joined to `student_profiles` through
`student_skills` / `student_interests`, per the original ER design.
The first pass at "get or create" used a check-then-insert in Python:

```python
def get_or_create_skill(db, name):
    skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
    if skill:
        return skill
    skill = Skill(name=name)
    db.add(skill)
    db.flush()
    return skill
```

This looked correct and passed manual testing. It has two problems
that only surface under conditions manual testing doesn't create.

### Key Observation

First: the `name` column was a plain, case-*sensitive* `String`. The
`.ilike()` check in Python was the *only* thing preventing "Python" /
"python" / "PYTHON" from becoming three rows — nothing at the
database level enforced it, so any code path that skipped this one
repository function could freely create duplicates.

Second, and more fundamental: even a correct case-insensitive check
has a race condition. Two concurrent requests can both run the "does
this exist?" query, both get "no such row," and both proceed to
insert. The check and the insert are two separate statements —
nothing makes them atomic.

### Solution

Two changes, one at the schema level and one at the query level. The
`name` column became Postgres's `citext` type, which enforces
case-insensitive *uniqueness at the constraint level*, while still
storing whatever casing was first submitted:

```python
name: Mapped[str] = mapped_column(CITEXT, unique=True, nullable=False, index=True)
```

And the get-or-create logic became one atomic statement instead of
two:

```python
def get_or_create_skill(db: Session, name: str) -> Skill:
    normalized = name.strip()
    stmt = pg_insert(Skill).values(name=normalized).on_conflict_do_nothing(index_elements=["name"])
    db.execute(stmt)
    db.flush()
    return db.query(Skill).filter(Skill.name == normalized).first()
```

`INSERT ... ON CONFLICT DO NOTHING` lets Postgres itself arbitrate —
if two requests race to insert "Python" at the same instant, exactly
one insert succeeds and the other silently no-ops, inside the
database, with no window where both could "win."

Proven with a direct test rather than trusted on inspection:

```python
def test_skill_dedup_is_case_insensitive():
    skill_a = get_or_create_skill(db, "Python")
    skill_b = get_or_create_skill(db, "python")
    skill_c = get_or_create_skill(db, "PYTHON")
    assert skill_a.id == skill_b.id == skill_c.id
```

### Because

This is the one incident this week that wasn't caught by an error
message — it was caught by asking "what happens under concurrency?"
before shipping it, not after. The recommendation engine this whole
project is graded on depends on skills matching reliably between a
student's profile and an opportunity's requirements; three silently
different "Python" rows would have quietly broken every match
downstream, without ever throwing an exception to notice.

---

## Where the Backend Landed

By end of week: PostgreSQL 18 running in Docker with a correct volume
layout, Alembic migrations for `users`, `student_profiles`, `skills`,
`interests`, and their join tables, JWT-based auth with properly
hashed passwords, and a Student Profile CRUD API backed by a
normalized, race-safe schema. All of it covered by automated tests
running against a real Postgres instance in CI on every pull request.

None of these four bugs were visible from outside — register/login
"worked" the whole time a broken hasher sat underneath it, and the
skills table "worked" right up until two requests raced. The
throughline for the week: the parts that were hard weren't the parts
that looked hard.
