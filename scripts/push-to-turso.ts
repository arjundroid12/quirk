/**
 * Push Prisma schema to Turso (libsql) — used because Prisma CLI's `db push`
 * doesn't natively support libsql:// URLs (only file: URLs).
 *
 * Strategy: use `prisma migrate diff` to generate the SQL DDL, then execute
 * it via the libsql client.
 */

import { createClient } from "@libsql/client";
import { execSync } from "child_process";

async function main() {
  const url = process.env.DATABASE_URL;
  const token = process.env.LIBSQL_TOKEN;

  if (!url || !url.startsWith("libsql://")) {
    console.error("DATABASE_URL must be a libsql:// URL");
    process.exit(1);
  }
  if (!token) {
    console.error("LIBSQL_TOKEN required");
    process.exit(1);
  }

  console.log(`Connecting to Turso: ${url}`);
  const client = createClient({ url, authToken: token });

  // Generate DDL SQL from Prisma schema
  console.log("Generating SQL via prisma migrate diff...");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf-8", cwd: process.cwd() }
  );

  console.log(`Generated ${sql.split(";").filter((s) => s.trim()).length} SQL statements`);

  // Execute each statement
  const statements = sql
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Executing ${statements.length} statements on Turso...`);

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
      console.log(`  ✓ ${preview}${stmt.length > 80 ? "..." : ""}`);
    } catch (err: any) {
      // Skip "already exists" errors
      if (err.message.includes("already exists")) {
        console.log(`  ⊙ already exists: ${stmt.replace(/\s+/g, " ").slice(0, 60)}...`);
      } else {
        console.error(`  ✗ FAILED: ${stmt.slice(0, 100)}`);
        console.error(`    ${err.message}`);
      }
    }
  }

  // Verify tables exist
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(`\n✅ Tables in Turso DB:`);
  for (const row of tables.rows) {
    console.log(`   - ${(row as any).name}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
