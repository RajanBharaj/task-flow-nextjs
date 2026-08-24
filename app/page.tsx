// app/page.tsx
//
// The home page UI. Marked "use client" because it needs local state
// (useState) and browser event handlers — Next.js otherwise renders
// components on the server by default.

"use client";

import { useEffect, useState } from "react";

// Shape of a Task as returned by our API — mirrors the Prisma model
// defined in prisma/schema.prisma. Keeping this in sync with the schema
// is what gives us type safety across the frontend/backend boundary.
type Task = {
  id: number;
  title: string;
  isComplete: boolean;
  createdAt: string;
};

export default function HomePage() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Load the existing tasks once, when the page first mounts.
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

    setNewTaskTitle(""); // clear the input field
    await fetchTasks();  // re-fetch so the new task appears in the list
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>TaskFlow</h1>

      <form onSubmit={handleAddTask}>
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="What needs doing?"
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {taskList.map((task) => (
          <li
            key={task.id}
            style={{ textDecoration: task.isComplete ? "line-through" : "none" }}
          >
            {task.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
