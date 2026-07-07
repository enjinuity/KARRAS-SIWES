import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

import { getDatabase } from './lib/db';

type AuthenticatedRequest = Request & {
  userId?: string;
};

type InstitutionRow = {
  id: string;
  name: string;
  short_name: string;
  accent_color: string;
  current_term_label: string;
  department_count: number;
};

type CourseRow = {
  id: string;
  institution_id: string;
  code: string;
  title: string;
  term: string;
  instructor_name: string;
  schedule: string;
  student_count: number;
};

type AssignmentRow = {
  id: string;
  course_id: string;
  title: string;
  prompt: string;
  status: 'draft' | 'published' | 'closed';
  due_at: string;
  created_at: string;
  submission_count: number;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  student_name: string;
  matric_number: string;
  code: string;
  notes: string;
  status: 'draft' | 'submitted' | 'graded';
  score: number | null;
  feedback: string;
  submitted_at: string | null;
  updated_at: string;
};

const app = express();
const port = 8787;
const tokenSecret = 'karras-mvp-secret';

app.use(cors());
app.use(express.json());

function createToken(userId: string) {
  return jwt.sign({ userId }, tokenSecret, { expiresIn: '7d' });
}

function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    response.status(401).json({ message: 'Authentication required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, tokenSecret) as { userId: string };
    request.userId = payload.userId;
    next();
  } catch {
    response.status(401).json({ message: 'Invalid session token.' });
  }
}

function mapInstitution(row: InstitutionRow, courses: CourseRow[]) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    accentColor: row.accent_color,
    currentTermLabel: row.current_term_label,
    departmentCount: row.department_count,
    activeCourseCount: courses.length,
    activeStudentCount: courses.reduce((total, course) => total + course.student_count, 0),
  };
}

function mapCourse(row: CourseRow) {
  return {
    id: row.id,
    institutionId: row.institution_id,
    code: row.code,
    title: row.title,
    term: row.term,
    instructorName: row.instructor_name,
    schedule: row.schedule,
    studentCount: row.student_count,
  };
}

function mapAssignment(row: AssignmentRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    prompt: row.prompt,
    status: row.status,
    dueAt: row.due_at,
    createdAt: row.created_at,
    submissionCount: row.submission_count,
  };
}

