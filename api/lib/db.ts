import { access, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const sqlitePath = path.resolve(dataDirectory, 'karras.sqlite');
const legacyJsonPath = path.resolve(dataDirectory, 'db.json');

let databasePromise: ReturnType<typeof open> | null = null;

export async function getDatabase() {
  if (!databasePromise) {
    await mkdir(dataDirectory, { recursive: true });
    databasePromise = open({
      filename: sqlitePath,
      driver: sqlite3.Database,
    });
  }

  const database = await databasePromise;

  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      current_term_label TEXT NOT NULL,
      department_count INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      term TEXT NOT NULL,
      instructor_name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      student_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(institution_id) REFERENCES institutions(id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      status TEXT NOT NULL,
      due_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      matric_number TEXT NOT NULL,
      code TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      score INTEGER,
      feedback TEXT NOT NULL DEFAULT '',
      submitted_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(assignment_id, matric_number),
      FOREIGN KEY(assignment_id) REFERENCES assignments(id)
    );
  `);

  await migrateLegacyJson(database);
  await seedVirtualLab(database);

  return database;
}

let migratedLegacyJson = false;

async function migrateLegacyJson(database: Awaited<ReturnType<typeof open>>) {
  if (migratedLegacyJson) {
    return;
  }

  migratedLegacyJson = true;
  await mkdir(dataDirectory, { recursive: true });

  try {
    await access(legacyJsonPath);
  } catch {
    return;
  }

  const raw = await readFile(legacyJsonPath, 'utf8');
  const legacy = JSON.parse(raw) as {
    users?: Array<{ id: string; email: string; name: string; passwordHash: string }>;
    scenarios?: Array<Record<string, unknown> & { id: string; ownerId: string }>;
  };

  if (legacy.users?.length) {
    for (const user of legacy.users) {
      await database.run(
        `INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)`,
        [user.id, user.email, user.name, user.passwordHash],
      );
    }
  }

  if (legacy.scenarios?.length) {
    for (const scenario of legacy.scenarios) {
      const { id, ownerId, ...payload } = scenario;
      await database.run(
        `INSERT OR IGNORE INTO scenarios (id, owner_id, payload_json, updated_at) VALUES (?, ?, ?, ?)`,
        [id, ownerId, JSON.stringify({ id, ...payload }), new Date().toISOString()],
      );
    }
  }
}

let seededVirtualLab = false;

async function seedVirtualLab(database: Awaited<ReturnType<typeof open>>) {
  if (seededVirtualLab) {
    return;
  }

  seededVirtualLab = true;

  const existingInstitution = await database.get<{ id: string }>(`SELECT id FROM institutions LIMIT 1`);
  if (existingInstitution) {
    return;
  }

  const institution = {
    id: 'delta-state-csit',
    name: 'Delta State School of Computing and Intelligent Technologies',
    shortName: 'DSSCIT',
    accentColor: '#22d3ee',
    currentTermLabel: '2026 Rain Semester',
    departmentCount: 3,
  };

  const courses = [
    {
      id: 'csc-201',
      institutionId: institution.id,
      code: 'CSC 201',
      title: 'Data Structures and Algorithms Lab',
      term: institution.currentTermLabel,
      instructorName: 'Dr. N. A. Ekanem',
      schedule: 'Mon and Wed practical block',
      studentCount: 146,
    },
    {
      id: 'csc-207',
      institutionId: institution.id,
      code: 'CSC 207',
      title: 'Systems Programming Studio',
      term: institution.currentTermLabel,
      instructorName: 'Engr. T. O. James',
      schedule: 'Tue practical block',
      studentCount: 98,
    },
    {
      id: 'csc-312',
      institutionId: institution.id,
      code: 'CSC 312',
      title: 'Mobile Application Development',
      term: institution.currentTermLabel,
      instructorName: 'Mrs. K. I. Odu',
      schedule: 'Fri blended session',
      studentCount: 76,
    },
  ] as const;

  const assignments = [
    {
      id: 'assign-linked-list',
      courseId: 'csc-201',
      title: 'Linked List Traversal and Insert Operations',
      prompt:
        'Implement insertion at head, tail, and a given index. Explain the time cost of each operation and submit a short dry-run note.',
      status: 'published',
      dueAt: '2026-07-10T23:59:00.000Z',
      createdAt: '2026-07-04T09:00:00.000Z',
    },
    {
      id: 'assign-stack-parser',
      courseId: 'csc-201',
      title: 'Expression Parser with Stack Operations',
      prompt:
        'Use stack rules to validate bracket balance and postfix conversion. Submit the source file and a brief reasoning note.',
      status: 'published',
      dueAt: '2026-07-07T22:00:00.000Z',
      createdAt: '2026-07-03T14:30:00.000Z',
    },
    {
      id: 'assign-process-fork',
      courseId: 'csc-207',
      title: 'Process Fork and Child Output Capture',
      prompt:
        'Write a program that spawns child processes, prints parent and child identifiers, and reports execution order observations.',
      status: 'draft',
      dueAt: '2026-07-15T23:59:00.000Z',
      createdAt: '2026-07-05T11:20:00.000Z',
    },
    {
      id: 'assign-mobile-layout',
      courseId: 'csc-312',
      title: 'Mobile Form Layout and Validation',
      prompt:
        'Build a simple registration view with responsive layout rules and input validation feedback for smaller screens.',
      status: 'published',
      dueAt: '2026-07-14T23:59:00.000Z',
      createdAt: '2026-07-02T10:15:00.000Z',
    },
  ] as const;

  const submissions = [
    {
      id: 'sub-001',
      assignmentId: 'assign-linked-list',
      studentName: 'Amaka Obi',
      matricNumber: 'CSC/24/014',
      code: '#include <stdio.h>\n\nint main(void) {\n  printf("linked list insert\\n");\n  return 0;\n}\n',
      notes: 'Head and tail insertion paths are completed. Index validation still needs one edge-case note.',
      status: 'submitted',
      score: null,
      feedback: '',
      submittedAt: '2026-07-06T07:41:00.000Z',
      updatedAt: '2026-07-06T07:41:00.000Z',
    },
    {
      id: 'sub-002',
      assignmentId: 'assign-linked-list',
      studentName: 'Daniel Etim',
      matricNumber: 'CSC/24/019',
      code: '#include <stdio.h>\n\nint main(void) {\n  printf("graded linked list work\\n");\n  return 0;\n}\n',
      notes: 'Submitted with a short dry-run summary.',
      status: 'graded',
      score: 84,
      feedback: 'Strong structure. Add clearer handling for index bounds and explain failure conditions.',
      submittedAt: '2026-07-06T06:16:00.000Z',
      updatedAt: '2026-07-06T08:10:00.000Z',
    },
    {
      id: 'sub-003',
      assignmentId: 'assign-stack-parser',
      studentName: 'Ruth Afolabi',
      matricNumber: 'CSC/24/022',
      code: '#include <stdio.h>\n\nint main(void) {\n  printf("stack parser\\n");\n  return 0;\n}\n',
      notes: 'Current draft checks bracket pairing only.',
      status: 'submitted',
      score: null,
      feedback: '',
      submittedAt: '2026-07-05T20:03:00.000Z',
      updatedAt: '2026-07-05T20:03:00.000Z',
    },
    {
      id: 'sub-004',
      assignmentId: 'assign-mobile-layout',
      studentName: 'Ifeanyi Okoro',
      matricNumber: 'CSC/23/041',
      code: 'export function MobileForm() {\n  return "responsive form";\n}\n',
      notes: 'Validation feedback now shows inline on smaller screens.',
      status: 'graded',
      score: 91,
      feedback: 'Clean layout decisions and strong validation feedback handling.',
      submittedAt: '2026-07-05T15:27:00.000Z',
      updatedAt: '2026-07-05T16:05:00.000Z',
    },
  ] as const;

  await database.run(
    `INSERT INTO institutions (id, name, short_name, accent_color, current_term_label, department_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      institution.id,
      institution.name,
      institution.shortName,
      institution.accentColor,
      institution.currentTermLabel,
      institution.departmentCount,
    ],
  );

  for (const course of courses) {
    await database.run(
      `INSERT INTO courses (id, institution_id, code, title, term, instructor_name, schedule, student_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course.id,
        course.institutionId,
        course.code,
        course.title,
        course.term,
        course.instructorName,
        course.schedule,
        course.studentCount,
      ],
    );
  }

  for (const assignment of assignments) {
    await database.run(
      `INSERT INTO assignments (id, course_id, title, prompt, status, due_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        assignment.id,
        assignment.courseId,
        assignment.title,
        assignment.prompt,
        assignment.status,
        assignment.dueAt,
        assignment.createdAt,
      ],
    );
  }

  for (const submission of submissions) {
    await database.run(
      `INSERT INTO submissions (
         id, assignment_id, student_name, matric_number, code, notes, status, score, feedback, submitted_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submission.id,
        submission.assignmentId,
        submission.studentName,
        submission.matricNumber,
        submission.code,
        submission.notes,
        submission.status,
        submission.score,
        submission.feedback,
        submission.submittedAt,
        submission.updatedAt,
      ],
    );
  }
}
