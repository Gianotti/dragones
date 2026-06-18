import type { Role } from "@/types";

const TOKEN_COOKIE = "dragones_token";
const ROLE_COOKIE = "dragones_role";

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function saveAuth(token: string, role: Role) {
  setCookie(TOKEN_COOKIE, token);
  setCookie(ROLE_COOKIE, role);
}

export function getToken(): string | null {
  return getCookie(TOKEN_COOKIE);
}

export function getRole(): Role | null {
  return getCookie(ROLE_COOKIE) as Role | null;
}

export function clearAuth() {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(ROLE_COOKIE);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
