"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Person } from "@/types";

const EMPTY = { nombre: "", apellido: "", email: "", whatsapp: "" };

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
          <h1 className="text-2xl font-bold text-gray-900">Personas</h1>
          <p className="text-sm text-gray-500 mt-1">Altas, bajas y edición de suscriptores.</p>
        </div>
        <button
          onClick={startNew}
          className="bg-dragon-700 hover:bg-dragon-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + Nueva persona
        </button>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editing ? "Editar persona" : "Nueva persona"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["nombre", "apellido", "email", "whatsapp"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                  {field}{field === "whatsapp" ? " (opcional)" : " *"}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={field !== "whatsapp"}
                  placeholder={field === "whatsapp" ? "5492235550001" : ""}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dragon-500"
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-3">
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

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">WhatsApp</th>
                <th className="text-center px-4 py-3 text-gray-600 font-semibold">Activo</th>
                <th className="text-center px-4 py-3 text-gray-600 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {persons.map((p) => (
                <tr key={p.id} className={p.activo ? "" : "opacity-50 bg-gray-50"}>
                  <td className="px-4 py-3 font-medium">
                    {p.apellido}, {p.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {p.whatsapp ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs text-dragon-600 hover:text-dragon-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(p.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      {p.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
              {persons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
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
