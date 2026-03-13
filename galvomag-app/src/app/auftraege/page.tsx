"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`/api/auftraege?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setAuftraege(d.auftraege || []);
        const regs = [...new Set((d.auftraege || []).map((a: Auftrag) => a.region))].sort() as string[];
        if (regs.length > 0 && regionen.length === 0) setRegionen(regs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters]);

  const akzeptiertTotal = auftraege
    .filter((a) => a.angebots_betrag && a.status === "angebot_akzeptiert")
    .reduce((sum, a) => sum + (a.angebots_betrag || 0), 0);

  const byStatus = {
    geplant: auftraege.filter(a => a.status === "geplant").length,
    gesendet: auftraege.filter(a => a.status === "angebot_gesendet").length,
    akzeptiert: auftraege.filter(a => a.status === "angebot_akzeptiert").length,
    abgelehnt: auftraege.filter(a => a.status === "angebot_abgelehnt").length,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">Laden...</div>;

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Aufträge &amp; Angebote</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Alle Aufträge verwalten und nachverfolgen</p>
      </div>

      {/* Status-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 md:mb-6">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 flex items-center gap-3">
          <Clock size={18} className="text-gray-500 shrink-0" />
          <div><div className="text-lg font-bold">{byStatus.geplant}</div><div className="text-[10px] text-[var(--color-text-muted)]">Geplant</div></div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-blue-500 shrink-0" />
          <div><div className="text-lg font-bold">{byStatus.gesendet}</div><div className="text-[10px] text-[var(--color-text-muted)]">Ang. gesendet</div></div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 flex items-center gap-3">
          <CheckCircle size={18} className="text-green-500 shrink-0" />
          <div><div className="text-lg font-bold">{byStatus.akzeptiert}</div><div className="text-[10px] text-[var(--color-text-muted)]">Akzeptiert</div></div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 flex items-center gap-3">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <div><div className="text-lg font-bold">{byStatus.abgelehnt}</div><div className="text-[10px] text-[var(--color-text-muted)]">Abgelehnt</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Regionen</option>
            {regionen.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Status</option>
            <option value="geplant">Geplant</option>
            <option value="angebot_gesendet">Ang. gesendet</option>
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
            <option value="Tank-Sichtkontrolle">Tank-Sichtkontrolle</option>
          </select>
          {akzeptiertTotal > 0 && (
            <span className="ml-auto text-sm font-medium text-green-600">
              Akzeptiert: CHF {akzeptiertTotal.toLocaleString("de-CH")}
            </span>
          )}
        </div>
      </div>

      {/* Aufträge als Karten (mobile-freundlich) */}
      <div className="space-y-2">
        {auftraege.map((a) => (
          <Link key={a.id} href={`/standorte/${a.standort_id}`}
            className="block bg-white rounded-lg border border-[var(--color-border)] p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="font-mono text-xs bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">{a.standort_id}</span>
                  <span className="font-semibold text-sm truncate">{a.firma}</span>
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mb-1.5">{a.plz} {a.ort} — {a.region}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{a.typ}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status]}`}>
                    {statusLabels[a.status]}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {a.angebots_betrag > 0 && (
                  <div className="text-sm font-bold">CHF {a.angebots_betrag.toLocaleString("de-CH")}</div>
                )}
                {a.faellig_am && (
                  <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5 justify-end">
                    <Calendar size={10} /> {new Date(a.faellig_am).toLocaleDateString("de-CH")}
                  </div>
                )}
                {a.notizen && <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 max-w-[120px] truncate">{a.notizen}</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {auftraege.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center text-[var(--color-text-muted)]">Keine Aufträge gefunden</div>
      )}
    </div>
  );
}
