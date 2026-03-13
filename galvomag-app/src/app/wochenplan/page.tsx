"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, DollarSign, Calendar, Route, ExternalLink } from "lucide-react";

interface PlanEntry {
  id: number; standort_id: string; mitarbeiter: string; datum: string;
  reihenfolge: number; notizen: string;
  firma: string; strasse: string; plz: string; ort: string; region: string;
  latitude: number; longitude: number;
  geplante_arbeiten: string | null; tages_umsatz: number | null;
}

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const WOCHENTAGE_KURZ = ["Mo", "Di", "Mi", "Do", "Fr"];

export default function WochenplanPage() {
  const [plan, setPlan] = useState<Record<string, PlanEntry[]>>({});
  const [dates, setDates] = useState<string[]>([]);
  const [wochenTotal, setWochenTotal] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wochenplan?mitarbeiter=Daniel+Zahner&woche=2026-03-16")
      .then(r => r.json())
      .then(d => {
        setPlan(d.plan || {});
        setDates(d.dates || []);
        setWochenTotal(d.wochenTotal || 0);
        if (d.dates?.length > 0) setSelectedDay(d.dates[0]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">Laden...</div>;

  const todayEntries = plan[selectedDay] || [];
  const tagesTotal = todayEntries.reduce((s, e) => s + (e.tages_umsatz || 0), 0);

  const getGoogleMapsRoute = (entries: PlanEntry[]) => {
    if (entries.length === 0) return "#";
    const origin = encodeURIComponent("Regensdorf 8105");
    const destination = encodeURIComponent("Regensdorf 8105");
    const waypoints = entries.map(e => encodeURIComponent(`${e.strasse}, ${e.plz} ${e.ort}`)).join("|");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Wochenplan</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Daniel Zahner — KW 12 (16.–20. März 2026)</p>
      </div>

      {/* Wochen-Übersicht */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 md:p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <span className="text-sm font-medium">Wochen-Projektion:</span>
            <span className="text-lg font-bold text-green-600">CHF {wochenTotal.toLocaleString("de-CH")}</span>
          </div>
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-5 gap-1 md:gap-2">
          {dates.map((date, i) => {
            const dayEntries = plan[date] || [];
            const dayTotal = dayEntries.reduce((s, e) => s + (e.tages_umsatz || 0), 0);
            const isActive = selectedDay === date;
            return (
              <button key={date} onClick={() => setSelectedDay(date)}
                className={`p-2 md:p-3 rounded-lg text-center transition-all ${
                  isActive ? "bg-[var(--color-primary)] text-white shadow-md" : "bg-gray-50 hover:bg-gray-100"
                }`}>
                <div className="text-xs font-bold">{WOCHENTAGE_KURZ[i]}</div>
                <div className="text-[10px] md:text-xs mt-0.5">{new Date(date).toLocaleDateString("de-CH", { day: "numeric", month: "numeric" })}</div>
                <div className={`text-xs font-bold mt-1 ${isActive ? "text-white" : "text-green-600"}`}>
                  {dayEntries.length} Stopps
                </div>
                {dayTotal > 0 && (
                  <div className={`text-[10px] mt-0.5 ${isActive ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                    CHF {dayTotal.toLocaleString("de-CH")}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tagesplan Detail */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Calendar size={18} />
          {WOCHENTAGE[dates.indexOf(selectedDay)]} — {new Date(selectedDay).toLocaleDateString("de-CH")}
        </h2>
        <div className="flex items-center gap-2">
          {tagesTotal > 0 && (
            <span className="text-sm font-bold text-green-600">CHF {tagesTotal.toLocaleString("de-CH")}</span>
          )}
          <a href={getGoogleMapsRoute(todayEntries)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--color-primary-light)]">
            <Route size={14} /> Route öffnen
          </a>
        </div>
      </div>

      {/* Route-Vorschau */}
      {todayEntries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-blue-700 flex-wrap">
            <span className="bg-blue-200 px-2 py-0.5 rounded font-medium">Regensdorf</span>
            {todayEntries.map((e, i) => (
              <span key={i} className="flex items-center gap-1">
                <span>→</span>
                <span className="bg-white border border-blue-300 px-2 py-0.5 rounded">{e.plz} {e.ort}</span>
              </span>
            ))}
            <span>→</span>
            <span className="bg-blue-200 px-2 py-0.5 rounded font-medium">Regensdorf</span>
          </div>
        </div>
      )}

      {/* Einträge */}
      <div className="space-y-2">
        {todayEntries.map((entry, i) => (
          <div key={entry.id} className="bg-white rounded-lg border border-[var(--color-border)] p-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link href={`/standorte/${entry.standort_id}`}
                    className="font-mono text-xs bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded hover:bg-[var(--color-primary-light)]">
                    {entry.standort_id}
                  </Link>
                  <span className="font-semibold text-sm truncate">{entry.firma}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-1.5">
                  <MapPin size={12} /> {entry.strasse}, {entry.plz} {entry.ort}
                </div>
                {entry.geplante_arbeiten && (
                  <div className="flex flex-wrap gap-1">
                    {entry.geplante_arbeiten.split(", ").map((a, j) => (
                      <span key={j} className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                )}
                {entry.notizen && <div className="text-[10px] text-[var(--color-text-muted)] mt-1 italic">{entry.notizen}</div>}
              </div>
              <div className="text-right shrink-0">
                {entry.tages_umsatz && entry.tages_umsatz > 0 ? (
                  <div className="text-sm font-bold text-green-600">CHF {entry.tages_umsatz.toLocaleString("de-CH")}</div>
                ) : (
                  <div className="text-xs text-[var(--color-text-muted)]">—</div>
                )}
                <a href={`https://www.google.com/maps/dir/Regensdorf+8105/${encodeURIComponent(`${entry.strasse}, ${entry.plz} ${entry.ort}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-[var(--color-primary-light)] hover:underline flex items-center gap-0.5 justify-end mt-1">
                  <ExternalLink size={10} /> Navigation
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {todayEntries.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center text-[var(--color-text-muted)]">Keine Einträge für diesen Tag</div>
      )}
    </div>
  );
}
