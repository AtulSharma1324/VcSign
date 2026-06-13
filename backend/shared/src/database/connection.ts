import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

// ===========================
// PostgreSQL Connection Pool
// ===========================

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
};

export const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err);
});

pool.on("connect", () => {
  console.log("[DB] New client connected to PostgreSQL");
});

/** Execute a parameterized query. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (duration > 1000) {
    console.warn(`[DB] Slow query (${duration}ms):`, text.slice(0, 100));
  }

  return { rows: result.rows as T[], rowCount: result.rowCount };
}

/** Run multiple queries in a transaction. */
export async function transaction<T>(
  callback: (client: ReturnType<Pool["connect"]> extends Promise<infer C> ? C : never) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Check database health. */
export async function healthCheck(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
