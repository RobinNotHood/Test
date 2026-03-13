import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Galvomag AG - Verwaltungssystem",
  description: "Tank- und Boilerrevisionen, Wasserfilter-Service",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
