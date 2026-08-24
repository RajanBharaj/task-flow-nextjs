// app/layout.tsx
//
// The root layout wraps every page in the app. This is where you'd put
// things shared across your whole site — a <html> shell, global styles,
// a shared header/footer, etc.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "A teaching demo of Next.js + TypeScript + Prisma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
