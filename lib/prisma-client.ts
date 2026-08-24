// lib/prisma-client.ts
//
// Creates one shared Prisma Client instance for the whole app.
//
// Why this matters: Next.js's dev server "hot reloads" your code on every
// save. Without this pattern, every reload would create a brand-new
// PrismaClient — and each one opens its own pool of database connections —
// until you exhaust your database's connection limit. Stashing the client
// on `globalThis` means hot reloads reuse the same instance instead.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}
