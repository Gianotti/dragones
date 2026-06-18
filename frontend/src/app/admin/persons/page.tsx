"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Person } from "@/types";

const EMPTY = { nombre: "", apellido: "", email: "", whatsapp: "" };

const inputCls = "w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Person | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadPersons() {
    try {
      setPersons(await api.persons.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPersons(); }, []);

  function startEdit(p: Person) {
    setEditing(p);
    setForm({ nombre: p.nombre, apellido: p.apellido, email: p.email, whatsapp: p.whatsapp ?? "" });
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
      const payload = { ...form, whatsapp: form.whatsapp || undefined };
      if (editing) {
        await api.persons.update(editing.id, payload);
      } else {
        await api.persons.create(payload);
      }
      setShowForm(false);
      await loadPersons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: number) {
    try {
      await api.persons.toggleActive(id);
      await loadPersons();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personas</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Altas, bajas y edición de suscriptores.</p>
        </div>
        <button
          onClick={startNew}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          + Nueva persona
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
            {editing ? "Editar persona" : "Nueva persona"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["nombre", "apellido", "email", "whatsapp"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1 capitalize">
                  {field}{field === "whatsapp" ? " (opcional)" : " *"}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={field !== "whatsapp"}
                  placeholder={field === "whatsapp" ? "5492235550001" : ""}
                  className={inputCls}
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-3">
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
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">WhatsApp</th>
                <th className="text-center px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Activo</th>
                <th className="text-center px-4 py-3 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {persons.map((p) => (
                <tr key={p.id} className={`transition ${p.activo ? "hover:bg-gray-50 dark:hover:bg-slate-800/50" : "opacity-50 bg-gray-50 dark:bg-slate-800/30"}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                    {p.apellido}, {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 hidden sm:table-cell">{p.email}</td>
                  <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs hidden md:table-cell">
                    {p.whatsapp ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.activo
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                    }`}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-3">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(p.id)}
                      className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 font-medium cursor-pointer"
                    >
                      {p.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
              {persons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 italic">
                    No hay personas cargadas aún.
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
