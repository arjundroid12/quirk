/**
 * Push Prisma schema to Turso via HTTP API.
 * Works around Prisma CLI not supporting libsql:// URLs for db push.
 */
import { execSync } from "child_process";

const TURSO_URL = process.env.DATABASE_URL;
const TURSO_TOKEN = process.env.LIBSQL_TOKEN;

if (!TURSO_URL?.startsWith("libsql://")) {
  console.error("DATABASE_URL must be libsql:// URL");
  process.exit(1);
}

const httpUrl = TURSO_URL.replace(/^libsql:\/\//, "https://") + "/v2/pipeline";

async function main() {
  console.log(`Generating SQL from Prisma schema...`);
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf-8", cwd: process.cwd() }
  );

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));

  console.log(`Executing ${statements.length} SQL statements on Turso (${TURSO_URL})...`);

  const body = {
    requests: statements.map((stmt) => ({
      request: {
        type: "execute",
        stmt: { sql: stmt, args: [] },
      },
    })),
  };

  const res = await fetch(httpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TURSO_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Turso API ${res.status}: ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const r of data.results) {
    if (r.response?.error) {
      if (r.response.error.includes("already exists")) {
        skipped++;
      } else {
        console.error(`  ✗ ${r.response.error.slice(0, 100)}`);
        failed++;
      }
    } else {
      ok++;
    }
  }

  console.log(`\n✅ ${ok} statements executed, ${skipped} skipped (already existed), ${failed} failed`);

  // Verify tables
  const verifyRes = await fetch(httpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TURSO_TOKEN}`,
    },
    body: JSON.stringify({
      requests: [
        {
          request: {
            type: "execute",
            stmt: { sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", args: [] },
          },
        },
      ],
    }),
  });
  const verifyData = await verifyRes.json();
  const tables = verifyData.results?.[0]?.response?.result?.rows || [];
  console.log(`\nTables in Turso DB:`);
  for (const row of tables) {
    console.log(`  - ${row[0]?.value}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
