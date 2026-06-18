import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aquí Hay Dragones — Mar del Plata",
  description: "Gestión de retiros de juegos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ahd-theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 antialiased transition-colors" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
