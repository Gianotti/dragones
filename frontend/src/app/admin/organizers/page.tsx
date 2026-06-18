"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Organizer } from "@/types";

const EMPTY = { nombre: "", whatsapp: "" };

const inputCls = "w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";

const WAIcon = () => (
  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.523 5.854L0 24l6.296-1.5C7.985 23.46 9.951 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.659-.507-5.19-1.396l-.371-.221-3.862.921.95-3.773-.239-.384C2.508 15.65 2 13.882 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizadores</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Aparecen en la landing con enlace a WhatsApp.
          </p>
        </div>
        <button
          onClick={startNew}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          + Agregar
        </button>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
            {editing ? "Editar organizador" : "Nuevo organizador"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                WhatsApp * <span className="text-gray-400 dark:text-slate-500">(formato: 5492235550001)</span>
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                required
                placeholder="5492235550001"
                className={inputCls}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg text-sm border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer"
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
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <WAIcon />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{o.nombre}</p>
                  <a
                    href={`https://wa.me/${o.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    wa.me/{o.whatsapp}
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(o)}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {organizers.length === 0 && (
            <p className="text-gray-400 dark:text-slate-500 italic text-center py-8">
              No hay organizadores cargados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
