"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, ClipboardList, Route, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/standorte", label: "Standorte", icon: MapPin },
  { href: "/auftraege", label: "Aufträge", icon: ClipboardList },
  { href: "/routen", label: "Routen", icon: Route },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-primary)] text-white flex-col z-50">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-wide">Galvomag AG</h1>
          <p className="text-xs text-white/60 mt-1">Tank- &amp; Boilerrevisionen</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-[var(--color-accent)] border-r-3 border-[var(--color-accent)]"
                    : "text-white/80 hover:bg-white/8 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-white/40">
          © 2026 Galvomag AG<br />Regensdorf
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--color-primary)] text-white flex items-center justify-between px-4 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-base font-bold">Galvomag AG</h1>
        </div>
        <span className="text-xs text-white/60">Tank- &amp; Boilerrev.</span>
      </header>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-14 left-0 bottom-0 w-64 bg-[var(--color-primary)] text-white z-50 shadow-2xl">
            <nav className="py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm transition-colors ${
                      isActive
                        ? "bg-white/15 text-[var(--color-accent)] border-r-3 border-[var(--color-accent)]"
                        : "text-white/80 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-border)] flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
