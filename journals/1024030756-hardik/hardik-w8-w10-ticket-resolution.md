# Weeks 8–10 : Two Errors That Looked the Same and Weren't

# A 400 That Was Correct, a Port Collision That Came Back, and Learning to Tell Them Apart Fast

Roll No. 1024030756
Name: Hardik Satija

Weeks 8–10 belonged mostly to the recommendation engine itself,
which was Biswajit's build. My share of this stretch was smaller and
more specific: testing the new `/recommendations` endpoint through
the real frontend environment surfaced two failures back to back
that looked, at a glance, like the same kind of problem — and
weren't. Telling them apart quickly, using the diagnostic habits
already built up over the earlier weeks, is worth writing down on
its own.

---

## Incident 1 : A 400 That Wasn't a Bug, Just the Wrong Account

### Relevant Context

`GET /recommendations` returned:
```json
{"detail": "Create a student profile first"}
```
against an account that had, at a glance, been used for testing
throughout the session.

### Key Observation

The instinct in a situation like this is to assume the endpoint is
broken and start reading its code. The faster, more reliable check —
one this project has reached for repeatedly since the citext work in
Week 1 — is to ask the database directly rather than the API:

```sql
SELECT u.email FROM users u JOIN student_profiles sp ON sp.user_id = u.id;
```

This listed exactly which accounts actually had a profile row and
which didn't, in one query, rather than guessing from memory across
a session that had, by this point, created dozens of test accounts.

### Solution

Logged in with an account confirmed by that query to actually have a
profile, retried the same request, got a real ranked list back
immediately. No code changed, because none needed to.

### Because

This is the same principle as the branch-filter bug from Weeks
3–4 — compare against the database directly before assuming the
application layer is wrong — just applied to account state instead
of a query result. A `400` with a clear message describing exactly
what's missing is the system working correctly, not a bug to
investigate.

---

## Incident 2 : The Same Port Collision, Solved in One Pass Instead of Three Messages

### Relevant Context

Registration failed with `Failed to fetch` — the identical symptom
from a CORS/port mismatch hit earlier in the project, where Vite
silently fell back from `5173` to `5174` because something else was
still holding the expected port.

### Key Observation

The second occurrence of the exact same failure is a genuinely
different situation than the first: the cause was already known, and
the diagnostic sequence was already written down from before —
`netstat -ano | findstr :5173` to find the offending PID,
`taskkill /PID <pid> /F` to clear it, a fresh terminal, confirm the
`Local: http://localhost:5173/` line before touching the browser
again. The whole sequence took one exchange this time, compared to
several rounds of guessing the first time it happened.

### Solution

```
netstat -ano | findstr :5173
# TCP  0.0.0.0:5173  ...  LISTENING  34780
taskkill /PID 34780 /F
```
followed by a clean restart on the correct port, confirmed before
retrying anything in the browser.

### Because

The value of writing incidents down isn't just documentation for its
own sake — it's the second occurrence going faster because the first
one left a clear procedure behind. This is the argument for keeping
a dev journal at all, made concrete: the exact same bug, the exact
same fix, and the only thing that changed between the two occurrences
was that the second one didn't need to be re-diagnosed from scratch.

---

## A Smaller Note : Not Every Red Error Is a New Bug

Briefly, after fixing the port collision, the frontend still showed
`Failed to fetch` on the very next attempt — for a few seconds, then
worked cleanly on retry with no further changes. Almost certainly the
backend finishing its own restart from an adjacent step in the
session, not a second real bug. Worth naming even briefly: a
transient failure that clears on its own after a genuine root cause
was already fixed isn't a new mystery to chase — it's a timing race
that resolves itself, and the correct response is a clean retry, not
another round of debugging.

---

## Where the Testing Discipline Landed

Nothing frontend-specific got built this stretch — the recommendation
and tracking work was entirely backend, tested through `/docs`. What
carried over instead was the diagnostic method from earlier weeks,
applied to two failures in a row that resembled each other on the
surface but had nothing in common underneath: one was the system
correctly refusing bad input, the other was leftover process state
from three testing sessions ago. Telling those apart quickly, rather
than treating every red error the same, is its own kind of progress.
