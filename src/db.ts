import 'dotenv/config';
import { Pool } from 'pg';
 
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Check your .env file.');
}

export const pool = new Pool({ connectionString: databaseUrl });

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch((error: unknown) => {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? ` (PostgreSQL ${String(error.code)})`
        : '';
    console.error(
      `Database connection failed${code}. Check your Supabase credentials and connection settings.`
    );
  });