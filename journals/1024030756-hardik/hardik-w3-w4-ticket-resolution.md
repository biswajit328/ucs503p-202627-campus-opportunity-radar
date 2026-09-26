# Weeks 3–4 : When the Bug Isn't in the Code You're Looking At

# A Vanishing Tag, a Silent Port Change, and a Rule That Rewrote How Data Loads

Roll No. 1024030756
Name: Hardik Satija

Weeks 3–4 on the frontend meant building the actual product surface
students will use: a search-and-filter form, opportunity cards with
deadline urgency badges, and a working bookmark toggle wired to
Biswajit's real endpoints. The components themselves weren't
complicated. What made this stretch harder than it looked was three
separate cases where the error message pointed at the wrong place
entirely, and the real fault was somewhere the traceback never
mentioned.

---

## Incident 1 : An Opening Tag That Kept Disappearing

### Relevant Context

`OpportunityCard.tsx`'s "View Opportunity" link needed an `<a>` tag
wrapping its attributes. The build failed:

```
error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
error TS17002: Expected corresponding JSX closing tag for 'div'.
```

The first fix — repositioning a stray `>` — didn't resolve it. A
full-file replacement of the component didn't resolve it either. Both
times, re-reading the file back with `type` showed the exact same
thing missing: the opening `<a` token, with its attributes
(`href={...}`, `target=`, `rel=`) sitting orphaned with nothing
opening them.

### Key Observation

The pattern across three separate attempts — a targeted fix, then a
complete file replacement, both landing with the identical token
missing — pointed away from "typo" and toward "something in the
copy-paste path is dropping this specific line." A lone `<a` on its
own line is also the shape of an unclosed HTML tag, which is exactly
the kind of content some clipboard and paste-handling pipelines will
quietly interpret and strip rather than pass through as literal text.

### Solution

Instead of pasting a new line containing `<a` on its own, the fix was
edited directly into an *existing* line — appending `<a ` to the
front of the `href={...}` line already present in the file, so
nothing new needed to travel through whatever was consuming it:

```tsx
// before: a bare line, no opening tag
href={opportunity.registration_url}

// after: same line, tag prepended in place
<a href={opportunity.registration_url}
```

Verified this time not by re-reading the diff, but by printing the
full file back out and confirming, character by character, that
`<a href=` was actually present before running the build again.

### Because

Two failed fixes that produce the identical symptom is a signal to
stop repeating the same class of fix and change the *method* instead
— smaller, in-place edits are harder to lose than freshly-typed
standalone lines, and confirming a fix by reading the file back
before rerunning tools saved a fourth failed attempt.

---

## Incident 2 : The Backend Was Fine, Postgres Was Fine, and Login Still Failed

### Relevant Context

`npm run dev` had been run from a terminal where port `5173` was
already occupied by a leftover process from earlier in the session.
Vite silently moved to the next available port:

```
Port 5173 is in use, trying another one...
Local:   http://localhost:5174/
```

Login on `localhost:5174` failed instantly with `Failed to fetch` —
not a wrong-password message, a connection-level failure before the
request even completed.

### Key Observation

`Failed to fetch` in the browser is what a blocked CORS request looks
like from the frontend's side, and CORS enforcement is strict about
matching the *exact* origin — scheme, host, and port together. The
backend's `CORSMiddleware` was configured with
`allow_origins=["http://localhost:5173"]`, set once, early on, and
never revisited. Nothing about the backend or the database had
changed; the frontend had simply moved to a port the backend didn't
know to trust, and the browser refused the request before FastAPI
ever saw it.

### Solution

Rather than widening the allow-list to cover both ports, the actual
fix was finding and clearing whatever was still holding `5173` from
an earlier session, so Vite could reliably return to its expected
port:

```
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

### Because

Widening `allow_origins` to include every port a dev server might
land on would have "fixed" this permanently by making CORS steadily
less meaningful over time — each addition is a door that's easy to
add and easy to forget to close. Finding and killing the actual
stray process keeps the security boundary as narrow as it's supposed
to be, and means the dev server reliably lands on the same port every
time, which every other piece of config already assumes.

---

## Incident 3 : A Standard Data-Fetching Pattern That Lint Refused to Allow

### Relevant Context

The opportunities page needed to load data on mount — about as
common a React pattern as exists:

```tsx
useEffect(() => {
  loadOpportunities({});
  loadBookmarks();
}, []);
```

Lint failed, not with a syntax complaint but a design one:

```
Error: Calling setState synchronously within an effect can trigger
cascading renders
react-hooks/set-state-in-effect
```

### Key Observation

This is a genuinely newer, stricter rule from `eslint-plugin-react-hooks`
— it doesn't want an effect calling out to a function whose state
updates happen outside the effect body where the rule can reason
about timing, even for the completely ordinary "fetch on mount" case.
The rule's actual concern is real: an effect should either synchronize
with an external system directly, or subscribe to one — calling a
named function that itself calls `setState` obscures which of those
two things is happening.

### Solution

Rewrote the mount effect to do its async work inline, directly inside
an immediately-invoked async function, with a cancellation guard so
state isn't set after the component has unmounted:

```tsx
useEffect(() => {
  let cancelled = false;

  (async () => {
    setLoading(true);
    try {
      const [results, bookmarks] = await Promise.all([
        searchOpportunities({}),
        getMyBookmarks().catch(() => []),
      ]);
      if (!cancelled) {
        setOpportunities(results);
        setBookmarkedIds(new Set(bookmarks.map((b) => b.opportunity_id)));
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, []);
```

The standalone `loadBookmarks` helper became dead code once its logic
moved inline, and was removed rather than left unused.

### Because

The rewrite is strictly better than the original, not just quieter —
the cancellation guard is a real bug the simpler version didn't have
(setting state on an unmounted component after a slow fetch resolves).
Worth noting for the rest of the project: a lint rule that seems to be
blocking an "obviously fine" pattern is worth reading carefully before
working around it, since this one caught something the original code
genuinely didn't handle.

---

## Where the Frontend Landed

By the end of Weeks 3–4: a real `/opportunities` page with a working
multi-field search form, deadline urgency badges computed client-side
per the spec's Section 12, and a bookmark toggle that survives a page
refresh — proof it's reading real state from Postgres through the API,
not holding it only in memory. None of the three incidents above were
visible in the final result. That's the throughline again: the parts
that shipped correctly were built on top of bugs that, if left alone,
would have failed silently rather than loudly.
