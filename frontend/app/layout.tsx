import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "AçıqYol — Hər kəs üçün açıq yol",
  description: "Əlçatan məkanları kəşf edin",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "AçıqYol" },
  icons: { icon: "/brand/logo.svg", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = { themeColor: "#145c44" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
