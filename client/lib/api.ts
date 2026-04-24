import type { AuthResponse, AuthUser, Candidate, FeedbackAction, Job, Session } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');

type RequestOptions = Omit<RequestInit, 'body'> & {
  token?: string | null;
  body?: unknown;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  let requestBody: BodyInit | undefined;

  if (options.body == null) {
    requestBody = undefined;
  } else if (
    isFormData ||
    typeof options.body === 'string' ||
    options.body instanceof URLSearchParams ||
    options.body instanceof Blob ||
    options.body instanceof ArrayBuffer ||
    ArrayBuffer.isView(options.body)
  ) {
    requestBody = options.body as BodyInit;
  } else {
    requestBody = JSON.stringify(options.body);
  }

  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: requestBody,
  });

  const raw = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !raw?.success) {
    throw new ApiError(raw?.error ?? raw?.message ?? 'Request failed', response.status);
  }

  return raw.data;
}

export const api = {
  register: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (identifier: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    }),

  me: (token: string) =>
    request<AuthUser>('/auth/me', { token }),

  getJobs: (token: string) =>
    request<Job[]>('/jobs', { token }),

  getJob: (jobId: string, token: string) =>
    request<Job>(`/jobs/${jobId}`, { token }),

  createJob: (payload: Record<string, unknown>, token: string) =>
    request<Job>('/jobs', { method: 'POST', body: payload, token }),

  updateJob: (jobId: string, payload: Record<string, unknown>, token: string) =>
    request<Job>(`/jobs/${jobId}`, { method: 'PATCH', body: payload, token }),

  getCandidates: (token: string) =>
    request<Candidate[]>('/candidates', { token }),

  searchCandidates: (query: string, token: string) =>
    request<Candidate[]>(`/candidates/search?q=${encodeURIComponent(query)}`, { token }),

  ingestCandidateCsv: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ succeeded: Candidate[]; failed: string[] }>('/candidates/ingest/csv', {
      method: 'POST',
      body: formData,
      token,
    });
  },

  ingestCandidatePdfs: (files: FileList | File[], token: string) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('resumes', file));
    return request<{ succeeded: Candidate[]; failed: string[] }>('/candidates/ingest/pdf', {
      method: 'POST',
      body: formData,
      token,
    });
  },

  getSessions: (token: string) =>
    request<Session[]>('/sessions', { token }),

  getSession: (sessionId: string, token: string) =>
    request<Session>(`/sessions/${sessionId}`, { token }),

  createSession: (payload: Record<string, unknown>, token: string) =>
    request<Session>('/sessions', { method: 'POST', body: payload, token }),

  runSession: (sessionId: string, token: string) =>
    request<{ message: string; sessionId: string }>(`/sessions/${sessionId}/run`, {
      method: 'POST',
      token,
    }),

  submitSessionFeedback: (
    sessionId: string,
    payload: { candidateId: string; action: FeedbackAction; adjustedScore?: number; reason?: string },
    token: string
  ) =>
    request<Session>(`/sessions/${sessionId}/feedback`, {
      method: 'POST',
      body: payload,
      token,
    }),
};
