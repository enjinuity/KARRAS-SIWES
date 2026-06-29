import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

import { getDatabase } from './lib/db';

type AuthenticatedRequest = Request & {
  userId?: string;
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

app.listen(port, () => {
  console.log(`KARRAS API running on http://localhost:${port}`);
});
