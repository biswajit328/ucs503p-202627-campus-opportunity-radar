# Weeks 11–13 : The Third Time a Bug Repeats, You Stop Calling It Bad Luck

# A Familiar Missing Tag, a Route That Escaped Its Own Tree, and a Page That Worked on the First Real Try

Roll No. 1024030756
Name: Hardik Satija

Weeks 11–13 meant building the recommendations page — the piece of
the product that actually shows off what the whole recommendation
engine is for. The page itself came together cleanly and worked
correctly the first time it ran against real data. Getting there
took fixing two JSX errors first, one of which was a repeat
performance of a bug that had already shown up twice before this
project.

---

## Incident 1 : The Missing `<a>` Tag, For a Third Time

### Relevant Context

`RecommendationCard.tsx` failed to build with the same error shape
seen twice already in this project:

```
error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
error TS17002: Expected corresponding JSX closing tag for 'div'.
```

### Key Observation

Reading the file back immediately, rather than guessing, showed the
exact same pattern as both previous times: a lone line of orphaned
attributes —
```
          href={opportunity.registration_url}
```
— with the opening `<a` missing entirely. By the third occurrence,
this stopped looking like coincidence and confirmed something
established earlier: whatever mechanism drops this specific token is
consistent and repeatable, not random, and the fix that worked
before — editing `<a ` directly onto the existing line rather than
pasting a new standalone line — was reached for immediately instead
of being rediscovered.

### Solution

```tsx
// before
href={opportunity.registration_url}

// after — same line, tag added in place
<a href={opportunity.registration_url}
```

Confirmed by printing the file back and reading it, not by trusting
the edit blindly — same verification habit as the first two times.

### Because

The actual improvement here isn't the fix itself, it's the time to
fix: what took several rounds of guessing the first time this exact
bug appeared took one message this time, because the earlier
incidents had already isolated both the cause (a specific copy-paste
pattern) and the reliable fix (edit an existing line, don't paste a
new standalone one). A bug that repeats a third time stops being
worth re-diagnosing from scratch — worth just applying the known fix
and moving on.

---

## Incident 2 : A Route That Escaped Its Own File

### Relevant Context

`App.tsx` failed differently this time:
```
error TS2657: JSX expressions must have one parent element.
```

### Key Observation

Reading the full file back (not just the error line) showed the
actual shape of the problem: the new `<Route path="/recommendations">`
block had landed *after* the closing `</AuthProvider>` tag, entirely
outside the component's returned JSX tree — a sibling element next to
the real return value rather than a child inside it. This is a
different failure mode than the missing-`<a>` bug — not a dropped
token, but an entire block landing in the wrong physical location
during a paste, a new variant of the same underlying "something in
this pipeline doesn't reliably preserve exact placement" problem.

### Solution

Moved the block bodily from after `</AuthProvider>` to its correct
place inside `<Routes>`, alongside the other route definitions:

```tsx
<Routes>
  ...
  <Route path="/opportunities" element={...} />
  <Route path="/recommendations" element={...} />
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
```

### Because

Same lesson as Incident 1, generalized: when a paste-related bug
shows up, the fix is to read the *entire* file back before editing
anything, not just the line the error message points at — the error
here pointed at `<AuthProvider>`, which was completely correct on its
own, while the actual mistake was several lines away. Trusting the
error's line number over a full read would have wasted a round trip.

---

## Incident 3 : A Page That Worked Because It Didn't Build Anything New

### Relevant Context

`Recommendations.tsx` needed match scores, deadline urgency badges,
and a working bookmark toggle — the same three ingredients the
opportunities page already had, applied to a different data shape.

### Key Observation

Rather than reimplementing any of it, the page reused
`getDeadlineUrgency` / `urgencyStyles` from `utils/deadline.ts` and
the exact bookmark add/remove logic pattern from
`Opportunities.tsx`, unchanged. The only genuinely new piece was
`RecommendationCard`'s score display and reasons list — everything
else was composition of things already built, tested, and working.

### Solution

No incident to resolve here, really — the "solution" is the design
choice made earlier of keeping deadline logic and bookmark logic in
shared, reusable files rather than duplicating them per page. That
choice is what made this page's first real run — real match
percentages, real reasons, the eligibility-uncertain badge correctly
appearing on the organizer-submitted opportunities, a bookmark that
survived a refresh — come out correct on the first try, with zero
new bugs in the shared logic to chase.

### Because

The two bugs this stretch were both in genuinely new code
(`RecommendationCard`, the new route). Nothing broke in the reused
utilities, because there was nothing new in them to break. Worth
naming as the payoff of building shared utilities properly the first
time, back in Weeks 3–4 — every page built on top of them since has
inherited that correctness for free.

---

## Where the Frontend Landed

By the end of Weeks 11–13: a recommendations page that renders real,
personalized, explainable results pulled from a recommendation
engine, an eligibility engine, and an organizer submission pipeline
that had never all been exercised together before this page's first
successful load. Two familiar-shaped bugs along the way, both
resolved faster than the last time specifically because they'd been
written down before.
