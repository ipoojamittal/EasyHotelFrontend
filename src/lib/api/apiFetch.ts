import type { ApiErrorBody } from "@/types/api";

/**
 * The backend returns the token as "Bearer <jwt>" and expects that exact
 * string back as the Authorization header. We store it verbatim.
 */
const TOKEN_STORAGE_KEY = "hms.auth.token";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** In-memory token mirror (primary source of truth while the tab is open). */
let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      inMemoryToken = stored;
      return stored;
    }
  }
  return null;
}

export function setToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    if (token) window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;
  constructor(status: number, message: string, body: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Internal: skip the 401 redirect (used by the login call itself). */
  _skipAuthRedirect?: boolean;
};

/**
 * apiFetch — the single fetch wrapper used by every resource module.
 *
 * - Injects `Authorization: <token>` (the backend stores/expects "Bearer <jwt>")
 *   when a token is present.
 * - Sets `Content-Type: application/json` for requests with a body.
 * - Normalizes errors into `ApiError` (status + parsed body). The backend's
 *   global error handler returns either `{ message }` or, for validation,
 *   `{ errors: [...] }`.
 * - On 401: clears the token and redirects to /login (unless suppressed).
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers, _skipAuthRedirect, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) finalHeaders["Authorization"] = token;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network failure / backend down / CORS.
    throw new ApiError(
      0,
      "Could not reach the server. Please check your connection.",
      { message: err instanceof Error ? err.message : "Network error" }
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const parsed = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const body: ApiErrorBody = parsed ?? { message: res.statusText };
    const message =
      body.message ??
      (body.errors && body.errors.length
        ? body.errors[0].msg
        : `Request failed (${res.status})`);

    if (res.status === 401 && !_skipAuthRedirect) {
      setToken(null);
      if (typeof window !== "undefined") {
        const current = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(current)}`;
        // Avoid redirect loops (e.g., already on /login).
        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign(loginUrl);
        }
      }
    }

    throw new ApiError(res.status, message, body);
  }

  // Normalize Mongoose _id → id recursively so the frontend types (which
  // expect `id: string`) match the API responses. The backend returns
  // raw Mongoose documents with `_id`; this transforms every object in
  // the response tree.
  const normalized = normalizeIds(parsed);

  // Some endpoints return plain text (rare here); fall back to undefined.
  return (normalized as T) ?? (undefined as T);
}

/**
 * Recursively converts `_id` to `id` in any object/array from the API.
 * Also strips `__v` (Mongoose version key). Handles nested objects,
 * arrays, and populated references.
 */
function normalizeIds(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (key === "__v") continue; // skip Mongoose version key
      if (key === "_id") {
        result.id = normalizeIds(obj[key]);
      } else {
        result[key] = normalizeIds(obj[key]);
      }
    }
    return result;
  }
  return value;
}
