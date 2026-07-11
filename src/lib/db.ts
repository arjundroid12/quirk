import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

/**
 * QUIRK Prisma client with libsql adapter (Turso-compatible).
 *
 * - Local dev: DATABASE_URL=file:./db/custom.db (SQLite file, no token needed)
 * - Production: DATABASE_URL=libsql://... + LIBSQL_TOKEN (Turso)
 *
 * The adapter handles both — same code path. The URL scheme determines which.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL!;
  const authToken = process.env.LIBSQL_TOKEN;

  // Only use libsql adapter for libsql:// URLs (Turso).
  // For local file: SQLite, use the default PrismaClient.
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const libsql = createClient({ url, authToken });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Local SQLite file — use default client
  return new PrismaClient({
    log: process.env.NODE_ENV !== "production" ? ["query"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
