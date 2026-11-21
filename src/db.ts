import 'dotenv/config';
import { Pool } from 'pg';
 
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Check your .env file.');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'false'
    ? false
    : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000
});

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch((error: unknown) => {
    const details =
      typeof error === 'object' && error !== null
        ? error
        : new Error(String(error));
    console.error('Database connection failed:', details);
  });