/**
 * QUIRK DB client — uses Turso HTTP API directly via fetch().
 *
 * This replaces Prisma ORM to fix auth issues with @prisma/adapter-libsql
 * on Vercel. The Turso REST API (v2/pipeline) is proven to work with the
 * current token (verified by dispatcher + worker via direct curl).
 *
 * API: POST https://[db-url]/v2/pipeline
 * Auth: Bearer [LIBSQL_TOKEN]
 * Body: JSON array of pipeline requests
 */

export type Row = Record<string, any>;

const globalForDb = globalThis as unknown as {
  _quirkDbUrl: string | undefined;
};

function getDbUrl(): string {
  const url = process.env.DATABASE_URL!;
  if (!url) throw new Error("DATABASE_URL not set");
  // Convert libsql:// to https:// for REST API
  if (url.startsWith("libsql://")) {
    return url.replace(/^libsql:\/\//, "https://");
  }
  if (url.startsWith("https://")) return url;
  throw new Error(`DATABASE_URL must be libsql:// or https:// URL, got: ${url}`);
}

function getToken(): string | undefined {
  return process.env.LIBSQL_TOKEN;
}

interface TursoResponse {
  results: Array<{
    type: "execute" | "ok";
    response?: {
      result?: {
        rows?: Array<Array<{ type: string; value: any }>>;
        columns?: string[];
        affected_row_count?: number;
        last_insert_rowid?: number;
      };
      error?: string;
    };
  }>;
}

/** Convert a JS value to Turso's pipeline format. */
function toTursoArg(val: any): any {
  if (val === null || val === undefined) return { type: "null" };
  if (typeof val === "number") return { type: "float", value: val };
  if (typeof val === "boolean") return { type: "integer", value: val ? 1 : 0 };
  // Convert Date objects to ISO strings
  if (val instanceof Date) return { type: "text", value: val.toISOString() };
  return { type: "text", value: String(val) };
}

/** Convert a Turso row (array of typed values) to a plain object. */
function parseRow(columns: string[], rawRow: Array<{ type: string; value: any }>): Row {
  const row: Row = {};
  columns.forEach((col, i) => {
    const cell = rawRow[i];
    if (!cell || cell.type === "null") {
      row[col] = null;
    } else if (cell.type === "integer") {
      row[col] = Number(cell.value);
    } else if (cell.type === "float") {
      row[col] = Number(cell.value);
    } else {
      row[col] = cell.value;
    }
  });
  return row;
}

async function executePipeline(statements: Array<{ sql: string; args: any[] }>): Promise<TursoResponse> {
  const url = getDbUrl() + "/v2/pipeline";
  const token = getToken();

  const body = {
    requests: statements.map((stmt) => ({
      type: "execute",
      stmt: {
        sql: stmt.sql,
        args: stmt.args.map(toTursoArg),
      },
    })),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Turso API ${res.status}: ${text}`);
  }

  return res.json();
}

/** Execute a query and return rows as plain objects. */
export async function query<T = Row>(sql: string, args: any[] = []): Promise<T[]> {
  const response = await executePipeline([{ sql, args }]);
  const result = response.results?.[0]?.response?.result;
  if (!result || !result.rows || !result.columns) return [];
  return result.rows.map((raw) => parseRow(result.columns!, raw)) as T[];
}

/** Execute a query and return the first row, or null. */
export async function queryOne<T = Row>(sql: string, args: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] || null;
}

/** Execute an INSERT/UPDATE/DELETE. */
export async function execute(sql: string, args: any[] = []) {
  await executePipeline([{ sql, args }]);
}

/** Generate a CUID-like ID (edge-compatible). */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}${random}`;
}

/** Current ISO timestamp for DB inserts. */
export function now(): string {
  return new Date().toISOString();
}

// Backwards-compat: some routes import `db` from this module
// Provide a db object with the same method names Prisma uses
export const db = {
  // Waitlist
  waitlist: {
    upsert: async ({ where, update, create }: any) => {
      const existing = await queryOne<{ id: string }>("SELECT id FROM Waitlist WHERE email = ?", [where.email]);
      if (existing) {
        const sets: string[] = [];
        const args: any[] = [];
        for (const [k, v] of Object.entries(update)) {
          if (v !== undefined) { sets.push(`${k} = ?`); args.push(v); }
        }
        if (sets.length > 0) {
          args.push(existing.id);
          await execute(`UPDATE Waitlist SET ${sets.join(", ")} WHERE id = ?`, args);
        }
        return { id: existing.id, ...create, ...update };
      }
      const id = generateId();
      const cols = ["id", "email", "name", "niche", "source", "createdAt"];
      const vals = [id, create.email, create.name ?? null, create.niche ?? null, create.source ?? "landing", now()];
      await execute(`INSERT INTO Waitlist (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
      return { id, ...create };
    },
    count: async () => {
      const rows = await query<{ count: number }>("SELECT COUNT(*) as count FROM Waitlist");
      return Number(rows[0]?.count) || 0;
    },
  },
  // User
  user: {
    upsert: async ({ where, update, create }: any) => {
      const existing = await queryOne<{ id: string; email: string; name: string | null }>(
        "SELECT id, email, name FROM User WHERE email = ?", [where.email]
      );
      if (existing) {
        const sets: string[] = [];
        const args: any[] = [];
        for (const [k, v] of Object.entries(update)) {
          if (v !== undefined) { sets.push(`${k} = ?`); args.push(v); }
        }
        if (sets.length > 0) {
          sets.push("updatedAt = ?"); args.push(now());
          args.push(existing.id);
          await execute(`UPDATE User SET ${sets.join(", ")} WHERE id = ?`, args);
        }
        return { ...existing, ...update };
      }
      const id = generateId();
      await execute(
        "INSERT INTO User (id, email, name, emailVerified, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, create.email, create.name, create.emailVerified ?? now(), "user", now(), now()]
      );
      return { id, ...create };
    },
    findUnique: async ({ where }: any) => {
      return queryOne("SELECT * FROM User WHERE id = ? OR email = ?", [where.id || where.email]);
    },
  },
  // Script
  script: {
    create: async ({ data }: any) => {
      const id = generateId();
      const cols = ["id", "title", "content", "platform", "tone", "niche", "cta", "tags", "authorId", "createdAt", "updatedAt"];
      const vals = [id, data.title, data.content, data.platform, data.tone, data.niche, data.cta ?? null, data.tags ?? null, data.authorId, now(), now()];
      await execute(`INSERT INTO Script (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
      return { id, ...data, createdAt: now(), updatedAt: now() };
    },
    findMany: async ({ where, orderBy, take }: any) => {
      let sql = "SELECT * FROM Script WHERE authorId = ?";
      const args: any[] = [where.authorId];
      sql += " ORDER BY createdAt DESC";
      if (take) sql += ` LIMIT ${take}`;
      return query(sql, args);
    },
    findUnique: async ({ where }: any) => {
      return queryOne("SELECT * FROM Script WHERE id = ?", [where.id]);
    },
    update: async ({ where, data }: any) => {
      const sets: string[] = [];
      const args: any[] = [];
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) { sets.push(`${k} = ?`); args.push(v); }
      }
      sets.push("updatedAt = ?"); args.push(now());
      args.push(where.id);
      await execute(`UPDATE Script SET ${sets.join(", ")} WHERE id = ?`, args);
      return queryOne("SELECT * FROM Script WHERE id = ?", [where.id]);
    },
    delete: async ({ where }: any) => {
      await execute("DELETE FROM Script WHERE id = ?", [where.id]);
      return { id: where.id };
    },
    count: async ({ where }: any) => {
      const rows = await query<{ count: number }>("SELECT COUNT(*) as count FROM Script WHERE authorId = ?", [where.authorId]);
      return Number(rows[0]?.count) || 0;
    },
  },
  // Idea
  idea: {
    create: async ({ data }: any) => {
      const id = generateId();
      const cols = ["id", "title", "hookPreview", "angle", "format", "niche", "platform", "tone", "status", "authorId", "createdAt", "updatedAt"];
      const vals = [id, data.title, data.hookPreview, data.angle, data.format, data.niche, data.platform, data.tone, data.status ?? "idea", data.authorId, now(), now()];
      await execute(`INSERT INTO Idea (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
      return { id, ...data, createdAt: now(), updatedAt: now() };
    },
    findMany: async ({ where, orderBy, take }: any) => {
      let sql = "SELECT * FROM Idea WHERE authorId = ?";
      const args: any[] = [where.authorId];
      if (where.status) { sql += " AND status = ?"; args.push(where.status); }
      sql += " ORDER BY createdAt DESC";
      if (take) sql += ` LIMIT ${take}`;
      return query(sql, args);
    },
    findUnique: async ({ where }: any) => {
      return queryOne("SELECT * FROM Idea WHERE id = ?", [where.id]);
    },
    update: async ({ where, data }: any) => {
      const sets: string[] = [];
      const args: any[] = [];
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) { sets.push(`${k} = ?`); args.push(v); }
      }
      sets.push("updatedAt = ?"); args.push(now());
      args.push(where.id);
      await execute(`UPDATE Idea SET ${sets.join(", ")} WHERE id = ?`, args);
      return queryOne("SELECT * FROM Idea WHERE id = ?", [where.id]);
    },
    delete: async ({ where }: any) => {
      await execute("DELETE FROM Idea WHERE id = ?", [where.id]);
      return { id: where.id };
    },
    count: async ({ where }: any) => {
      let sql = "SELECT COUNT(*) as count FROM Idea WHERE authorId = ?";
      const args: any[] = [where.authorId];
      if (where.status) { sql += " AND status = ?"; args.push(where.status); }
      const rows = await query<{ count: number }>(sql, args);
      return Number(rows[0]?.count) || 0;
    },
  },
  // Thumbnail
  thumbnail: {
    create: async ({ data }: any) => {
      const id = generateId();
      const cols = ["id", "userId", "imageData", "fileName", "score", "compositionScore", "emotionScore", "textLegibilityScore", "ctrPrediction", "reasoning", "isWinner", "batchId", "createdAt"];
      const vals = [id, data.userId, data.imageData, data.fileName ?? null, data.score, data.compositionScore, data.emotionScore, data.textLegibilityScore, data.ctrPrediction, data.reasoning, data.isWinner ? 1 : 0, data.batchId, now()];
      await execute(`INSERT INTO Thumbnail (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
      return { id, ...data, isWinner: data.isWinner ? true : false, createdAt: now() };
    },
    findMany: async ({ where, orderBy, take }: any) => {
      let sql = "SELECT * FROM Thumbnail WHERE userId = ?";
      const args: any[] = [where.userId];
      sql += " ORDER BY createdAt DESC";
      if (take) sql += ` LIMIT ${take}`;
      return query(sql, args);
    },
    findUnique: async ({ where }: any) => {
      return queryOne("SELECT * FROM Thumbnail WHERE id = ?", [where.id]);
    },
    delete: async ({ where }: any) => {
      await execute("DELETE FROM Thumbnail WHERE id = ?", [where.id]);
      return { id: where.id };
    },
    count: async ({ where }: any) => {
      const rows = await query<{ count: number }>("SELECT COUNT(*) as count FROM Thumbnail WHERE userId = ?", [where.userId]);
      return Number(rows[0]?.count) || 0;
    },
  },
};