function mapSubmission(row: SubmissionRow) {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentName: row.student_name,
    matricNumber: row.matric_number,
    code: row.code,
    notes: row.notes,
    status: row.status,
    score: row.score,
    feedback: row.feedback,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

async function getAssignmentRow(database: Awaited<ReturnType<typeof getDatabase>>, assignmentId: string) {
  return database.get<AssignmentRow>(
    `SELECT
       assignments.id,
       assignments.course_id,
       assignments.title,
       assignments.prompt,
       assignments.status,
       assignments.due_at,
       assignments.created_at,
       COUNT(submissions.id) AS submission_count
     FROM assignments
     LEFT JOIN submissions ON submissions.assignment_id = assignments.id
     WHERE assignments.id = ?
     GROUP BY assignments.id`,
    [assignmentId],
  );
}

async function getSubmissionRow(database: Awaited<ReturnType<typeof getDatabase>>, submissionId: string) {
  return database.get<SubmissionRow>(
    `SELECT
       id,
       assignment_id,
       student_name,
       matric_number,
       code,
       notes,
       status,
       score,
       feedback,
       submitted_at,
       updated_at
     FROM submissions
     WHERE id = ?`,
    [submissionId],
  );
}

async function getVirtualLabBootstrap() {
  const database = await getDatabase();
  const institution = await database.get<InstitutionRow>(
    `SELECT id, name, short_name, accent_color, current_term_label, department_count
     FROM institutions
     ORDER BY rowid ASC
     LIMIT 1`,
  );

  if (!institution) {
    throw new Error('Virtual Lab institution is not configured.');
  }

  const courses = await database.all<CourseRow[]>(
    `SELECT id, institution_id, code, title, term, instructor_name, schedule, student_count
     FROM courses
     WHERE institution_id = ?
     ORDER BY code ASC`,
    [institution.id],
  );

  const assignments = await database.all<AssignmentRow[]>(
    `SELECT
       assignments.id,
       assignments.course_id,
       assignments.title,
       assignments.prompt,
       assignments.status,
       assignments.due_at,
       assignments.created_at,
       COUNT(submissions.id) AS submission_count
     FROM assignments
     LEFT JOIN submissions ON submissions.assignment_id = assignments.id
     GROUP BY assignments.id
     ORDER BY assignments.created_at DESC`,
  );

  const submissions = await database.all<SubmissionRow[]>(
    `SELECT
       id,
       assignment_id,
       student_name,
       matric_number,
       code,
       notes,
       status,
       score,
       feedback,
       submitted_at,
       updated_at
     FROM submissions
     ORDER BY updated_at DESC`,
  );

  return {
    institution: mapInstitution(institution, courses),
    courses: courses.map(mapCourse),
    assignments: assignments.map(mapAssignment),
    submissions: submissions.map(mapSubmission),
  };
}

function csvValue(value: string | number | null) {
  if (value === null) {
    return '';
  }

  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/auth/register', async (request, response) => {
  const { email, password, name } = request.body as { email?: string; password?: string; name?: string };
  if (!email || !password || !name) {
    response.status(400).json({ message: 'Name, email, and password are required.' });
    return;
  }

  const database = await getDatabase();
  const existingUser = await database.get<{ id: string }>(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase()]);
  if (existingUser) {
    response.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    email: email.toLowerCase(),
    name,
    passwordHash,
  };

  await database.run(`INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)`, [
    user.id,
    user.email,
    user.name,
    user.passwordHash,
  ]);

  response.status(201).json({
    token: createToken(user.id),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

app.post('/api/auth/login', async (request, response) => {
  const { email, password } = request.body as { email?: string; password?: string };
  if (!email || !password) {
    response.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  const database = await getDatabase();
  const user = await database.get<{ id: string; email: string; name: string; password_hash: string }>(
    `SELECT id, email, name, password_hash FROM users WHERE email = ?`,
    [email.toLowerCase()],
  );
  if (!user) {
    response.status(401).json({ message: 'Invalid login details.' });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    response.status(401).json({ message: 'Invalid login details.' });
    return;
  }

  response.json({
    token: createToken(user.id),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

app.get('/api/auth/me', requireAuth, async (request: AuthenticatedRequest, response) => {
  const database = await getDatabase();
  const user = await database.get<{ id: string; email: string; name: string }>(
    `SELECT id, email, name FROM users WHERE id = ?`,
    [request.userId],
  );
  if (!user) {
    response.status(404).json({ message: 'User not found.' });
    return;
  }

  response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

app.get('/api/scenarios', requireAuth, async (request: AuthenticatedRequest, response) => {
  const database = await getDatabase();
  const rows = await database.all<{ payload_json: string }[]>(`SELECT payload_json FROM scenarios WHERE owner_id = ?`, [
    request.userId,
  ]);
  const scenarios = rows.map((row) => JSON.parse(row.payload_json) as Record<string, unknown>);
  response.json({ scenarios });
});

app.post('/api/scenarios/sync', requireAuth, async (request: AuthenticatedRequest, response) => {
  const { scenarios } = request.body as { scenarios?: Array<Record<string, unknown> & { id: string }> };
  if (!scenarios) {
    response.status(400).json({ message: 'Scenario payload is required.' });
    return;
  }

  const database = await getDatabase();
  await database.run(`DELETE FROM scenarios WHERE owner_id = ?`, [request.userId]);

  for (const scenario of scenarios) {
    await database.run(
      `INSERT INTO scenarios (id, owner_id, payload_json, updated_at) VALUES (?, ?, ?, ?)`,
      [scenario.id, request.userId, JSON.stringify(scenario), new Date().toISOString()],
    );
  }

  const rows = await database.all<{ payload_json: string }[]>(`SELECT payload_json FROM scenarios WHERE owner_id = ?`, [
    request.userId,
  ]);

  response.json({
    scenarios: rows.map((row) => JSON.parse(row.payload_json) as Record<string, unknown>),
  });
});

app.get('/api/virtual-lab/bootstrap', async (_request, response) => {
  try {
    const snapshot = await getVirtualLabBootstrap();
    response.json(snapshot);
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to load Virtual Lab.',
    });
  }
});

app.post('/api/virtual-lab/courses/:courseId/assignments', async (request, response) => {
  const { courseId } = request.params;
  const { title, prompt, dueAt, status } = request.body as {
    title?: string;
    prompt?: string;
    dueAt?: string;
    status?: 'draft' | 'published' | 'closed';
  };

  if (!title?.trim() || !prompt?.trim() || !dueAt) {
    response.status(400).json({ message: 'Title, prompt, and due date are required.' });
    return;
  }

  const database = await getDatabase();
  const course = await database.get<{ id: string }>(`SELECT id FROM courses WHERE id = ?`, [courseId]);
  if (!course) {
    response.status(404).json({ message: 'Course not found.' });
    return;
  }

  const assignmentId = randomUUID();
  const createdAt = new Date().toISOString();

  await database.run(
    `INSERT INTO assignments (id, course_id, title, prompt, status, due_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [assignmentId, courseId, title.trim(), prompt.trim(), status ?? 'draft', dueAt, createdAt],
  );

  const row = await getAssignmentRow(database, assignmentId);
  if (!row) {
    response.status(500).json({ message: 'Failed to create assignment.' });
    return;
  }

  response.status(201).json({ assignment: mapAssignment(row) });
});

app.post('/api/virtual-lab/assignments/:assignmentId/submissions', async (request, response) => {
  const { assignmentId } = request.params;
  const { studentName, matricNumber, code, notes, status } = request.body as {
    studentName?: string;
    matricNumber?: string;
    code?: string;
    notes?: string;
    status?: 'draft' | 'submitted';
  };

  if (!studentName?.trim() || !matricNumber?.trim()) {
    response.status(400).json({ message: 'Student name and matric number are required.' });
    return;
  }

  const database = await getDatabase();
  const assignment = await database.get<{ id: string }>(`SELECT id FROM assignments WHERE id = ?`, [assignmentId]);
  if (!assignment) {
    response.status(404).json({ message: 'Assignment not found.' });
    return;
  }

  const existingSubmission = await database.get<{ id: string }>(
    `SELECT id FROM submissions WHERE assignment_id = ? AND matric_number = ?`,
    [assignmentId, matricNumber.trim()],
  );

  const submissionId = existingSubmission?.id ?? randomUUID();
  const updatedAt = new Date().toISOString();
  const submittedAt = status === 'submitted' ? updatedAt : null;

  if (existingSubmission) {
    await database.run(
      `UPDATE submissions
       SET student_name = ?, code = ?, notes = ?, status = ?, submitted_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        studentName.trim(),
        code ?? '',
        notes ?? '',
        status ?? 'draft',
        submittedAt,
        updatedAt,
        submissionId,
      ],
    );
  } else {
    await database.run(
      `INSERT INTO submissions (
         id, assignment_id, student_name, matric_number, code, notes, status, score, feedback, submitted_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        assignmentId,
        studentName.trim(),
        matricNumber.trim(),
        code ?? '',
        notes ?? '',
        status ?? 'draft',
        null,
        '',
        submittedAt,
        updatedAt,
      ],
    );
  }

  const row = await getSubmissionRow(database, submissionId);
  if (!row) {
    response.status(500).json({ message: 'Failed to save submission.' });
    return;
  }

  response.status(existingSubmission ? 200 : 201).json({ submission: mapSubmission(row) });
});

app.put('/api/virtual-lab/submissions/:submissionId/grade', async (request, response) => {
  const { submissionId } = request.params;
  const { score, feedback } = request.body as { score?: number; feedback?: string };

  if (typeof score !== 'number' || Number.isNaN(score)) {
    response.status(400).json({ message: 'A numeric score is required.' });
    return;
  }

  const database = await getDatabase();
  const existingSubmission = await database.get<{ id: string }>(`SELECT id FROM submissions WHERE id = ?`, [submissionId]);
  if (!existingSubmission) {
    response.status(404).json({ message: 'Submission not found.' });
    return;
  }

  await database.run(
    `UPDATE submissions
     SET score = ?, feedback = ?, status = 'graded', updated_at = ?
     WHERE id = ?`,
    [score, feedback?.trim() ?? '', new Date().toISOString(), submissionId],
  );

  const row = await getSubmissionRow(database, submissionId);
  if (!row) {
    response.status(500).json({ message: 'Failed to grade submission.' });
    return;
  }

  response.json({ submission: mapSubmission(row) });
});

app.get('/api/virtual-lab/courses/:courseId/export', async (request, response) => {
  const { courseId } = request.params;
  const database = await getDatabase();

  const course = await database.get<{ code: string; title: string }>(
    `SELECT code, title FROM courses WHERE id = ?`,
    [courseId],
  );
  if (!course) {
    response.status(404).json({ message: 'Course not found.' });
    return;
  }

  const rows = await database.all<
    Array<{
      assignment_title: string;
      student_name: string;
      matric_number: string;
      status: string;
      score: number | null;
      feedback: string;
      submitted_at: string | null;
    }>
  >(
    `SELECT
       assignments.title AS assignment_title,
       submissions.student_name,
       submissions.matric_number,
       submissions.status,
       submissions.score,
       submissions.feedback,
       submissions.submitted_at
     FROM assignments
     LEFT JOIN submissions ON submissions.assignment_id = assignments.id
     WHERE assignments.course_id = ?
     ORDER BY assignments.created_at DESC, submissions.student_name ASC`,
    [courseId],
  );

  const header = ['Assignment', 'Student', 'Matric Number', 'Status', 'Score', 'Feedback', 'Submitted At'];
  const content = [
    header.map(csvValue).join(','),
    ...rows.map((row) =>
      [
        row.assignment_title,
        row.student_name,
        row.matric_number,
        row.status,
        row.score,
        row.feedback,
        row.submitted_at,
      ]
        .map(csvValue)
        .join(','),
    ),
  ].join('\n');

  response.json({
    fileName: `${course.code.toLowerCase().replace(/\s+/g, '-')}-grades.csv`,
    content,
  });
});

app.listen(port, () => {
  console.log(`KARRAS API running on http://localhost:${port}`);
});
