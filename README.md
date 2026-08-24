# TaskFlow — Next.js + TypeScript + PostgreSQL + Prisma

A minimal task tracker demonstrating this stack's core pattern: one framework
handles both the API and the UI, with Prisma providing a type-safe database
client generated from a single schema file.

## Project structure
```
task-flow-nextjs/
├── prisma/
│   └── schema.prisma        # Database schema — the source of truth for the Task model
├── lib/
│   └── prisma-client.ts     # Shared Prisma Client instance
├── app/
│   ├── layout.tsx           # Root layout shared by every page
│   ├── page.tsx             # Home page — renders the task list UI
│   └── api/
│       └── tasks/
│           └── route.ts     # GET/POST /api/tasks
├── package.json
├── tsconfig.json
└── .env.example             # Copy to .env and fill in your DATABASE_URL
```

## Run it locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your database**

   Copy `.env.example` to `.env` and fill in a real Postgres connection
   string. The fastest free option is [Neon](https://neon.tech) — create a
   project, copy the connection string it gives you.
   ```bash
   cp .env.example .env
   ```

3. **Create the database table**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Deploying

This project is built to deploy straight to **Vercel**:

1. Push this folder to a GitHub repo.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add your `DATABASE_URL` environment variable in the Vercel project settings
   (use a serverless-friendly Postgres like [Neon](https://neon.tech) — it's
   built for exactly this connection pattern).
4. Deploy. Vercel detects Next.js automatically — no build configuration needed.

## What this demonstrates

- **Colocation**: the API route (`app/api/tasks/route.ts`) and the UI page
  (`app/page.tsx`) live in the same project, no CORS setup required.
- **Type safety end-to-end**: the `Task` type in `page.tsx` mirrors the
  Prisma model — rename a field in `schema.prisma` and TypeScript will flag
  every place that breaks.
- **Server vs. client code**: `route.ts` runs only on the server (it's never
  sent to the browser); `page.tsx`'s `"use client"` directive marks it as
  browser-executed code.
