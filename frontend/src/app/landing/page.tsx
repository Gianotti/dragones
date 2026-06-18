"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuth } from "@/lib/auth";
import type { LandingData } from "@/types";

function monthLabel(mes: string): string {
  const [year, month] = mes.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function LandingPage() {
  const router = useRouter();
  const [data, setData] = useState<LandingData | null>(null);
  const [months, setMonths] = useState<{ mes: string; nombre_juego: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(mes?: string) {
    setLoading(true);
    setError("");
    try {
      const result = mes ? await api.landing.byMonth(mes) : await api.landing.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.landing.months().then(setMonths).catch(() => {});
    loadData();
  }, []);

  function handleMonthChange(mes: string) {
    setSelectedMonth(mes);
    loadData(mes);
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  const pending = data?.persons.filter((p) => p.estado === "pendiente").length ?? 0;
  const total = data?.persons.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

        {/* People table */}
        {error && (
          <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

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
          <p className="text-center text-gray-400 italic py-8">No hay personas inscriptas en este mes.</p>
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
