# TaskFlow — Next.js + TypeScript + PostgreSQL + Prisma Demo

A minimal task tracker demonstrating this stack's core pattern: **one framework
handles both the API and the UI**, with Prisma providing type-safe database access.

## Project structure
```
task-flow-nextjs/
├── prisma/
│   └── schema.prisma        # Database schema (source of truth)
├── lib/
│   └── prisma-client.ts     # Shared Prisma Client instance
├── app/
│   ├── api/
│   │   └── tasks/
│   │       └── route.ts     # GET/POST /api/tasks
│   └── page.tsx             # Home page — renders the task list UI
```

---

### `prisma/schema.prisma`
Defines the `Task` model. Prisma generates a fully-typed client from this file,
so TypeScript will catch mismatches (e.g. typoing a field name) at compile time.

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // pulled from .env, never hardcoded
}

generator client {
  provider = "prisma-client-js"
}

// A single task in the tracker.
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  isComplete  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("tasks") // maps to snake_case table name "tasks" in Postgres
}
```

---

### `lib/prisma-client.ts`
A single shared instance avoids exhausting database connections during
Next.js's hot-reload in development.

```typescript
// lib/prisma-client.ts

import { PrismaClient } from "@prisma/client";

// Reuse the same client across hot reloads instead of creating a new one each time.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}
```

---

### `app/api/tasks/route.ts`
The API layer. Next.js "Route Handlers" let you define REST-style endpoints
right alongside your pages — no separate Express server needed.

```typescript
// app/api/tasks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma-client";

// GET /api/tasks — returns all tasks, most recent first.
export async function GET() {
  const tasks = await prismaClient.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

// POST /api/tasks — creates a new task from the request body.
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Basic validation — reject empty titles rather than trusting the client.
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json(
      { error: "A non-empty 'title' string is required." },
      { status: 400 }
    );
  }

  const newTask = await prismaClient.task.create({
    data: { title: body.title },
  });

  return NextResponse.json(newTask, { status: 201 });
}
```

---

### `app/page.tsx`
The UI. This is a Client Component (`"use client"`) because it needs local
state and event handlers for the form.

```tsx
// app/page.tsx
"use client";

import { useEffect, useState } from "react";

// Shape of a Task as returned by the API — mirrors the Prisma model.
type Task = {
  id: number;
  title: string;
  isComplete: boolean;
  createdAt: string;
};

export default function HomePage() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Fetch existing tasks once, when the page first loads.
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch("/api/tasks");
    const data: Task[] = await response.json();
    setTaskList(data);
  }

  async function handleAddTask(event: React.FormEvent) {
    event.preventDefault(); // stop the browser's default full-page form submit

    if (!newTaskTitle.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle }),
    });

    setNewTaskTitle(""); // clear the input
    await fetchTasks();  // refresh the list from the server
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>TaskFlow</h1>

      <form onSubmit={handleAddTask}>
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {taskList.map((task) => (
          <li key={task.id} style={{ textDecoration: task.isComplete ? "line-through" : "none" }}>
            {task.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## What this demonstrates
- **Colocation**: API route and UI page live in the same project/repo, no CORS setup needed.
- **Type safety end-to-end**: the `Task` type in the UI mirrors the Prisma model — rename a field in the schema and TypeScript flags every place that breaks.
- **Server + client split**: `route.ts` runs only on the server (never shipped to the browser); `page.tsx`'s `"use client"` directive marks it as browser-executed.
