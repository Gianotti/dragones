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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Juegos del mes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Al crear un juego se generan los retiros pendientes para todas las personas activas.
        </p>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      {/* Create form */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Publicar juego del mes</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Nombre del juego *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Terraforming Mars"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dragon-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mes (YYYY-MM) *</label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dragon-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-dragon-700 hover:bg-dragon-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              {saving ? "Creando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>

      {/* Games list */}
      {!loading && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Mes</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Juego</th>
                <th className="text-center px-4 py-3 text-gray-600 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {games.map((g, i) => (
                <tr key={g.id} className={i === 0 ? "bg-dragon-50" : ""}>
                  <td className="px-4 py-3 text-gray-500 capitalize whitespace-nowrap">
                    {monthLabel(g.mes)}
                    {i === 0 && (
                      <span className="ml-2 text-xs bg-dragon-100 text-dragon-700 px-2 py-0.5 rounded-full font-semibold">
                        vigente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {editingId === g.id ? (
                      <input
                        autoFocus
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-dragon-500"
                      />
                    ) : (
                      g.nombre_juego
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    {editingId === g.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(g.id)}
                          disabled={saving}
                          className="text-xs text-green-700 hover:text-green-900 font-medium"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingId(g.id); setEditNombre(g.nombre_juego); }}
                        className="text-xs text-dragon-600 hover:text-dragon-800 font-medium"
                      >
                        Editar nombre
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
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
