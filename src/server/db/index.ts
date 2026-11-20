import { Pool, type PoolClient } from "pg";

declare global {
  var __tehnikPgPool: Pool | undefined;
}

function createPool(): Pool {
  // Пул создаётся лениво: модуль импортируется при сборке Next без окружения.
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 8 });
}

export const pool = global.__tehnikPgPool ?? createPool();
if (process.env.NODE_ENV !== "production") global.__tehnikPgPool = pool;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL не задан — см. .env.local.example");
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Все многошаговые мутации (импорт, оформление заказа) обязаны идти через транзакцию. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
