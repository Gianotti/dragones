import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aquí Hay Dragones — Mar del Plata",
  description: "Gestión de retiros de juegos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
