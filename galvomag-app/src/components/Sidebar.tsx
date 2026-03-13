"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, ClipboardList, Route } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/standorte", label: "Standorte", icon: MapPin },
  { href: "/auftraege", label: "Aufträge", icon: ClipboardList },
  { href: "/routen", label: "Routenplanung", icon: Route },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--color-primary)] text-white flex flex-col z-50">
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
        © 2026 Galvomag AG
        <br />
        Regensdorf
      </div>
    </aside>
  );
}
