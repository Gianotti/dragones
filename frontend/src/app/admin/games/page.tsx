"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MonthlyGame } from "@/types";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(mes: string) {
  const [y, m] = mes.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

const inputCls = "w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";

export default function GamesPage() {
  const [games, setGames] = useState<MonthlyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [mes, setMes] = useState(currentMonth());
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");

  async function loadGames() {
    try {
      setGames(await api.games.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGames(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.games.create({ nombre_juego: nombre, mes });
      setNombre("");
      setMes(currentMonth());
      await loadGames();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear juego");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: number) {
    setSaving(true);
    setError("");
    try {
      await api.games.update(id, editNombre);
      setEditingId(null);
      await loadGames();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este juego? También se borrarán todos los retiros asociados.")) return;
    setError("");
    try {
      await api.games.delete(id);
      await loadGames();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Juegos del mes</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Al crear un juego se generan los retiros pendientes para todas las personas activas.
        </p>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none p-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Publicar juego del mes</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Nombre del juego *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Terraforming Mars"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Mes (YYYY-MM) *</label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              required
              className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Creando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>

      {!loading && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Mes</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Juego</th>
                <th className="text-center px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {games.map((g, i) => (
                <tr key={g.id} className={i === 0 ? "bg-violet-50 dark:bg-violet-500/5" : "hover:bg-gray-50 dark:hover:bg-slate-800/50"}>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 capitalize whitespace-nowrap">
                    {monthLabel(g.mes)}
                    {i === 0 && (
                      <span className="ml-2 text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full font-semibold">
                        vigente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                    {editingId === g.id ? (
                      <input
                        autoFocus
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    ) : (
                      g.nombre_juego
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-3">
                    {editingId === g.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(g.id)}
                          disabled={saving}
                          className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium cursor-pointer"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 font-medium cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(g.id); setEditNombre(g.nombre_juego); }}
                          className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium cursor-pointer"
                        >
                          Editar nombre
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 italic">
                    No hay juegos cargados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
