import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Galvomag AG - Verwaltungssystem",
  description: "Tank- und Boilerrevisionen, Wasserfilter-Service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
