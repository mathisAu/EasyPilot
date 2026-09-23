export class ApiError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message);
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface ApiFetchOptions {
  method?: string;
  json?: unknown;
  formData?: FormData;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// The XSRF-TOKEN cookie is only set once a request has round-tripped through
// the backend's CSRF filter. The app's initial /api/auth/me GET sets it on
// mount, but a mutating request (e.g. login submitted immediately) can race
// ahead of that response and go out with no cookie yet, which the backend
// hard-rejects with 403 — reproduced via curl: a POST with no prior cookie
// always gets 403 regardless of credentials. Priming the cookie first makes
// every mutating call safe against that race, not just login.
async function ensureCsrfCookie(): Promise<string | null> {
  const existing = readCookie('XSRF-TOKEN');
  if (existing) return existing;
  await fetch('/api/auth/me', { credentials: 'include' });
  return readCookie('XSRF-TOKEN');
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = await ensureCsrfCookie();
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  const response = await fetch(path, { method, headers, body, credentials: 'include' });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    throw new ApiError(response.status, data?.message ?? `Er ging iets mis (${response.status})`, retryAfterSeconds);
  }

  return data as T;
}
