/**
 * Client HTTP partagé (mode SPA Sanctum).
 *
 * Les mutations récupèrent d'abord le cookie CSRF puis envoient le token
 * dans X-XSRF-TOKEN. Tout passe par les cookies de session (`credentials`).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const API_ORIGIN = new URL(API_URL).origin;

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

async function ensureCsrf(): Promise<void> {
  await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, { credentials: "include" });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Erreur ${res.status}`, data?.errors ?? {});
  }
  return data as T;
}

/** Upload multipart (FormData) avec CSRF + cookies de session. */
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  await ensureCsrf();
  const token = readCookie("XSRF-TOKEN");

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    // Pas de Content-Type : le navigateur fixe la frontière multipart lui-même.
    headers: {
      Accept: "application/json",
      ...(token ? { "X-XSRF-TOKEN": token } : {}),
    },
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Erreur ${res.status}`, data?.errors ?? {});
  }
  return data as T;
}

type Method = "POST" | "PATCH" | "PUT" | "DELETE";

export async function apiSend<T>(path: string, method: Method, body?: unknown): Promise<T> {
  await ensureCsrf();
  const token = readCookie("XSRF-TOKEN");

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "X-XSRF-TOKEN": token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Erreur ${res.status}`, data?.errors ?? {});
  }
  return data as T;
}
