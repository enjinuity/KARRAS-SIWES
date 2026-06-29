import type { ScenarioInput } from '@/simulation/types';
import type { AuthPayload, AuthUser } from '@/auth/types';

const apiBaseUrl = 'http://localhost:8787/api';

async function request<T>(path: string, options: RequestInit = {}) {
  const { headers, ...restOptions } = options;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    ...restOptions,
  });

  const body = (await response.json().catch(() => null)) as T & { message?: string } | null;

  if (!response.ok) {
    throw new Error(body?.message ?? 'Request failed.');
  }

  return body as T;
}

export function registerAccount(payload: { name: string; email: string; password: string }) {
  return request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginAccount(payload: { email: string; password: string }) {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser(token: string) {
  return request<{ user: AuthUser }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function syncScenarios(token: string, scenarios: ScenarioInput[]) {
  return request<{ scenarios: ScenarioInput[] }>('/scenarios/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ scenarios }),
  });
}

export function fetchScenarios(token: string) {
  return request<{ scenarios: ScenarioInput[] }>('/scenarios', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
