/**
 * Client auth Nexus Noir (mode SPA Sanctum).
 *
 * Flux : on récupère d'abord le cookie CSRF, puis on envoie le token
 * dans l'en-tête X-XSRF-TOKEN. Tout passe par des cookies de session
 * HTTP-only (`credentials: include`) — aucun token stocké en JS.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const API_ORIGIN = new URL(API_URL).origin;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  permissions: string[];
  emailVerifiedAt: string | null;
  createdAt: string | null;
};

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

type Method = "GET" | "POST";

async function request<T>(path: string, method: Method, body?: unknown): Promise<T> {
  if (method !== "GET") {
    await ensureCsrf();
  }

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
    throw new ApiError(
      res.status,
      (data && data.message) || `Erreur ${res.status}`,
      (data && data.errors) || {},
    );
  }

  return data as T;
}

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type Wrapped<T> = { data: T };

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await request<Wrapped<AuthUser>>("/auth/register", "POST", payload);
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const res = await request<Wrapped<AuthUser>>("/auth/login", "POST", { email, password });
    return res.data;
  },

  async logout(): Promise<void> {
    await request<unknown>("/auth/logout", "POST");
  },

  async me(): Promise<AuthUser | null> {
    try {
      const res = await request<Wrapped<AuthUser>>("/auth/user", "GET");
      return res.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      throw error;
    }
  },
};
