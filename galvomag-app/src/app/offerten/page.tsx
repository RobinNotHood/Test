"use client";

import { useEffect, useState } from "react";
import { Mail, ChevronDown, ChevronUp } from "lucide-react";

interface FaelligItem {
  id: string; firma: string; strasse: string; plz: string; ort: string; region: string;
  service_typ: string; letztes_datum: string; letzte_kosten: number; intervall: number;
  faellig_am: string; verwaltung: string; verwaltung_email: string; hausabwart: string;
  durchschnitt_kosten: number; hat_offenen_auftrag: number; ist_restaurant: number;
}

interface PreisHistorie {
  region: string; typ: string; durchschnitt: number; minimum: number; maximum: number; anzahl: number;
}

const PREIS_KLASSEN: Record<string, { min: number; standard: number; max: number }> = {
  "Boiler-Entkalkung-Klein": { min: 550, standard: 700, max: 900 },
  "Boiler-Entkalkung-Mittel": { min: 800, standard: 1000, max: 1300 },
  "Boiler-Entkalkung-Gross": { min: 1200, standard: 1600, max: 2200 },
  "Tankreinigung-Klein": { min: 900, standard: 1200, max: 1600 },
  "Tankreinigung-Mittel": { min: 1500, standard: 2000, max: 2800 },
  "Tankreinigung-Gross": { min: 2500, standard: 3500, max: 5000 },
  "Tank-Sichtkontrolle": { min: 300, standard: 450, max: 650 },
  "Filterwechsel-Wasser": { min: 200, standard: 320, max: 450 },
  "Filterwechsel-Oel": { min: 180, standard: 280, max: 400 },
  "Filterwechsel-Tigerloop": { min: 350, standard: 480, max: 650 },
};

