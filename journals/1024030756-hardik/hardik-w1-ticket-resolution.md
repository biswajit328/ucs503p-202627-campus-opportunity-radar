# Week 1 : Getting the Frontend to Actually Talk to a Real Backend

# Tailwind, React Fast Refresh, and the Gap Between "It Renders" and "It Works"

Roll No. 1024030756
Name: Hardik Satija

My share of Week 1 was the frontend half: scaffolding React with
Tailwind, then — once Biswajit's auth and profile endpoints existed —
wiring real login, registration, and profile forms to them instead of
a mocked API shape. The UI itself wasn't the hard part. The hard part
was everything that only breaks once a browser, a real backend, and a
build tool all have to agree with each other at the same time.

---

## Incident 1 : Tailwind Compiled the Config but Rendered Nothing

### Relevant Context

`vite.config.ts` correctly imported `@tailwindcss/vite`, `index.css`
correctly had `@import "tailwindcss";`, and `App.tsx` had Tailwind
utility classes on it. Running `npm run dev` threw immediately:

```
[UNRESOLVED_IMPORT] Could not resolve '@tailwindcss/vite' in vite.config.ts
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@tailwindcss/vite'
```

### Key Observation

Every file that *referenced* Tailwind's Vite plugin was correct. The
package itself was never actually installed — `npm install
tailwindcss @tailwindcss/vite` had been skipped in between editing the
config and running the dev server. The error message was specific
enough to be misread as a config problem, when it was really just a
missing dependency the config had every right to assume was there.

### Solution

```
npm install tailwindcss @tailwindcss/vite
```

No changes needed to any of the three files already edited — they
were referencing the right thing all along, just nothing had been
installed to back the reference up yet.

### Because

Worth remembering for the rest of the project: when an import error
names a package that's clearly *supposed* to exist and the code
referencing it looks fine, check `node_modules` before touching the
code. Tailwind 4's setup is also meaningfully different from Tailwind
3 — no `tailwind.config.js`, config lives directly in CSS — so this
wasn't a case of an old tutorial's steps just needing to be followed
more carefully; the steps themselves have to be for the right major
version.

---

## Incident 2 : ESLint Wouldn't Let `AuthContext` Export Anything But a Component

### Relevant Context

`AuthContext.tsx` held three things: the `AuthContext` object itself,
the `AuthProvider` component, and a `useAuth()` hook for reading the
context — a completely standard React auth-context pattern. Lint
failed on it:

```
error  Fast refresh only works when a file only exports components.
Use a new file to share constants or functions between components
react-refresh/only-export-components
```

### Key Observation

The rule is stricter than it first appears. Splitting `useAuth` out
into its own file wasn't enough — the *context object itself*,
`AuthContext = createContext(...)`, isn't a component either, and the
rule flagged that too. Vite's Fast Refresh needs a component file to
export *only* components; anything else in the same file means an
edit to that file can force a full page reload instead of an
in-place update during development.

### Solution

Three files instead of one, each with a single responsibility:

```
src/context/authContextInstance.ts   # createContext(...) and the type, nothing else
src/context/AuthContext.tsx          # AuthProvider component only
src/context/useAuth.ts               # the useAuth() hook only
```

`AuthContext.tsx` imports the context object from
`authContextInstance.ts` rather than defining it inline; `useAuth.ts`
does the same. Every page component then imports the hook from
`useAuth.ts`, never from the provider file.

### Because

This took two passes to get fully right — the first split moved the
hook out but left the context object behind, and lint caught that
too. Worth the iteration though: the rule isn't pedantic for its own
sake, it's protecting the dev-server experience specifically, and
getting it right now means nobody on the team hits a mysterious full
page reload mid-edit later and has to work out why.

---

## Incident 3 : The Backend Worked Perfectly in `/docs` and Refused Everything from the Browser

### Relevant Context

Once auth and profile endpoints existed, wiring the React app to them
needed two things resolved that `/docs` testing never exposes: how
the browser is allowed to call a different origin at all, and how the
token actually gets sent.

### Key Observation

Two separate issues, both invisible until a real fetch from
`localhost:5173` hit `localhost:8000`:

**CORS.** Browsers block JavaScript from calling a different origin
by default. FastAPI doesn't allow anything cross-origin unless told
to explicitly — without that, every request from the React app would
fail in the browser console before ever reaching an endpoint,
regardless of whether the endpoint itself was correct.

**The auth scheme mismatch.** The backend's `/docs` page initially
used `OAuth2PasswordBearer`, which renders a username/password form
in Swagger and posts *form-encoded* data behind the scenes — but the
actual `/auth/login` endpoint expects JSON. It happened to look like
it was working in `/docs` right up until the login form there failed
with a generic 401, which was really a content-type mismatch wearing
a "wrong password" costume. The frontend's API client, meanwhile, was
always going to send a raw `Authorization: Bearer <token>` header —
matching neither scheme cleanly.

### Solution

CORS, explicit rather than wildcarded:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

And the auth dependency switched to match how the frontend actually
authenticates — a raw bearer token, not an OAuth2 form flow:

```python
bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), ...):
    payload = decode_access_token(credentials.credentials)
    ...
```

### Because

`allow_origins` is a specific URL, not `"*"`, on purpose — an open
CORS policy would let any website's JavaScript call the API on a
logged-in user's behalf, which is a real vulnerability class and
cheap to avoid from the start. And the auth-scheme mismatch is a good
reminder that `/docs` testing success and frontend integration
success are not the same milestone — the UI can be technically
correct and still fail the moment a different client sends requests
in a shape the backend wasn't actually built to expect.

---

## Where the Frontend Landed

By end of week: React Router with protected routes, an `AuthContext`
that persists a JWT across reloads, and real login, registration, and
profile-setup forms — all calling Biswajit's actual endpoints, no
mocked data anywhere. A student can go from the login screen to a
dashboard showing their real saved profile, entirely through the UI.

The theme for the week, from this side: nothing here failed because a
component was written wrong. Everything that broke, broke at a seam —
between a config file and an uninstalled package, between a lint rule
and a file's responsibilities, between a browser's security model and
a backend that hadn't been told about it yet.
