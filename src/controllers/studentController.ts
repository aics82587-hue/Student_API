import type { Request, Response } from 'express';
import { pool } from '../db.js';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const program = String(req.query.program ?? '');
    const result = program && program !== 'all programs'
      ? await pool.query(
          'SELECT * FROM students WHERE course = $1 ORDER BY id;',
          [program]
        )
      : await pool.query('SELECT * FROM students ORDER BY id;');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Could not load students' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1;',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Could not load student' });
  }
};


export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body: unknown = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'A JSON object is required' });
    return;
  }

  const { student_number, first_name, last_name, course, year_level } = body as {
    student_number?: unknown;
    first_name?: unknown;
    last_name?: unknown;
    course?: unknown;
    year_level?: unknown;
  };

  if (
    typeof student_number !== 'string' || !student_number.trim() ||
    typeof first_name !== 'string' || !first_name.trim() ||
    typeof last_name !== 'string' || !last_name.trim() ||
    typeof course !== 'string' || !course.trim()
  ) {
    res.status(400).json({ message: 'All text fields are required' });
    return;
  }

  if (
    typeof year_level !== 'number' ||
    !Number.isInteger(year_level) ||
    year_level < 1 ||
    year_level > 4
  ) {
    res.status(400).json({
      message: 'year_level must be a whole number from 1 to 4'
    });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO students
        (student_number, first_name, last_name, course, year_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, student_number, first_name, last_name, course, year_level;`,
      [
        student_number.trim(),
        first_name.trim(),
        last_name.trim(),
        course.trim(),
        year_level
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      res.status(409).json({ message: 'student_number already exists' });
      return;
    }

    res.status(500).json({ message: 'Could not create student' });
  }
};

export async function updateStudent(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id;
  const idText = Array.isArray(rawId) ? rawId[0] ?? '' : rawId;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: 'Student ID must be a positive integer' });
    return;
  }

  const body: unknown = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'A JSON object is required' });
    return;
  }

  const {
    student_number,
    first_name,
    last_name,
    course,
    year_level
  } = body as Record<string, unknown>;

  if (
    typeof student_number !== 'string' || student_number.trim() === '' ||
    typeof first_name !== 'string' || first_name.trim() === '' ||
    typeof last_name !== 'string' || last_name.trim() === '' ||
    typeof course !== 'string' || course.trim() === ''
  ) {
    res.status(400).json({ message: 'All text fields are required' });
    return;
  }

  if (
    typeof year_level !== 'number' ||
    !Number.isInteger(year_level) ||
    year_level < 1 ||
    year_level > 4
  ) {
    res.status(400).json({
      message: 'year_level must be a whole number from 1 to 4'
    });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE students
       SET student_number = $1,
           first_name = $2,
           last_name = $3,
           course = $4,
           year_level = $5
       WHERE id = $6
       RETURNING id, student_number, first_name, last_name, course, year_level;`,
      [
        student_number.trim(),
        first_name.trim(),
        last_name.trim(),
        course.trim(),
        year_level,
        id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      res.status(409).json({ message: 'student_number already exists' });
      return;
    }

    res.status(500).json({ message: 'Could not update student' });
  }
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const rawId = req.params.id;
  const idText = Array.isArray(rawId) ? rawId[0] ?? '' : rawId;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: 'Student ID must be a positive integer' });
    return;
  }

  try {
    const result = await pool.query(
      `DELETE FROM students
       WHERE id = $1
       RETURNING id, student_number, first_name, last_name, course, year_level;`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json({
      message: 'Student deleted',
      student: result.rows[0]
    });
  } catch {
    res.status(500).json({ message: 'Could not delete student' });
  }
}
