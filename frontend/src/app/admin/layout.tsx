"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Panel", icon: "🏠" },
  { href: "/admin/persons", label: "Personas", icon: "👥" },
  { href: "/admin/games", label: "Juegos", icon: "🎲" },
  { href: "/admin/organizers", label: "Organizadores", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-dragon-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-dragon-700">
          <div className="text-3xl mb-1">🐉</div>
          <div className="font-bold text-sm leading-tight">Aquí Hay Dragones</div>
          <div className="text-dragon-300 text-xs mt-0.5">Administración</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-dragon-600 text-white"
                    : "text-dragon-200 hover:bg-dragon-800 hover:text-white"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-dragon-700">
          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dragon-300 hover:bg-dragon-800 hover:text-white transition"
          >
            <span>🚪</span> Salir
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">{children}</main>
    </div>
  );
}
