"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Wrench, Droplets, ChevronRight } from "lucide-react";

interface Standort {
  id: string; firma: string; strasse: string; plz: string; ort: string;
  region: string; kanton: string; kalk_region: string; zugang_schluessel: string;
  offene_auftraege: number; filter_count: number; tigerloop_count: number;
  auftraege_info: string | null; anlage_typen: string | null;
}

const statusLabels: Record<string, string> = {
  geplant: "Geplant",
  angebot_gesendet: "Ang. gesendet",
  angebot_akzeptiert: "Akzeptiert",
  angebot_abgelehnt: "Abgelehnt",
  in_bearbeitung: "In Bearb.",
  erledigt: "Erledigt",
};

const statusColors: Record<string, string> = {
  geplant: "bg-gray-200 text-gray-700",
  angebot_gesendet: "bg-blue-100 text-blue-700",
  angebot_akzeptiert: "bg-green-100 text-green-700",
  angebot_abgelehnt: "bg-red-100 text-red-700",
};

export default function StandortePage() {
  const [standorte, setStandorte] = useState<Standort[]>([]);
  const [regionen, setRegionen] = useState<{ region: string }[]>([]);
  const [filters, setFilters] = useState({
    region: "", status: "", typ: "", search: "", hatFilter: "", hatTigerloop: "", sortBy: "id",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`/api/standorte?${params}`).then((r) => r.json()).then((d) => {
      setStandorte(d.standorte || []);
      setRegionen(d.regionen || []);
    });
  }, [filters]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Standorte</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Alle Standorte verwalten und filtern</p>
      </div>

      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Suche nach ID, Firma, Strasse, Ort..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
            <option value="">Alle Regionen</option>
            {regionen.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
            <option value="">Alle Status</option>
            <option value="geplant">Geplant</option>
            <option value="angebot_gesendet">Angebot gesendet</option>
            <option value="angebot_akzeptiert">Angebot akzeptiert</option>
            <option value="angebot_abgelehnt">Abgelehnt</option>
          </select>

          <select value={filters.typ} onChange={(e) => setFilters({ ...filters, typ: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
            <option value="">Alle Typen</option>
            <option value="Boiler-Entkalkung">Boiler-Entkalkung</option>
            <option value="Tankreinigung">Tankreinigung</option>
            <option value="Filterwechsel">Filterwechsel</option>
          </select>

          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={filters.hatFilter === "1"}
              onChange={(e) => setFilters({ ...filters, hatFilter: e.target.checked ? "1" : "" })}
              className="rounded" />
            <Droplets size={14} /> Filter
          </label>

          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={filters.hatTigerloop === "1"}
              onChange={(e) => setFilters({ ...filters, hatTigerloop: e.target.checked ? "1" : "" })}
              className="rounded" />
            <Wrench size={14} /> Tigerloop
          </label>

          <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]">
            <option value="id">Sortierung: ID</option>
            <option value="region">Sortierung: Region</option>
            <option value="ort">Sortierung: Ort</option>
            <option value="auftraege">Sortierung: Offene Aufträge</option>
            <option value="faellig">Sortierung: Fälligkeit</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-[var(--color-text-muted)] mb-3">{standorte.length} Standorte gefunden</div>

      <div className="space-y-3">
        {standorte.map((s) => {
          const auftraegeInfos = s.auftraege_info ? s.auftraege_info.split(",").map((x) => {
            const [typ, status] = x.split(":");
            return { typ, status };
          }) : [];

          return (
            <Link key={s.id} href={`/standorte/${s.id}`}
              className="block bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm bg-[var(--color-primary)] text-white px-2 py-0.5 rounded">{s.id}</span>
                    <span className="font-semibold">{s.firma}</span>
                    {s.kalk_region === "Hoch" && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Hoher Kalkgehalt</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] mb-2">
                    <MapPin size={14} />
                    {s.strasse}, {s.plz} {s.ort} — <span className="font-medium">{s.region}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {auftraegeInfos.map((a, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status] || "bg-gray-100"}`}>
                        {a.typ}: {statusLabels[a.status] || a.status}
                      </span>
                    ))}
                    {s.filter_count > 0 && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Droplets size={12} /> {s.filter_count} Filter
                      </span>
                    )}
                    {s.tigerloop_count > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Wrench size={12} /> Tigerloop
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.offene_auftraege > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      {s.offene_auftraege} offen
                    </span>
                  )}
                  <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
