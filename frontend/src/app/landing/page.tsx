"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { clearAuth, getToken, saveAuth } from "@/lib/auth";
import type { LandingData, Role } from "@/types";

type MonthEntry = { mes: string; nombre_juego: string; id: number };
type ViewMode = "month" | "grid";
type Theme = "light" | "dark";

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthLabel(mes: string, short = false) {
  const [y, m] = mes.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  if (short) return d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

// ── Theme hook ────────────────────────────────────────────────────────────────

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("ahd-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("ahd-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return [theme, toggle];
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const CheckIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ClockIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="5" />
    <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const WAIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 mb-4 text-3xl">
            🐉
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aquí Hay Dragones</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Mar del Plata · Retiro de juegos</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
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

// ── Month View ────────────────────────────────────────────────────────────────

function MonthView({
  months,
  selectedMes,
  onSelectMes,
  data,
  loading,
}: {
  months: MonthEntry[];
  selectedMes: string | null;
  onSelectMes: (mes: string) => void;
  data: LandingData | null;
  loading: boolean;
}) {
  const total = data?.persons.length ?? 0;
  const done = data?.persons.filter((p) => p.estado === "retirado").length ?? 0;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const sortedPersons =
    data?.persons
      .slice()
      .sort((a, b) => {
        if (a.estado !== b.estado) return a.estado === "pendiente" ? -1 : 1;
        return `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es");
      }) ?? [];

  return (
    <div className="space-y-5">
      {/* Month tabs */}
      {months.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 min-w-max pb-1">
            {months.map((m, i) => {
              const active = m.mes === selectedMes;
              return (
                <button
                  key={m.mes}
                  onClick={() => onSelectMes(m.mes)}
                  className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                    active
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80">
                    {monthLabel(m.mes, true)}
                    {i === 0 && (
                      <span
                        className={`px-1.5 py-px rounded-full text-[9px] font-bold uppercase ${
                          active
                            ? "bg-white/25"
                            : "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400"
                        }`}
                      >
                        actual
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold mt-0.5 max-w-[150px] truncate">{m.nombre_juego}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game hero */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 animate-pulse shadow-sm dark:shadow-none">
          <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-28" />
          <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded w-56" />
          <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full w-full mt-4" />
        </div>
      ) : data?.nombre_juego ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <p className="text-gray-400 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1 capitalize">
            {selectedMes && monthLabel(selectedMes)}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-5">{data.nombre_juego}</h2>
          {total > 0 && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 dark:text-slate-400 mb-1.5">
                  <span>Progreso de retiros</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-200">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckIcon /> {done} retirado{done !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <ClockIcon /> {pending} pendiente{pending !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : selectedMes ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 text-gray-400 dark:text-slate-400 italic shadow-sm dark:shadow-none">
          Sin juego publicado para este mes.
        </div>
      ) : null}

      {/* People table */}
      {!loading && sortedPersons.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800">
                <th className="text-left px-5 py-3 text-gray-400 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">
                  Persona
                </th>
                <th className="text-left px-5 py-3 text-gray-400 dark:text-slate-400 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">
                  Email
                </th>
                <th className="text-right px-5 py-3 text-gray-400 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {sortedPersons.map((p) => (
                <tr key={p.pickup_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-slate-100">
                    {p.apellido}, {p.nombre}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 hidden sm:table-cell">
                    <a href={`mailto:${p.email}`} className="hover:text-violet-600 dark:hover:text-violet-400 transition">
                      {p.email}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {p.estado === "retirado" ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckIcon /> Retirado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <ClockIcon /> Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Grid View ─────────────────────────────────────────────────────────────────

function GridView({
  months,
  allData,
  loading,
}: {
  months: MonthEntry[];
  allData: Record<string, LandingData>;
  loading: boolean;
}) {
  const personMap = new Map<number, { nombre: string; apellido: string }>();
  Object.values(allData).forEach((d) =>
    d.persons.forEach((p) => {
      if (!personMap.has(p.person_id)) personMap.set(p.person_id, { nombre: p.nombre, apellido: p.apellido });
    })
  );
  const persons = Array.from(personMap.entries()).sort(([, a], [, b]) =>
    `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")
  );

  const statusMap: Record<number, Record<string, "retirado" | "pendiente">> = {};
  Object.entries(allData).forEach(([mes, d]) =>
    d.persons.forEach((p) => {
      if (!statusMap[p.person_id]) statusMap[p.person_id] = {};
      statusMap[p.person_id][mes] = p.estado;
    })
  );

  const colTotals = months.map((m) => {
    const col = allData[m.mes]?.persons ?? [];
    return { done: col.filter((p) => p.estado === "retirado").length, total: col.length };
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none animate-pulse">
        <div className="p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center text-gray-400 dark:text-slate-500 shadow-sm dark:shadow-none">
        No hay datos para mostrar.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
      <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
        <table className="text-sm border-collapse min-w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800">
              <th className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wide min-w-[160px]">
                Persona
              </th>
              {months.map((m) => (
                <th key={m.mes} className="px-3 py-2 text-center min-w-[100px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    {monthLabel(m.mes, true)}
                  </div>
                  <div
                    className="text-xs font-semibold text-gray-700 dark:text-slate-200 mt-0.5 truncate max-w-[96px] mx-auto"
                    title={m.nombre_juego}
                  >
                    {m.nombre_juego}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {persons.map(([id, p]) => (
              <tr key={id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 px-4 py-3 font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">
                  {p.apellido}, {p.nombre}
                </td>
                {months.map((m) => {
                  const estado = statusMap[id]?.[m.mes];
                  return (
                    <td key={m.mes} className="px-2 py-2.5 text-center">
                      {estado === "retirado" ? (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          title="Retirado"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </span>
                      ) : estado === "pendiente" ? (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          title="Pendiente"
                        >
                          <ClockIcon className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-700 text-lg leading-none">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <td className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wide">
                Total
              </td>
              {colTotals.map((c, i) => (
                <td key={months[i].mes} className="px-2 py-2.5 text-center">
                  <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    {c.done}/{c.total}
                  </div>
                  {c.total > 0 && (
                    <div className="text-[10px] text-gray-400 dark:text-slate-500">
                      {Math.round((c.done / c.total) * 100)}%
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [theme, toggleTheme] = useTheme();
  const [authenticated, setAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const [months, setMonths] = useState<MonthEntry[]>([]);
  const [selectedMes, setSelectedMes] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<LandingData | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);

  const [allData, setAllData] = useState<Record<string, LandingData>>({});
  const [gridLoading, setGridLoading] = useState(false);
  const gridFetched = useRef(false);

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
    setMonthLoading(true);
    api.landing
      .byMonth(selectedMes)
      .then(setMonthData)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("401") || msg.toLowerCase().includes("token")) {
          clearAuth();
          setAuthenticated(false);
        }
      })
      .finally(() => setMonthLoading(false));
  }, [selectedMes, authenticated]);

  // Fetch all months in parallel when switching to grid view
  useEffect(() => {
    if (viewMode !== "grid" || gridFetched.current || months.length === 0) return;
    gridFetched.current = true;
    setGridLoading(true);
    Promise.all(months.map((m) => api.landing.byMonth(m.mes)))
      .then((results) => {
        const data: Record<string, LandingData> = {};
        months.forEach((m, i) => { data[m.mes] = results[i]; });
        setAllData(data);
      })
      .catch(() => {})
      .finally(() => setGridLoading(false));
  }, [viewMode, months]);

  function logout() {
    clearAuth();
    setAuthenticated(false);
    setMonthData(null);
    setMonths([]);
    setSelectedMes(null);
    setAllData({});
    gridFetched.current = false;
  }

  if (!authenticated) return <LandingLogin onSuccess={() => setAuthenticated(true)} />;

  const organizers = monthData?.organizers ?? [];

  const ViewSwitcher = ({ mobile = false }: { mobile?: boolean }) =>
    mobile ? (
      <div className="flex border-t border-gray-100 dark:border-slate-800 sm:hidden">
        {(["month", "grid"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`flex-1 py-2 text-xs font-semibold transition cursor-pointer ${
              viewMode === v
                ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400"
                : "text-gray-400 dark:text-slate-500"
            }`}
          >
            {v === "month" ? "Por mes" : "Vista general"}
          </button>
        ))}
      </div>
    ) : (
      <div className="hidden sm:flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
        {(["month", "grid"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              viewMode === v
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            {v === "month" ? "Por mes" : "Vista general"}
          </button>
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors">
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Dragón">🐉</span>
            <span className="font-semibold text-gray-900 dark:text-white">Aquí Hay Dragones</span>
            <span className="text-gray-400 dark:text-slate-500 text-sm hidden sm:inline">· Mar del Plata</span>
          </div>

          <div className="flex items-center gap-3">
            <ViewSwitcher />

            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={logout}
              className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 text-sm transition cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>

        <ViewSwitcher mobile />
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {months.length === 0 && !monthLoading ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center text-gray-400 dark:text-slate-500 shadow-sm dark:shadow-none">
            No hay juegos publicados todavía.
          </div>
        ) : viewMode === "month" ? (
          <MonthView
            months={months}
            selectedMes={selectedMes}
            onSelectMes={setSelectedMes}
            data={monthData}
            loading={monthLoading}
          />
        ) : (
          <GridView months={months} allData={allData} loading={gridLoading} />
        )}

        {/* Organizers */}
        {organizers.length > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-800 pt-5 pb-2">
            <p className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">
              Coordinadores
            </p>
            <div className="flex flex-wrap gap-3">
              {organizers.map((org) => (
                <a
                  key={org.id}
                  href={`https://wa.me/${org.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 rounded-xl px-4 py-3 transition cursor-pointer shadow-sm dark:shadow-none"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">
                    <WAIcon />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{org.nombre}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">WhatsApp</p>
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
