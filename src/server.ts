import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import studentRoutes from './routes/studentRoutes.js';
import { pool } from './db.js';

export async function getStudents(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM students ORDER BY id;'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Could not load students' });
  }
}

export const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use('/students', studentRoutes);

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error: unknown) {
    const details = error as { code?: unknown; message?: unknown };
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      code: typeof details.code === 'string' ? details.code : 'UNKNOWN',
      message: typeof details.message === 'string' ? details.message : 'Database unavailable'
    });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Student API running at http://localhost:${PORT}`);
  });
}