export default function OffertenPage() {
  const [faellig, setFaellig] = useState<FaelligItem[]>([]);
  const [, setPreisHistorie] = useState<PreisHistorie[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preisKlasse, setPreisKlasse] = useState<"min" | "standard" | "max">("standard");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterTyp, setFilterTyp] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faellig").then(r => r.json()).then(d => {
      setFaellig(d.faellig || []);
      setPreisHistorie(d.preisHistorie || []);
      setLoading(false);
    });
  }, []);

  const regionen = [...new Set(faellig.map(f => f.region))].sort();
  const typen = [...new Set(faellig.map(f => f.service_typ))].sort();

  const filtered = faellig.filter(f => {
    if (filterRegion && f.region !== filterRegion) return false;
    if (filterTyp && f.service_typ !== filterTyp) return false;
    return true;
  });

  const toggleSelect = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map(f => `${f.id}:${f.service_typ}`)));
  const selectNone = () => setSelected(new Set());

  const getPreis = (item: FaelligItem): number => {
    if (item.durchschnitt_kosten > 0) {
      const factor = preisKlasse === "min" ? 0.85 : preisKlasse === "max" ? 1.15 : 1;
      return Math.round(item.durchschnitt_kosten * factor / 10) * 10;
    }
    let key = item.service_typ;
    if (key === "Boiler-Entkalkung") key += "-Mittel";
    else if (key === "Tankreinigung") key += "-Mittel";
    else if (key === "Filterwechsel") key = "Filterwechsel-Wasser";
    const pk = PREIS_KLASSEN[key];
    return pk ? pk[preisKlasse] : 500;
  };

  const selectedItems = filtered.filter(f => selected.has(`${f.id}:${f.service_typ}`));
  const totalBetrag = selectedItems.reduce((s, f) => s + getPreis(f), 0);

  const isFaellig = (dateStr: string) => new Date(dateStr) <= new Date();
  const isBaldFaellig = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const sixMonths = new Date(now.getTime() + 180 * 86400000);
    return d > now && d <= sixMonths;
  };

  const openMailClient = (item: FaelligItem) => {
    const preis = getPreis(item);
    const email = item.verwaltung_email || "";
    const subject = encodeURIComponent(`Offerte ${item.service_typ} — ${item.firma}, ${item.ort}`);
    const body = encodeURIComponent(
      `Sehr geehrte Damen und Herren\n\n` +
      `Gerne unterbreiten wir Ihnen folgende Offerte für die Liegenschaft:\n\n` +
      `Standort: ${item.firma}\n` +
      `Adresse: ${item.strasse}, ${item.plz} ${item.ort}\n\n` +
      `Leistung: ${item.service_typ}\n` +
      `Offertbetrag: CHF ${preis.toLocaleString("de-CH")}.-\n\n` +
      `Letzte Durchführung: ${new Date(item.letztes_datum).toLocaleDateString("de-CH")}\n` +
      `Fällig seit/am: ${new Date(item.faellig_am).toLocaleDateString("de-CH")}\n\n` +
      `Gerne führen wir die Arbeiten nach Vereinbarung durch.\n\n` +
      `Freundliche Grüsse\nGalvomag AG\nDaniel Zahner\n` +
      `Tel: 044 840 xx xx\nwww.galvomag.ch`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  const openMassMailClient = () => {
    const byVerwaltung: Record<string, FaelligItem[]> = {};
    selectedItems.forEach(item => {
      const key = item.verwaltung_email || item.verwaltung || "unbekannt";
      if (!byVerwaltung[key]) byVerwaltung[key] = [];
      byVerwaltung[key].push(item);
    });
    const firstGroup = Object.entries(byVerwaltung)[0];
    if (!firstGroup) return;
    const [email, items] = firstGroup;
    const subject = encodeURIComponent(`Offerten Galvomag AG — ${items.length} fällige Services`);
    const lines = items.map(i =>
      `• ${i.firma}, ${i.ort}: ${i.service_typ} — CHF ${getPreis(i).toLocaleString("de-CH")}.-`
    ).join("\n");
    const body = encodeURIComponent(
      `Sehr geehrte Damen und Herren\n\nGerne unterbreiten wir Ihnen folgende Offerten:\n\n${lines}\n\n` +
      `Total: CHF ${totalBetrag.toLocaleString("de-CH")}.-\n\n` +
      `Freundliche Grüsse\nGalvomag AG\nDaniel Zahner`
    );
    window.open(`mailto:${email.includes("@") ? email : ""}?subject=${subject}&body=${body}`, "_blank");
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">Laden...</div>;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Offerten-Planer</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Fällige Services erkennen, Offerten erstellen, per E-Mail versenden</p>
      </div>

      {/* Filters + Controls */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Regionen</option>
            {regionen.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterTyp} onChange={e => setFilterTyp(e.target.value)}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Alle Typen</option>
            {typen.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={preisKlasse} onChange={e => setPreisKlasse(e.target.value as any)}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white">
            <option value="min">Preis: Günstig</option>
            <option value="standard">Preis: Standard</option>
            <option value="max">Preis: Premium</option>
          </select>
          <button onClick={selectAll} className="text-xs text-[var(--color-primary-light)] hover:underline">Alle</button>
          <button onClick={selectNone} className="text-xs text-[var(--color-text-muted)] hover:underline">Keine</button>
        </div>
      </div>

      {/* Selection Summary */}
      {selected.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-green-800">{selected.size} ausgewählt</span>
            <span className="text-green-700 ml-2">Total: CHF {totalBetrag.toLocaleString("de-CH")}.-</span>
          </div>
          <button onClick={openMassMailClient}
            className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-primary-light)]">
            <Mail size={16} /> Sammel-Offerte per E-Mail
          </button>
        </div>
      )}

      <div className="text-sm text-[var(--color-text-muted)] mb-2">{filtered.length} fällige Services gefunden</div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const key = `${item.id}:${item.service_typ}`;
          const isSelected = selected.has(key);
          const isExpanded = expanded === key;
          const preis = getPreis(item);
          const overdue = isFaellig(item.faellig_am);
          const soon = isBaldFaellig(item.faellig_am);

          return (
            <div key={key}
              className={`bg-white rounded-lg border-2 p-3 transition-all ${
                isSelected ? "border-green-400" : "border-[var(--color-border)]"
              }`}>
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(key)}
                  className="mt-1 w-5 h-5 rounded accent-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-mono text-xs bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">{item.id}</span>
                    <span className="font-semibold text-sm truncate">{item.firma}</span>
                    {overdue && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">ÜBERFÄLLIG</span>}
                    {soon && !overdue && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full">Bald fällig</span>}
                    {item.hat_offenen_auftrag === 1 && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full">Auftrag offen</span>}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">{item.plz} {item.ort} — {item.region}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{item.service_typ}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Letztes Mal: {new Date(item.letztes_datum).toLocaleDateString("de-CH")}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      (alle {item.intervall} J.)
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">CHF {preis.toLocaleString("de-CH")}.-</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">Fällig: {new Date(item.faellig_am).toLocaleDateString("de-CH")}</div>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button onClick={() => openMailClient(item)}
                      className="p-1.5 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-light)]" title="E-Mail senden">
                      <Mail size={14} />
                    </button>
                    <button onClick={() => setExpanded(isExpanded ? null : key)}
                      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs space-y-1">
                  {item.verwaltung && <div><span className="text-[var(--color-text-muted)]">Verwaltung:</span> {item.verwaltung}</div>}
                  {item.verwaltung_email && <div><span className="text-[var(--color-text-muted)]">E-Mail:</span> {item.verwaltung_email}</div>}
                  {item.hausabwart && <div><span className="text-[var(--color-text-muted)]">Hausabwart:</span> {item.hausabwart}</div>}
                  <div><span className="text-[var(--color-text-muted)]">Durchschnitt Kosten:</span> CHF {Math.round(item.durchschnitt_kosten).toLocaleString("de-CH")}.-</div>
                  <div><span className="text-[var(--color-text-muted)]">Letzte Kosten:</span> CHF {Math.round(item.letzte_kosten).toLocaleString("de-CH")}.-</div>
                  <div className="mt-2 flex gap-2">
                    {Object.entries(PREIS_KLASSEN)
                      .filter(([k]) => k.startsWith(item.service_typ.split("-")[0]) || k === item.service_typ)
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded p-2 text-center flex-1">
                          <div className="text-[10px] text-[var(--color-text-muted)]">{k.split("-").slice(-1)[0]}</div>
                          <div className="font-medium">CHF {v.standard}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
