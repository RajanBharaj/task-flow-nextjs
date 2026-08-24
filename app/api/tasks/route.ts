// app/api/tasks/route.ts
//
// This is a Next.js "Route Handler" — it turns this file's path
// (app/api/tasks/route.ts) directly into the API endpoint /api/tasks.
// No separate Express server or router file is needed; the file location
// *is* the route definition.

import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma-client";

// GET /api/tasks
// Returns every task in the database, most recently created first.
export async function GET() {
  const tasks = await prismaClient.task.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks
// Creates a new task from a JSON body like { "title": "Buy milk" }.
export async function POST(request: NextRequest) {
  const requestBody = await request.json();

  // Basic server-side validation — never trust data from the client,
  // even if the UI already validates it.
  if (!requestBody.title || typeof requestBody.title !== "string") {
    return NextResponse.json(
      { error: "A non-empty 'title' string is required." },
      { status: 400 }
    );
  }

  const newTask = await prismaClient.task.create({
    data: { title: requestBody.title },
  });

  return NextResponse.json(newTask, { status: 201 });
}
