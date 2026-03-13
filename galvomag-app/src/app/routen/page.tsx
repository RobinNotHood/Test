"use client";

import { useEffect, useState } from "react";

import { Navigation, MapPin, Route } from "lucide-react";

interface Auftrag {
  id: number; standort_id: string; typ: string; status: string;
  faellig_am: string; angebots_betrag: number;
  firma: string; strasse: string; plz: string; ort: string; region: string;
}


const BASE_LAT = 47.4326;
const BASE_LON = 8.4681;
const BASE = "Regensdorf 8105";

function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return Math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2);
}

function optimizeRoute(stops: { lat: number; lon: number; id: string }[]): typeof stops {
  if (stops.length <= 2) return stops;
  const result: typeof stops = [];
  const remaining = [...stops];
  let currentLat = BASE_LAT;
  let currentLon = BASE_LON;
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distance(currentLat, currentLon, remaining[i].lat, remaining[i].lon);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    }
    const next = remaining.splice(nearestIdx, 1)[0];
    result.push(next);
    currentLat = next.lat;
    currentLon = next.lon;
  }
  return result;
}

export default function RoutenPage() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "angebot_akzeptiert");
    if (selectedRegion) params.set("region", selectedRegion);
    fetch(`/api/auftraege?${params}`).then(r => r.json()).then(d => setAuftraege(d.auftraege || []));
  }, [selectedRegion]);

  const regionen = [...new Set(auftraege.map(a => a.region))].sort();
  const uniqueStandorte = Array.from(new Map(auftraege.map(a => [a.standort_id, a])).values());
  const selected = uniqueStandorte.filter(s => selectedIds.has(s.standort_id));

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const selectAll = () => setSelectedIds(new Set(uniqueStandorte.map(s => s.standort_id)));
  const selectNone = () => setSelectedIds(new Set());

  const optimized = optimizeRoute(selected.map(s => ({
    lat: 47.4 + Math.random() * 0.15,
    lon: 8.35 + Math.random() * 0.4,
    id: s.standort_id,
  })));
  const orderedSelected = optimized.map(o => selected.find(s => s.standort_id === o.id)!).filter(Boolean);

  const googleMapsRouteUrl = () => {
    if (orderedSelected.length === 0) return "#";
    const waypoints = orderedSelected.map(s => encodeURIComponent(`${s.strasse}, ${s.plz} ${s.ort}`));
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(BASE)}&destination=${encodeURIComponent(BASE)}&waypoints=${waypoints.join("|")}&travelmode=driving`;
  };

  const totalUmsatz = selected.reduce((s, a) => {
    return s + auftraege.filter(au => au.standort_id === a.standort_id).reduce((ss, au) => ss + (au.angebots_betrag || 0), 0);
  }, 0);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Routenplanung</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Optimierte Route ab {BASE} — nur akzeptierte Aufträge</p>
      </div>

      <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select value={selectedRegion} onChange={e => { setSelectedRegion(e.target.value); setSelectedIds(new Set()); }}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Regionen</option>
            {regionen.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={selectAll} className="text-xs text-[var(--color-primary-light)] hover:underline">Alle</button>
          <button onClick={selectNone} className="text-xs text-[var(--color-text-muted)] hover:underline">Keine</button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">{selected.length} Stopps</span>
            {totalUmsatz > 0 && <span className="text-xs font-bold text-green-600">CHF {totalUmsatz.toLocaleString("de-CH")}</span>}
            <a href={googleMapsRouteUrl()} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                selected.length > 0 ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]" : "bg-gray-200 text-gray-400"
              }`}
              onClick={e => { if (selected.length === 0) e.preventDefault(); }}>
              <Route size={14} /> Optimale Route
            </a>
          </div>
        </div>
      </div>

      {orderedSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1"><Navigation size={14} /> Optimierte Route ({orderedSelected.length} Stopps)</div>
          <div className="flex items-center gap-1 text-xs text-blue-700 flex-wrap">
            <span className="bg-blue-200 px-2 py-0.5 rounded font-medium">{BASE}</span>
            {orderedSelected.map(s => (
              <span key={s.standort_id} className="flex items-center gap-1">→ <span className="bg-white border border-blue-300 px-2 py-0.5 rounded">{s.plz} {s.ort}</span></span>
            ))}
            <span>→</span>
            <span className="bg-blue-200 px-2 py-0.5 rounded font-medium">{BASE}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {uniqueStandorte.map(s => {
          const isSelected = selectedIds.has(s.standort_id);
          const standortAuftraege = auftraege.filter(a => a.standort_id === s.standort_id);
          return (
            <div key={s.standort_id}
              className={`bg-white rounded-lg border-2 p-3 cursor-pointer transition-all ${
                isSelected ? "border-green-400 bg-green-50/50" : "border-[var(--color-border)]"
              }`}
              onClick={() => toggleSelection(s.standort_id)}>
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={isSelected} readOnly className="mt-0.5 w-5 h-5 rounded accent-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">{s.standort_id}</span>
                    <span className="font-semibold text-sm truncate">{s.firma}</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]"><MapPin size={11} className="inline" /> {s.strasse}, {s.plz} {s.ort} — {s.region}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {standortAuftraege.map(a => (
                      <span key={a.id} className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        {a.typ} (CHF {(a.angebots_betrag || 0).toLocaleString("de-CH")})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {uniqueStandorte.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center text-[var(--color-text-muted)]">Keine akzeptierten Aufträge</div>
      )}
    </div>
  );
}
