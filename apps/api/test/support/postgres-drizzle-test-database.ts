import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export interface PostgresDrizzleTestDatabase {
  readonly database: NodePgDatabase;
  close(): Promise<void>;
}

export function createPostgresDrizzleTestDatabase(
  connectionString: string,
): PostgresDrizzleTestDatabase {
  const pool = new Pool({ connectionString });

  return {
    database: drizzle({ client: pool }),
    close: async () => {
      await pool.end();
    },
  };
}

export async function truncateCorrectionPersistenceTables(
  database: NodePgDatabase,
): Promise<void> {
  await database.execute(sql`TRUNCATE TABLE corrections`);
}
