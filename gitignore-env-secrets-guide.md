# Keeping Secrets Safe: A Guide to `.env` and `.gitignore`

## Why this matters

Every project in the TaskFlow series (Next.js, MERN, Django) connects to a
real database and, in production, may connect to other paid services. Each
of those connections requires a **secret** — a database password, an API
key, a signing key — that proves your app is allowed to access them.

If a secret ends up in a public GitHub repository, it is not "at risk." It
is compromised, immediately and permanently. Bots scan GitHub continuously,
specifically looking for exposed credentials, and can find and exploit a
leaked key within **minutes** of a push — often before you'd even notice.
This isn't a rare edge case; it's one of the most common ways student and
early-stage projects get compromised, and it happens to experienced
developers too.

The good news: preventing this is simple, mechanical, and only needs to be
set up once per project.

---

## The two files that do the work

### `.env` — where your secrets actually live

A `.env` file stores your project's secrets and configuration as
key-value pairs, kept **outside** your source code:

```
DATABASE_URL="postgresql://user:password@host:5432/taskflow"
SECRET_KEY="a-long-random-string"
```

Your code reads these values at runtime (via `process.env.DATABASE_URL`,
`os.environ.get("SECRET_KEY")`, etc.) instead of having the actual values
typed directly into a `.js` or `.py` file. This separation is the entire
point: the *code* that describes how to use a secret is safe to share
publicly; the *secret itself* is not, and now they live in different files.

### `.gitignore` — the list of files Git should never track

`.gitignore` tells Git which files and folders to ignore completely —
they're never staged, never committed, and never pushed to GitHub, even if
they exist on your computer. Every project in this series ships with a
`.gitignore` that already includes:

```
.env
.env*.local
node_modules/
__pycache__/
```

This is what actually keeps your `.env` file off GitHub. Without it, running
`git add .` would happily stage your secrets right alongside your code.

### How they work together

```
Your project folder
├── .env               ← contains real secrets, exists only on your machine
├── .env.example        ← contains placeholder values, safe to commit
├── .gitignore           ← tells Git to ignore .env, so it's never pushed
└── (your source code)    ← reads process.env.DATABASE_URL at runtime
```

The `.env.example` file (included in every TaskFlow demo) is the template —
it shows *which* variables a project needs, with fake placeholder values,
so a new developer knows what to fill in without ever seeing a real secret.

---

## The #1 mistake: committing before ignoring

`.gitignore` only works on files Git **hasn't tracked yet**. If you
accidentally run `git add .` and commit your `.env` file *before* adding
`.env` to `.gitignore` — or before creating `.gitignore` at all — Git is
now tracking that file. Adding it to `.gitignore` afterward does **not**
remove it from Git's history. It will still be sitting in your repo's
commit history, retrievable by anyone, forever (or until you rewrite
history, which is its own involved process).

**This is why every TaskFlow project's `.gitignore` was created before any
`git add` command was run** — the order matters. If you're starting a new
project from scratch:

1. Create `.gitignore` first.
2. Confirm `.env` is listed in it.
3. *Then* run `git init` / `git add` / `git commit`.

---

## If a secret does get pushed to GitHub

Mistakes happen — the important thing is responding immediately and
correctly. **Deleting the file and pushing again is not enough** — the
secret still exists in your Git history and is recoverable.

1. **Rotate the secret immediately.** Go to whatever service issued it
   (Neon, MongoDB Atlas, Supabase, etc.) and generate a brand new
   password/key, then update your local `.env` with the new value. This is
   the step that actually neutralizes the leak — the old secret becomes
   useless the moment you rotate it, regardless of who may have already
   seen it.
2. **Remove it from Git history**, not just the latest commit. Tools like
   [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or
   `git filter-repo` can strip a file from every commit in your history.
   This is a real "rewrite the timeline" operation — read the tool's docs
   before running it.
3. **Add the file to `.gitignore`** if it wasn't already there, so this
   doesn't happen again.
4. **Force-push the cleaned history** and let any collaborators know they
   need to re-clone the repo (rewritten history breaks their local copies).

Step 1 is non-negotiable and time-sensitive. Steps 2-4 matter for hygiene,
but rotating the secret is what actually stops anyone from using it.

---

## Practical checklist for every new project

- [ ] `.gitignore` exists **before** your first `git commit`
- [ ] `.env` is listed inside `.gitignore`
- [ ] `.env.example` exists with placeholder (fake) values, and is safe to commit
- [ ] Real secrets only ever exist in your local `.env` file, never typed
      directly into `.js`, `.py`, `.ts`, or any other source file
- [ ] Before every `git push`, a quick sanity check: `git status` should
      never show `.env` as a file about to be committed
- [ ] Secrets used in production (Vercel, Railway, Render environment
      variables) are set through that platform's dashboard — never
      committed to the repo, even in a "just for now" test commit

---

## Why this is worth the discipline

A leaked database password can mean a stranger reading, modifying, or
deleting every row in your database. A leaked API key for a paid service
(email sending, AI APIs, cloud storage) can mean someone else running up
usage charges on your account before you notice. Neither of these requires
a sophisticated attacker — automated scanners find exposed secrets on
GitHub constantly, without any human even looking for your specific repo.

The `.env` / `.gitignore` pattern exists precisely so that "did I remember
to keep this secret out of the repo?" is never a question you have to ask
per-file, per-commit — it becomes a structural guarantee you set up once,
at the start of a project, and it holds for the project's entire life.
