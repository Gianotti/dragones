"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { saveAuth, isAuthenticated, getRole } from "@/lib/auth";
import type { Role } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAdmin = searchParams.get("from") === "admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getRole();
      router.replace(role === "admin" ? "/admin" : "/landing");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Try admin first if coming from /admin, otherwise try landing
      let result: { access_token: string; role: string } | null = null;
      try {
        result = await api.auth.adminLogin(username, password);
      } catch {
        if (!fromAdmin) {
          result = await api.auth.landingLogin(username, password);
        } else {
          throw new Error("Credenciales de administrador incorrectas");
        }
      }
      saveAuth(result.access_token, result.role as Role);
      router.push(result.role === "admin" ? "/admin" : "/landing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dragon-900 via-dragon-800 to-purple-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐉</div>
          <h1 className="text-2xl font-bold text-dragon-800">Aquí Hay Dragones</h1>
          <p className="text-gray-500 text-sm mt-1">Mar del Plata · Retiro de juegos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dragon-500"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dragon-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dragon-700 hover:bg-dragon-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
