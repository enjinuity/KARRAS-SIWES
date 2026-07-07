import type {
  CreateAssignmentPayload,
  GradeSubmissionPayload,
  SaveSubmissionPayload,
  VirtualLabAssignment,
  VirtualLabBootstrap,
  VirtualLabSubmission,
} from '@/virtual-lab/types';

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

export function fetchVirtualLabBootstrap() {
  return request<VirtualLabBootstrap>('/virtual-lab/bootstrap');
}

export function createVirtualLabAssignment(courseId: string, payload: CreateAssignmentPayload) {
  return request<{ assignment: VirtualLabAssignment }>(`/virtual-lab/courses/${courseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveVirtualLabSubmission(assignmentId: string, payload: SaveSubmissionPayload) {
  return request<{ submission: VirtualLabSubmission }>(`/virtual-lab/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function gradeVirtualLabSubmission(submissionId: string, payload: GradeSubmissionPayload) {
  return request<{ submission: VirtualLabSubmission }>(`/virtual-lab/submissions/${submissionId}/grade`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function exportVirtualLabCourse(courseId: string) {
  return request<{ fileName: string; content: string }>(`/virtual-lab/courses/${courseId}/export`);
}
