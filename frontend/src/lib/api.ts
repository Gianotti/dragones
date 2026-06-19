import { getToken } from "./auth";

// En Docker: usa /api (Next.js rewrites a http://backend:8000)
// En dev local sin Docker: seteá NEXT_PUBLIC_API_URL=http://localhost:8000 en .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const api = {
  auth: {
    adminLogin: (username: string, password: string) =>
      request<{ access_token: string; role: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    landingLogin: (username: string, password: string) =>
      request<{ access_token: string; role: string }>("/auth/landing-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
  },

  persons: {
    list: () => request<import("@/types").Person[]>("/admin/persons"),
    create: (data: { nombre: string; apellido: string; email: string; whatsapp?: string }) =>
      request<import("@/types").Person>("/admin/persons", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import("@/types").Person>) =>
      request<import("@/types").Person>(`/admin/persons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    toggleActive: (id: number) =>
      request<import("@/types").Person>(`/admin/persons/${id}/toggle-active`, {
        method: "PATCH",
      }),
  },

  games: {
    list: () => request<import("@/types").MonthlyGame[]>("/admin/games"),
    create: (data: { nombre_juego: string; mes: string }) =>
      request<import("@/types").MonthlyGame>("/admin/games", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, nombre_juego: string) =>
      request<import("@/types").MonthlyGame>(`/admin/games/${id}`, {
        method: "PUT",
        body: JSON.stringify({ nombre_juego }),
      }),
    delete: (id: number) =>
      request<void>(`/admin/games/${id}`, { method: "DELETE" }),
  },

  pickups: {
    toggle: (id: number) =>
      request<import("@/types").PickupStatus>(`/admin/pickups/${id}/toggle`, {
        method: "PATCH",
      }),
  },

  organizers: {
    list: () => request<import("@/types").Organizer[]>("/admin/organizers"),
    create: (data: { nombre: string; whatsapp: string }) =>
      request<import("@/types").Organizer>("/admin/organizers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { nombre: string; whatsapp: string }) =>
      request<import("@/types").Organizer>(`/admin/organizers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/admin/organizers/${id}`, { method: "DELETE" }),
  },

  landing: {
    current: () => request<import("@/types").LandingData>("/landing/current"),
    months: () => request<{ mes: string; nombre_juego: string; id: number }[]>("/landing/months"),
    byMonth: (mes: string) => request<import("@/types").LandingData>(`/landing/month/${mes}`),
  },
};
