"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { clearAuth, getToken, saveAuth } from "@/lib/auth";
import type { LandingData, Role } from "@/types";

type MonthEntry = { mes: string; nombre_juego: string; id: number };

function monthLabel(mes: string, short = false) {
  const [y, m] = mes.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  if (short)
    return d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

// ── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);
const WAIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.523 5.854L0 24l6.296-1.5C7.985 23.46 9.951 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.659-.507-5.19-1.396l-.371-.221-3.862.921.95-3.773-.239-.384C2.508 15.65 2 13.882 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

// ── Login ─────────────────────────────────────────────────────────────────────
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
      const res = await api.auth.landingLogin(username, password);
      saveAuth(res.access_token, res.role as Role);
      onSuccess();
    } catch {
      try {
        const res = await api.auth.adminLogin(username, password);
        saveAuth(res.access_token, res.role as Role);
        onSuccess();
      } catch {
        setError("Usuario o contraseña incorrectos");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4 text-3xl">
            🐉
          </div>
          <h1 className="text-2xl font-bold text-white">Aquí Hay Dragones</h1>
          <p className="text-slate-400 text-sm mt-1">Mar del Plata · Retiro de juegos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                required
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Landing ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [months, setMonths] = useState<MonthEntry[]>([]);
  const [selectedMes, setSelectedMes] = useState<string | null>(null);
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getToken()) setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    api.landing
      .months()
      .then((ms) => {
        setMonths(ms);
        if (ms.length > 0) setSelectedMes(ms[0].mes);
      })
      .catch(() => {});
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !selectedMes) return;
    setLoading(true);
    api.landing
      .byMonth(selectedMes)
      .then(setData)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("401") || msg.toLowerCase().includes("token")) {
          clearAuth();
          setAuthenticated(false);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedMes, authenticated]);

  function logout() {
    clearAuth();
    setAuthenticated(false);
    setData(null);
    setMonths([]);
    setSelectedMes(null);
  }

  if (!authenticated) return <LandingLogin onSuccess={() => setAuthenticated(true)} />;

  const total = data?.persons.length ?? 0;
  const done = data?.persons.filter((p) => p.estado === "retirado").length ?? 0;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const sortedPersons = data?.persons
    .slice()
    .sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === "pendiente" ? -1 : 1;
      return `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es");
    }) ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐉</span>
            <span className="font-semibold text-white">Aquí Hay Dragones</span>
            <span className="text-slate-500 text-sm hidden sm:inline">· Mar del Plata</span>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-200 text-sm transition cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Month tabs — horizontal scroll */}
        {months.length > 0 && (
          <div className="overflow-x-auto -mx-4 px-4" ref={tabsRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="flex gap-2 min-w-max pb-1">
              {months.map((m, i) => {
                const active = m.mes === selectedMes;
                return (
                  <button
                    key={m.mes}
                    onClick={() => setSelectedMes(m.mes)}
                    className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80">
                      {monthLabel(m.mes, true)}
                      {i === 0 && (
                        <span className={`px-1.5 py-px rounded-full text-[9px] font-bold uppercase ${
                          active ? "bg-white/25 text-white" : "bg-violet-500/20 text-violet-400"
                        }`}>
                          actual
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold mt-0.5 max-w-[150px] truncate">
                      {m.nombre_juego}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {months.length === 0 && !loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No hay juegos publicados todavía.
          </div>
        )}

        {/* Game hero */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-28" />
            <div className="h-7 bg-slate-800 rounded w-56" />
            <div className="h-2 bg-slate-800 rounded-full w-full mt-4" />
          </div>
        ) : data?.nombre_juego ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1 capitalize">
              {selectedMes && monthLabel(selectedMes)}
            </p>
            <h2 className="text-3xl font-bold text-white mb-5">{data.nombre_juego}</h2>

            {total > 0 && (
              <div className="space-y-3">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Progreso de retiros</span>
                    <span className="font-semibold text-slate-200">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                {/* Counters */}
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckIcon /> {done} retirado{done !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <ClockIcon /> {pending} pendiente{pending !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : selectedMes ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 italic">
            Sin juego publicado para este mes.
          </div>
        ) : null}

        {/* People table */}
        {!loading && sortedPersons.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">
                    Persona
                  </th>
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedPersons.map((p) => (
                  <tr key={p.pickup_id} className="hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-100">
                      {p.apellido}, {p.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">
                      <a
                        href={`mailto:${p.email}`}
                        className="hover:text-violet-400 transition"
                      >
                        {p.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.estado === "retirado" ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <CheckIcon />
                          Retirado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <ClockIcon />
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Organizers */}
        {data?.organizers && data.organizers.length > 0 && (
          <div className="border-t border-slate-800 pt-5 pb-2">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">
              Coordinadores
            </p>
            <div className="flex flex-wrap gap-3">
              {data.organizers.map((org) => (
                <a
                  key={org.id}
                  href={`https://wa.me/${org.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-xl px-4 py-3 transition cursor-pointer"
                >
                  <WAIcon />
                  <div>
                    <p className="text-sm font-medium text-slate-100">{org.nombre}</p>
                    <p className="text-xs text-emerald-400">WhatsApp</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
