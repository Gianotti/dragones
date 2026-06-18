"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuth, getToken, saveAuth } from "@/lib/auth";
import type { LandingData, Role } from "@/types";

function monthLabel(mes: string): string {
  const [year, month] = mes.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

// ── Inline login form ──────────────────────────────────────────────────────────
function LandingLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.auth.landingLogin(username, password);
      saveAuth(result.access_token, result.role as Role);
      onSuccess();
    } catch {
      // If landing credentials fail, try admin (admin can also see landing)
      try {
        const result = await api.auth.adminLogin(username, password);
        saveAuth(result.access_token, result.role as Role);
        onSuccess();
      } catch {
        setError("Usuario o contraseña incorrectos");
      }
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

// ── Landing content ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<LandingData | null>(null);
  const [months, setMonths] = useState<{ mes: string; nombre_juego: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check token on mount
  useEffect(() => {
    if (getToken()) setAuthenticated(true);
  }, []);

  async function loadData(mes?: string) {
    setLoading(true);
    setError("");
    try {
      const result = mes ? await api.landing.byMonth(mes) : await api.landing.current();
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar datos";
      // Token expired or invalid — show login again
      if (msg.includes("401") || msg.toLowerCase().includes("token") || msg.toLowerCase().includes("expirado")) {
        clearAuth();
        setAuthenticated(false);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authenticated) return;
    api.landing.months().then(setMonths).catch(() => {});
    loadData();
  }, [authenticated]);

  function handleMonthChange(mes: string) {
    setSelectedMonth(mes);
    loadData(mes);
  }

  function handleLogout() {
    clearAuth();
    setAuthenticated(false);
    setData(null);
  }

  // ── Not logged in: show inline login ────────────────────────────────────────
  if (!authenticated) {
    return <LandingLogin onSuccess={() => setAuthenticated(true)} />;
  }

  // ── Logged in: show landing ─────────────────────────────────────────────────
  const pending = data?.persons.filter((p) => p.estado === "pendiente").length ?? 0;
  const total = data?.persons.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-dragon-900 to-dragon-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐉</span>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Aquí Hay Dragones</h1>
              <p className="text-dragon-200 text-sm">Mar del Plata · Retiro de juegos del mes</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-dragon-200 hover:text-white text-sm underline"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Game of the month */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">
                Juego del mes
              </p>
              {loading ? (
                <div className="h-8 bg-gray-100 rounded animate-pulse w-48" />
              ) : data?.nombre_juego ? (
                <h2 className="text-3xl font-bold text-dragon-700">{data.nombre_juego}</h2>
              ) : (
                <p className="text-gray-400 italic">Sin juego publicado aún</p>
              )}
              {data?.mes && (
                <p className="text-gray-500 text-sm mt-1 capitalize">{monthLabel(data.mes)}</p>
              )}
            </div>

            {months.length > 0 && (
              <select
                value={selectedMonth ?? data?.mes ?? ""}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dragon-500"
              >
                {months.map((m) => (
                  <option key={m.mes} value={m.mes}>
                    {monthLabel(m.mes)} — {m.nombre_juego}
                  </option>
                ))}
              </select>
            )}
          </div>

          {total > 0 && (
            <div className="mt-4 flex gap-4 text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                ✅ Retirados: {total - pending}
              </span>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                ⏳ Pendientes: {pending}
              </span>
            </div>
          )}
        </section>

        {error && (
          <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        {/* People table */}
        {!loading && data && data.persons.length > 0 && (
          <section className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Email</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Fecha retiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.persons.map((person) => (
                  <tr key={person.pickup_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {person.apellido}, {person.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      <a href={`mailto:${person.email}`} className="hover:text-dragon-600">
                        {person.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {person.estado === "retirado" ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ✅ Retirado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          ⏳ Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {person.fecha_retiro
                        ? new Date(person.fecha_retiro).toLocaleDateString("es-AR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {!loading && data && data.persons.length === 0 && data.nombre_juego && (
          <p className="text-center text-gray-400 italic py-8">
            No hay personas inscriptas en este mes.
          </p>
        )}

        {/* Organizers */}
        {data && data.organizers.length > 0 && (
          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Coordinadores
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {data.organizers.map((org) => (
                <a
                  key={org.id}
                  href={`https://wa.me/${org.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-green-50 hover:border-green-300 transition"
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-medium text-gray-800">{org.nombre}</p>
                    <p className="text-xs text-green-600">WhatsApp</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
