/**
 * QUIRK lightweight DB client — uses Turso's HTTP API directly via fetch().
 *
 * No @libsql/client dependency (which pulls in WASM modules that exceed
 * Cloudflare Pages' 3 MiB Worker limit on the free tier).
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
  if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    throw new Error(`DATABASE_URL must be libsql:// or https:// URL, got: ${url}`);
  }
  // Convert libsql:// to https:// for the REST API
  return url.replace(/^libsql:\/\//, "https://");
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
  if (typeof val === "number") return { type: Number.isInteger(val) ? "integer" : "float", value: val };
  if (typeof val === "boolean") return { type: "integer", value: val ? 1 : 0 };
  return { type: "text", value: String(val) };
}

/** Convert a Turso row (array of typed values) to a plain object. */
function parseRow(columns: string[], rawRow: Array<{ type: string; value: any }>): Row {
  const row: Row = {};
  columns.forEach((col, i) => {
    const cell = rawRow[i];
    if (!cell) {
      row[col] = null;
      return;
    }
    if (cell.type === "null") {
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
      request: {
        type: "execute",
        stmt: {
          sql: stmt.sql,
          args: stmt.args.map(toTursoArg),
        },
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
