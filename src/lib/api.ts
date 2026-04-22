// ─── API Types ───────────────────────────────────────────────────────────────

export type Stage = "planted" | "growing" | "ready" | "harvested";
export type Status = "active" | "at_risk" | "completed";
export type Role = "admin" | "agent";

export interface User {
  id: number;
  email: string;
  username: string;
  role: Role;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface Field {
  id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  stage: Stage;
  status: Status;
  assigned_to: User | null;
  created_by: User;
  created_at: string;
  updated_at: string;
  last_report_at: string | null;
}

export type ReportRating = "good" | "needs_attention" | "critical";

export interface FieldReport {
  id: number;
  field_id: number;
  agent: User;
  rating: ReportRating;
  notes: string;
  created_at: string;
}

export interface FieldUpdate {
  id: number;
  field: { id: number; name: string };
  agent: User;
  stage: Stage;
  notes: string;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardData {
  total_fields: number;
  total_agents: number;
  status_breakdown: { active: number; at_risk: number; completed: number };
  stage_breakdown: { planted: number; growing: number; ready: number; harvested: number };
  unassigned_fields: number;
  fields_updated_today: number;
  recent_updates: FieldUpdate[];
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = "ss_access";
const REFRESH_KEY = "ss_refresh";

export const getAccessToken = () => typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
export const getRefreshToken = () => typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;

export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("ss_user");
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, data.access);
    return data.access as string;
  } catch {
    clearTokens();
    return null;
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data === "object" && data !== null) {
      if (data.detail) return String(data.detail);
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const val = data[firstKey];
        return Array.isArray(val) ? String(val[0]) : String(val);
      }
    }
  } catch { /* fallthrough */ }
  return `Request failed with status ${res.status}`;
}

async function apiFetch(path: string, init: RequestInit = {}, _retry = true): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && _retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch(path, init, false);
    // Redirect to login — browser navigation clears React state cleanly
    window.location.href = "/login";
    return res; // unreachable but keeps TypeScript happy
  }

  return res;
}

// ─── HTTP methods ─────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await apiFetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}

// ─── Typed endpoint callers ───────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiPost<LoginResponse>("/api/v1/auth/login/", { email, password }),
  refresh: (refresh: string) =>
    apiPost<{ access: string }>("/api/v1/auth/token/refresh/", { refresh }),
  logout: (refresh: string) =>
    apiPost<void>("/api/v1/auth/logout/", { refresh }),
};

export const usersApi = {
  me: () => apiGet<User>("/api/v1/users/me/"),
  list: () => apiGet<Paginated<User>>("/api/v1/users/"),
};

export const fieldsApi = {
  list: () => apiGet<Paginated<Field>>("/api/v1/fields/"),
  get: (id: number) => apiGet<Field>(`/api/v1/fields/${id}/`),
  create: (data: { name: string; crop_type: string; planting_date: string }) =>
    apiPost<Field>("/api/v1/fields/", data),
  update: (id: number, data: Partial<Pick<Field, "name" | "crop_type" | "planting_date">>) =>
    apiPatch<Field>(`/api/v1/fields/${id}/`, data),
  delete: (id: number) => apiDelete(`/api/v1/fields/${id}/`),
  assign: (id: number, agent_id: number) =>
    apiPost<Field>(`/api/v1/fields/${id}/assign/`, { agent_id }),
  updateStage: (id: number, stage: Stage, notes: string) =>
    apiPost<FieldUpdate>(`/api/v1/fields/${id}/update-stage/`, { stage, notes }),
  submitReport: (id: number, data: { rating: ReportRating; notes?: string }) =>
    apiPost<FieldReport>(`/api/v1/fields/${id}/submit-report/`, data),
};

export const updatesApi = {
  list: (page = 1) => apiGet<Paginated<FieldUpdate>>(`/api/v1/updates/?page=${page}`),
};

interface DashboardRawResponse {
  role: "admin" | "agent";
  summary: {
    total_fields?: number;
    total_agents?: number;
    total_assigned?: number;
    status_breakdown: Record<string, number>;
    stage_breakdown: Record<string, number>;
    unassigned_fields?: number;
    fields_updated_today?: number;
  };
  recent_updates: FieldUpdate[];
}

export const dashboardApi = {
  summary: async (): Promise<DashboardData> => {
    const res = await apiGet<DashboardRawResponse>("/api/v1/dashboard/");
    const sb = res.summary.status_breakdown;
    const stb = res.summary.stage_breakdown;
    return {
      total_fields: res.summary.total_fields ?? res.summary.total_assigned ?? 0,
      total_agents: res.summary.total_agents ?? 0,
      unassigned_fields: res.summary.unassigned_fields ?? 0,
      fields_updated_today: res.summary.fields_updated_today ?? 0,
      status_breakdown: {
        active: sb.active ?? 0,
        at_risk: sb.at_risk ?? 0,
        completed: sb.completed ?? 0,
      },
      stage_breakdown: {
        planted: stb.planted ?? 0,
        growing: stb.growing ?? 0,
        ready: stb.ready ?? 0,
        harvested: stb.harvested ?? 0,
      },
      recent_updates: res.recent_updates,
    };
  },
  agents: () => apiGet<User[]>("/api/v1/dashboard/agents/"),
};
