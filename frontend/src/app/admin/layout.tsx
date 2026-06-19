"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const HomeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const UsersIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const DiceIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" /><path strokeLinecap="round" d="M8 8h.01M12 12h.01M16 16h.01M8 16h.01M16 8h.01" />
  </svg>
);
const ClipboardIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const LogoutIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const MoonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const NAV = [
  { href: "/admin", label: "Panel", Icon: HomeIcon },
  { href: "/admin/persons", label: "Personas", Icon: UsersIcon },
  { href: "/admin/games", label: "Juegos", Icon: DiceIcon },
  { href: "/admin/organizers", label: "Organiz.", Icon: ClipboardIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, toggleTheme] = useTheme();

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors">

      {/* ── Desktop sidebar (md+) ────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 bg-violet-950 dark:bg-slate-900 border-r border-violet-900 dark:border-slate-800 text-white flex-col shrink-0">
        <div className="px-5 py-6 border-b border-violet-900 dark:border-slate-800">
          <div className="text-3xl mb-1">🐉</div>
          <div className="font-bold text-sm leading-tight text-white">Aquí Hay Dragones</div>
          <div className="text-violet-300 dark:text-slate-400 text-xs mt-0.5">Administración</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-violet-200 dark:text-slate-400 hover:bg-violet-900 dark:hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon />
                {label === "Organiz." ? "Organizadores" : label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-violet-900 dark:border-slate-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-300 dark:text-slate-400 hover:bg-violet-900 dark:hover:bg-slate-800 hover:text-white transition cursor-pointer"
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-300 dark:text-slate-400 hover:bg-violet-900 dark:hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <LogoutIcon /> Salir
          </button>
        </div>
      </aside>

      {/* ── Mobile + content column ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top header */}
        <header className="md:hidden sticky top-0 z-20 bg-violet-950 dark:bg-slate-900 border-b border-violet-900 dark:border-slate-800 text-white px-4 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Dragón">🐉</span>
            <span className="font-bold text-sm">Aquí Hay Dragones</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-violet-300 hover:bg-violet-900 hover:text-white transition cursor-pointer"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-violet-300 hover:bg-violet-900 hover:text-white transition cursor-pointer"
            >
              <LogoutIcon />
            </button>
          </div>
        </header>

        {/* Main content — pb accounts for mobile bottom nav */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-violet-950 dark:bg-slate-900 border-t border-violet-900 dark:border-slate-800"
          aria-label="Navegación principal"
        >
          <div className="flex">
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-3 text-[10px] font-semibold transition ${
                    active
                      ? "text-white"
                      : "text-violet-400 dark:text-slate-500 hover:text-white"
                  }`}
                >
                  {active && <span className="absolute top-0 inset-x-1/4 h-0.5 bg-violet-400 rounded-full" />}
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

      </div>
    </div>
  );
}
