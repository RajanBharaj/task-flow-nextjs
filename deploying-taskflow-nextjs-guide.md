# Deploying TaskFlow (Next.js + Prisma) to Vercel + Neon

A step-by-step guide to taking the TaskFlow Next.js demo from a local
project to a live, publicly accessible website — using Neon (a
serverless Postgres database) and Vercel (hosting for both the API and
the UI, since Next.js combines them into one deployment).

**Order matters.** Set these up database → hosting, in that order — the
hosting step needs a real connection string produced by the database step.

---

## Prerequisites

- The `task-flow-nextjs` project pushed to a GitHub repository (see
  `gitignore-env-secrets-guide.md` for safely getting it there without
  committing any secrets)
- A free account on [Neon](https://neon.tech) and [Vercel](https://vercel.com)

---

## Step 1: Set up the database on Neon

1. Create a new **project** in Neon (the free tier is sufficient for
   this demo).
2. On the project dashboard, find the **Connection string** panel and
   copy the value shown. It looks like:
   ```
   postgresql://<user>:<password>@<host>.neon.tech/<database>?sslmode=require
   ```
3. Keep this string handy — it's your `DATABASE_URL`, and it's a secret.
   Never commit it to your repo; it only ever goes into Vercel's
   environment variable settings (Step 2).

---

## Step 2: Deploy to Vercel

1. In Vercel: **Add New → Project → Import Git Repository**, and select
   your `task-flow-nextjs` repo.
   When prompted for repository access, grant access to only this
   repository — never grant a platform access to every repo in your
   account.
2. Vercel auto-detects Next.js — the default build settings need no
   changes.
3. Before deploying, expand **Environment Variables** and add:
   - `DATABASE_URL` = the connection string from Step 1
4. Click **Deploy**. Vercel gives you a URL like:
   ```
   https://task-flow-nextjs.vercel.app
   ```

---

## Step 3: Apply the database schema

Prisma needs to create the `tasks` table on Neon before the app can use
it. From your local machine, with `.env` pointing at the **same** Neon
connection string used in Step 2:

```bash
npx prisma migrate deploy
```

This applies any existing migrations without prompting for a new
migration name — the correct command for a production database, as
opposed to `prisma migrate dev`, which is for local development only.

---

## Step 4: Verify

Visit your Vercel URL. You should see the TaskFlow page load, and adding
a task should persist and reappear on refresh (confirming the API route
and Neon connection are both working end to end).

| Symptom | Likely cause |
|---|---|
| 500 error on page load | `DATABASE_URL` missing or incorrect in Vercel's environment variables — double check it was saved, then redeploy |
| Page loads but adding a task fails silently | The `tasks` table doesn't exist yet — re-run Step 3 against the same database Vercel is using |
| Works locally, fails only on Vercel | Confirm you're not accidentally connecting to a *different* Neon database locally than the one configured in Vercel |

---

## Step 5: Connect a custom domain (optional)

In Vercel: **Project → Settings → Domains** → enter your domain. Vercel
shows the exact A/CNAME records to add at your domain registrar. Once
DNS propagates, Vercel automatically issues a free SSL certificate — no
manual certificate setup required.

---

## Quick reference: what goes where

| Value | Produced by | Used in |
|---|---|---|
| `DATABASE_URL` | Neon connection string | Vercel environment variable, and local `.env` for running migrations |

---

## Appendix: common Git/GitHub errors along the way

These aren't specific to this deployment, but reliably come up for
students pushing a project to GitHub for the first time.

**`fatal: Authentication failed`** — GitHub no longer accepts your
password for Git operations. Use a Personal Access Token, or switch to
SSH authentication.

**`Permission denied (publickey)`** — usually means one of:
- Your SSH key was never loaded into your SSH agent — run
  `ssh-add ~/.ssh/id_ed25519` (start the agent first with
  `eval "$(ssh-agent -s)"` if you see "Could not open a connection to
  your authentication agent").
- The public key on your machine doesn't match what's uploaded to
  GitHub — compare `cat ~/.ssh/id_ed25519.pub` against
  **GitHub → Settings → SSH and GPG keys**.

**`gpg: signing failed: Unusable secret key`** — your Git config is
pointed at a GPG key that no longer exists (e.g. after regenerating your
keys). Either update Git to your new key ID
(`git config --global user.signingkey <new-key-id>`), or disable commit
signing entirely for a student/portfolio project:
```bash
git config --global commit.gpgsign false
```

**`fatal: Could not read from remote repository`** — almost always
means the repository doesn't exist yet at that exact URL. Create it on
GitHub first (without initializing a README/`.gitignore`, since your
local project already has content), then push again.

**Before every push**, run `git status` and confirm `.env` never
appears in the list of files about to be committed — see
`gitignore-env-secrets-guide.md` for the full reasoning and a one-time
history check (`git log --all --full-history -- "**/.env"`) if you're
verifying an existing repo.
