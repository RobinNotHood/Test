"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Auftrag {
  id: number; standort_id: string; typ: string; status: string;
  faellig_am: string; angebots_datum: string; angebots_betrag: number;
  erledigt_am: string; techniker: string; kosten: number; notizen: string;
  firma: string; strasse: string; plz: string; ort: string; region: string;
}

const statusLabels: Record<string, string> = {
  geplant: "Geplant", angebot_gesendet: "Angebot gesendet",
  angebot_akzeptiert: "Akzeptiert", angebot_abgelehnt: "Abgelehnt",
  in_bearbeitung: "In Bearbeitung", erledigt: "Erledigt",
};

const statusColors: Record<string, string> = {
  geplant: "bg-gray-200 text-gray-700", angebot_gesendet: "bg-blue-100 text-blue-700",
  angebot_akzeptiert: "bg-green-100 text-green-700", angebot_abgelehnt: "bg-red-100 text-red-700",
  in_bearbeitung: "bg-yellow-100 text-yellow-700", erledigt: "bg-emerald-100 text-emerald-700",
};

export default function AuftraegePage() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [filters, setFilters] = useState({ region: "", status: "", typ: "" });
  const [regionen, setRegionen] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`/api/auftraege?${params}`).then((r) => r.json()).then((d) => {
      setAuftraege(d.auftraege || []);
      const regs = [...new Set((d.auftraege || []).map((a: Auftrag) => a.region))].sort() as string[];
      if (regs.length > 0 && regionen.length === 0) setRegionen(regs);
    });
  }, [filters]);

  const grouped: Record<string, Auftrag[]> = {};
  auftraege.forEach((a) => {
    if (!grouped[a.region]) grouped[a.region] = [];
    grouped[a.region].push(a);
  });

  const totalBetrag = auftraege.filter((a) => a.angebots_betrag && a.status === "angebot_akzeptiert")
    .reduce((sum, a) => sum + (a.angebots_betrag || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Aufträge & Angebote</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Alle Aufträge verwalten, filtern und nachverfolgen</p>
      </div>

      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Regionen</option>
            {regionen.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Status</option>
            <option value="geplant">Geplant</option>
            <option value="angebot_gesendet">Angebot gesendet</option>
            <option value="angebot_akzeptiert">Akzeptiert</option>
            <option value="angebot_abgelehnt">Abgelehnt</option>
            <option value="erledigt">Erledigt</option>
          </select>

          <select value={filters.typ} onChange={(e) => setFilters({ ...filters, typ: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Typen</option>
            <option value="Boiler-Entkalkung">Boiler-Entkalkung</option>
            <option value="Tankreinigung">Tankreinigung</option>
            <option value="Filterwechsel">Filterwechsel</option>
          </select>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-4 text-sm mt-2 md:mt-0">
            <span className="text-[var(--color-text-muted)]">{auftraege.length} Aufträge</span>
            {totalBetrag > 0 && (
              <span className="font-medium text-green-600">
                Akzeptiert: CHF {totalBetrag.toLocaleString("de-CH")}
              </span>
            )}
          </div>
        </div>
      </div>

      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, items]) => (
        <div key={region} className="mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="bg-[var(--color-accent)] text-white px-2 py-0.5 rounded text-sm">{region}</span>
            <span className="text-sm text-[var(--color-text-muted)]">{items.length} Aufträge</span>
          </h2>
          <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Standort</th>
                  <th className="px-4 py-3 font-medium">Typ</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Fällig</th>
                  <th className="px-4 py-3 font-medium">Angebot</th>
                  <th className="px-4 py-3 font-medium">Betrag</th>
                  <th className="px-4 py-3 font-medium">Notizen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/standorte/${a.standort_id}`} className="text-[var(--color-primary-light)] font-medium hover:underline">
                        {a.standort_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.firma}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{a.plz} {a.ort}</div>
                    </td>
                    <td className="px-4 py-3">{a.typ}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || ""}`}>
                        {statusLabels[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{a.faellig_am ? new Date(a.faellig_am).toLocaleDateString("de-CH") : "-"}</td>
                    <td className="px-4 py-3">{a.angebots_datum ? new Date(a.angebots_datum).toLocaleDateString("de-CH") : "-"}</td>
                    <td className="px-4 py-3">{a.angebots_betrag ? `CHF ${a.angebots_betrag.toLocaleString("de-CH")}` : "-"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] max-w-[200px] truncate">{a.notizen || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
