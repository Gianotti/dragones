"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Organizer } from "@/types";

const EMPTY = { nombre: "", whatsapp: "" };

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Organizer | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      setOrganizers(await api.organizers.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(o: Organizer) {
    setEditing(o);
    setForm({ nombre: o.nombre, whatsapp: o.whatsapp });
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.organizers.update(editing.id, form);
      } else {
        await api.organizers.create(form);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este organizador?")) return;
    try {
      await api.organizers.delete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizadores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aparecen en la landing con enlace a WhatsApp.
          </p>
        </div>
        <button
          onClick={startNew}
          className="bg-dragon-700 hover:bg-dragon-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Agregar
        </button>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editing ? "Editar organizador" : "Nuevo organizador"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dragon-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                WhatsApp * <span className="text-gray-400">(formato: 5492235550001)</span>
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                required
                placeholder="5492235550001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dragon-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-dragon-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-dragon-800 transition disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {organizers.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-semibold text-gray-800">{o.nombre}</p>
                  <a
                    href={`https://wa.me/${o.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline"
                  >
                    wa.me/{o.whatsapp}
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(o)}
                  className="text-sm text-dragon-600 hover:text-dragon-800 font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {organizers.length === 0 && (
            <p className="text-gray-400 italic text-center py-8">
              No hay organizadores cargados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
