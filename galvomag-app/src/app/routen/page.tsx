"use client";

import { useEffect, useState } from "react";
import { Navigation, MapPin, ExternalLink, Route } from "lucide-react";

interface Auftrag {
  id: number; standort_id: string; typ: string; status: string;
  faellig_am: string; angebots_betrag: number;
  firma: string; strasse: string; plz: string; ort: string; region: string;
}

const statusColors: Record<string, string> = {
  geplant: "bg-gray-200 text-gray-700", angebot_gesendet: "bg-blue-100 text-blue-700",
  angebot_akzeptiert: "bg-green-100 text-green-700", angebot_abgelehnt: "bg-red-100 text-red-700",
};

const BASE = "Regensdorf 8105";

export default function RoutenPage() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "angebot_akzeptiert");
    if (selectedRegion) params.set("region", selectedRegion);
    fetch(`/api/auftraege?${params}`).then((r) => r.json()).then((d) => {
      setAuftraege(d.auftraege || []);
    });
  }, [selectedRegion]);

  const regionen = [...new Set(auftraege.map((a) => a.region))].sort();

  const uniqueStandorte = Array.from(
    new Map(auftraege.map((a) => [a.standort_id, a])).values()
  );

  const selected = uniqueStandorte.filter((s) => selectedIds.has(s.standort_id));

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(uniqueStandorte.map((s) => s.standort_id)));
  };

  const selectNone = () => setSelectedIds(new Set());

  const googleMapsRouteUrl = () => {
    if (selected.length === 0) return "#";
    const waypoints = selected.map((s) => encodeURIComponent(`${s.strasse}, ${s.plz} ${s.ort}`));
    const origin = encodeURIComponent(BASE);
    const destination = encodeURIComponent(BASE);
    const waypointStr = waypoints.join("|");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypointStr}&travelmode=driving`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Routenplanung</h1>
        <p className="text-[var(--color-text-muted)] text-sm">
          Route optimieren für akzeptierte Aufträge — Startpunkt: {BASE}
        </p>
      </div>

      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedIds(new Set()); }}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Regionen</option>
            {regionen.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <button onClick={selectAll} className="text-sm text-[var(--color-primary-light)] hover:underline">Alle auswählen</button>
          <button onClick={selectNone} className="text-sm text-[var(--color-text-muted)] hover:underline">Keine auswählen</button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">{selected.length} Standorte ausgewählt</span>
            <a
              href={googleMapsRouteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected.length > 0
                  ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={(e) => { if (selected.length === 0) e.preventDefault(); }}
            >
              <Route size={16} /> Route in Google Maps öffnen
            </a>
          </div>
        </div>
      </div>

      {/* Selected Route Summary */}
      {selected.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <Navigation size={18} /> Geplante Route ({selected.length} Stopps)
          </h3>
          <div className="flex items-center gap-2 text-sm text-green-700 flex-wrap">
            <span className="bg-green-200 px-2 py-0.5 rounded font-medium">{BASE}</span>
            {selected.map((s) => (
              <span key={s.standort_id} className="flex items-center gap-1">
                <span>→</span>
                <span className="bg-white border border-green-300 px-2 py-0.5 rounded">{s.plz} {s.ort}</span>
              </span>
            ))}
            <span>→</span>
            <span className="bg-green-200 px-2 py-0.5 rounded font-medium">{BASE}</span>
          </div>
        </div>
      )}

      {/* Standorte List */}
      <div className="space-y-3">
        {uniqueStandorte.map((s) => {
          const isSelected = selectedIds.has(s.standort_id);
          const standortAuftraege = auftraege.filter((a) => a.standort_id === s.standort_id);
          const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(BASE)}/${encodeURIComponent(`${s.strasse}, ${s.plz} ${s.ort}`)}`;

          return (
            <div
              key={s.standort_id}
              className={`bg-[var(--color-card)] rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                isSelected ? "border-green-400 bg-green-50/50" : "border-[var(--color-border)] hover:border-gray-300"
              }`}
              onClick={() => toggleSelection(s.standort_id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={isSelected} readOnly
                    className="mt-1 w-5 h-5 rounded accent-green-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded">{s.standort_id}</span>
                      <span className="font-semibold">{s.firma}</span>
                      <span className="text-xs bg-[var(--color-accent)]/20 text-[var(--color-accent-dark)] px-2 py-0.5 rounded">{s.region}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                      <MapPin size={14} /> {s.strasse}, {s.plz} {s.ort}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {standortAuftraege.map((a) => (
                        <span key={a.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status] || "bg-gray-100"}`}>
                          {a.typ}{a.angebots_betrag ? ` (CHF ${a.angebots_betrag.toLocaleString("de-CH")})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-[var(--color-primary-light)] hover:underline shrink-0">
                  <ExternalLink size={14} /> Einzelroute
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {uniqueStandorte.length === 0 && (
        <div className="bg-[var(--color-card)] rounded-lg p-8 text-center text-[var(--color-text-muted)]">
          Keine akzeptierten Aufträge vorhanden. Nur Aufträge mit Status "Akzeptiert" werden für die Routenplanung angezeigt.
        </div>
      )}
    </div>
  );
}
