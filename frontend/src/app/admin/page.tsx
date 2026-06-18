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
      // Refresh current view
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de retiros</h1>
        <p className="text-gray-500 text-sm mt-1">
          Marcá cada persona cuando retira su juego del mes.
        </p>
      </div>

      {/* Game header */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Juego del mes
          </p>
          {loading ? (
            <div className="h-7 bg-gray-100 rounded animate-pulse w-40" />
          ) : data?.nombre_juego ? (
            <>
              <h2 className="text-2xl font-bold text-dragon-700">{data.nombre_juego}</h2>
              <p className="text-gray-400 text-sm capitalize">{monthLabel(data.mes!)}</p>
            </>
          ) : (
            <p className="text-gray-400 italic">
              Sin juego publicado.{" "}
              <a href="/admin/games" className="text-dragon-600 underline">
                Crear uno
              </a>
            </p>
          )}
        </div>

        {months.length > 1 && (
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

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: total, color: "bg-gray-100 text-gray-700" },
            { label: "Retirados", value: total - pending, color: "bg-green-100 text-green-800" },
            { label: "Pendientes", value: pending, color: "bg-amber-100 text-amber-800" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      {/* Pickup table */}
      {!loading && data && data.persons.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Persona</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Email</th>
                <th className="text-center px-4 py-3 text-gray-600 font-semibold">Estado</th>
                <th className="text-center px-4 py-3 text-gray-600 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.persons.map((p) => (
                <tr
                  key={p.pickup_id}
                  className={p.estado === "retirado" ? "bg-green-50" : "hover:bg-gray-50"}
                >
                  <td className="px-4 py-3 font-medium">
                    {p.apellido}, {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">
                    {p.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.estado === "retirado" ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ✅ Retirado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ⏳ Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(p.pickup_id)}
                      disabled={toggling === p.pickup_id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                        p.estado === "retirado"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      } disabled:opacity-50`}
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
        <p className="text-gray-400 italic text-center py-8">
          No hay personas activas para este mes.
        </p>
      )}
    </div>
  );
}
