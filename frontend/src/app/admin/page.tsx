"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { LandingData } from "@/types";

function monthLabel(mes: string) {
  const [y, m] = mes.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);

export default function AdminDashboard() {
  const [data, setData] = useState<LandingData | null>(null);
  const [months, setMonths] = useState<{ mes: string; nombre_juego: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load(mes?: string) {
    setLoading(true);
    setError("");
    try {
      const result = mes ? await api.landing.byMonth(mes) : await api.landing.current();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.landing.months().then(setMonths).catch(() => {});
    load();
  }, []);

  async function toggle(pickupId: number) {
    setToggling(pickupId);
    try {
      await api.pickups.toggle(pickupId);
      await load(selectedMonth ?? undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cambiar estado");
    } finally {
      setToggling(null);
    }
  }

  function handleMonthChange(mes: string) {
    setSelectedMonth(mes);
    load(mes);
  }

  const pending = data?.persons.filter((p) => p.estado === "pendiente").length ?? 0;
  const total = data?.persons.length ?? 0;
  const done = total - pending;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de retiros</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Marcá cada persona cuando retira su juego del mes.
        </p>
      </div>

      {/* Game header */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Juego del mes
          </p>
          {loading ? (
            <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-40" />
          ) : data?.nombre_juego ? (
            <>
              <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-400">{data.nombre_juego}</h2>
              <p className="text-gray-400 dark:text-slate-500 text-sm capitalize">{monthLabel(data.mes!)}</p>
            </>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 italic">
              Sin juego publicado.{" "}
              <a href="/admin/games" className="text-violet-600 dark:text-violet-400 underline">
                Crear uno
              </a>
            </p>
          )}
        </div>

        {months.length > 1 && (
          <select
            value={selectedMonth ?? data?.mes ?? ""}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.mes} value={m.mes}>
                {monthLabel(m.mes)} — {m.nombre_juego}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-sm font-medium">Total</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-500/20">
            <div className="text-3xl font-bold">{done}</div>
            <div className="text-sm font-medium">Retirados</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-xl p-4 text-center border border-amber-100 dark:border-amber-500/20">
            <div className="text-3xl font-bold">{pending}</div>
            <div className="text-sm font-medium">Pendientes</div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Pickup table */}
      {!loading && data && data.persons.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Persona</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-center px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Estado</th>
                <th className="text-center px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {data.persons.map((p) => (
                <tr
                  key={p.pickup_id}
                  className={
                    p.estado === "retirado"
                      ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                      : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                    {p.apellido}, {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 hidden sm:table-cell text-xs">
                    {p.email}
                  </td>
                  <td className="px-4 py-3 text-center">
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
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(p.pickup_id)}
                      disabled={toggling === p.pickup_id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 ${
                        p.estado === "retirado"
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20"
                      }`}
                    >
                      {toggling === p.pickup_id
                        ? "..."
                        : p.estado === "retirado"
                        ? "Marcar pendiente"
                        : "Marcar retirado"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data && data.persons.length === 0 && data.nombre_juego && (
        <p className="text-gray-400 dark:text-slate-500 italic text-center py-8">
          No hay personas activas para este mes.
        </p>
      )}
    </div>
  );
}
