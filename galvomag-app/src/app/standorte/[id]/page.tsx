"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Mail, Key, Droplets, Wrench, Flame, Fuel,
  User, Navigation,
  AlertTriangle, CheckCircle, Clock
} from "lucide-react";

interface Standort {
  id: string; firma: string; strasse: string; plz: string; ort: string;
  region: string; kanton: string; latitude: number; longitude: number;
  zugang_schluessel: string; kalk_region: string; notizen: string; ist_restaurant: number;
}
interface Kontakt { id: number; typ: string; name: string; telefon: string; email: string; notizen: string; }
interface Anlage {
  id: number; typ: string; modell: string; hersteller: string; baujahr: number;
  kapazitaet: string; hat_tigerloop: number; filter_modell: string; notizen: string;
}
interface Auftrag {
  id: number; typ: string; status: string; faellig_am: string; intervall_jahre: number;
  angebots_datum: string; angebots_betrag: number; erledigt_am: string;
  techniker: string; kosten: number; notizen: string;
}
interface HistorieEintrag {
  id: number; datum: string; typ: string; beschreibung: string;
  techniker: string; kosten: number; notizen: string;
}
interface ServiceStatus {
  typ: string; letztes_datum: string; letzter_techniker: string;
  intervall_jahre: number; naechste_faelligkeit: string;
}

const statusLabels: Record<string, string> = {
  geplant: "Geplant", angebot_gesendet: "Ang. gesendet",
  angebot_akzeptiert: "Akzeptiert", angebot_abgelehnt: "Abgelehnt",
  in_bearbeitung: "In Bearb.", erledigt: "Erledigt",
};
const statusColors: Record<string, string> = {
  geplant: "bg-gray-200 text-gray-700", angebot_gesendet: "bg-blue-100 text-blue-700",
  angebot_akzeptiert: "bg-green-100 text-green-700", angebot_abgelehnt: "bg-red-100 text-red-700",
  in_bearbeitung: "bg-yellow-100 text-yellow-700", erledigt: "bg-emerald-100 text-emerald-700",
};
const anlageIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Öltank: Fuel, Boiler: Flame, Wasserfilter: Droplets, Ölfilter: Wrench, Heizung: Flame,
};

export default function StandortDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<{
    standort: Standort; kontakte: Kontakt[]; anlagen: Anlage[];
    auftraege: Auftrag[]; historie: HistorieEintrag[]; serviceStatus: ServiceStatus[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"status" | "anlagen" | "auftraege" | "historie">("status");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetch(`/api/standorte/${id}`).then((r) => r.json()).then(setData);
  }, [id]);

  if (!data) return <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">Laden...</div>;

  const { standort: s, kontakte, anlagen, auftraege, historie, serviceStatus } = data;
  const mapsUrl = `https://www.google.com/maps/dir/Regensdorf+8105/${encodeURIComponent(`${s.strasse},+${s.plz}+${s.ort}`)}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${s.longitude - 0.01},${s.latitude - 0.007},${s.longitude + 0.01},${s.latitude + 0.007}&layer=mapnik&marker=${s.latitude},${s.longitude}`;

  const isOverdue = (dateStr: string) => new Date(dateStr) <= new Date();
  const isSoon = (dateStr: string) => { const d = new Date(dateStr); return d > new Date() && d <= new Date(Date.now() + 180 * 86400000); };

  return (
    <div>
      <Link href="/standorte" className="inline-flex items-center gap-1 text-sm text-[var(--color-primary-light)] hover:underline mb-3">
        <ArrowLeft size={16} /> Zurück
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-sm bg-[var(--color-primary)] text-white px-2 py-0.5 rounded">{s.id}</span>
              <h1 className="text-lg font-bold">{s.firma}</h1>
              {s.kalk_region === "Hoch" && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full">Kalk hoch</span>}
              {s.ist_restaurant === 1 && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full">Restaurant</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <MapPin size={12} /> {s.strasse}, {s.plz} {s.ort} • {s.region}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1">
              <span className="flex items-center gap-0.5"><Key size={11} /> {s.zugang_schluessel}</span>
              <span className="flex items-center gap-0.5"><Droplets size={11} /> Kalk: {s.kalk_region}</span>
            </div>
            {s.notizen && <p className="text-xs mt-2 bg-yellow-50 p-2 rounded text-yellow-800">{s.notizen}</p>}
          </div>
          <div className="flex gap-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white px-3 py-2 rounded-lg text-xs hover:bg-[var(--color-primary-light)] flex-1 md:flex-none justify-center">
              <Navigation size={14} /> Route
            </a>
            <button onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1.5 border border-[var(--color-border)] px-3 py-2 rounded-lg text-xs hover:bg-gray-50 flex-1 md:flex-none justify-center">
              <MapPin size={14} /> Karte
            </button>
          </div>
        </div>
      </div>

      {/* Map (toggle) */}
      {showMap && (
        <div className="bg-white rounded-lg border border-[var(--color-border)] mb-4 overflow-hidden">
          <div className="h-[200px] md:h-[280px]">
            <iframe src={embedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
          </div>
        </div>
      )}

      {/* Kontakte */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-3 mb-4">
        <h2 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><User size={16} /> Kontakte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {kontakte.map((k) => (
            <div key={k.id} className="border border-[var(--color-border)] rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-medium bg-gray-100 px-1.5 py-0.5 rounded">{k.typ}</span>
              </div>
              <div className="font-medium text-sm">{k.name}</div>
              {k.telefon && <a href={`tel:${k.telefon}`} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><Phone size={11} /> {k.telefon}</a>}
              {k.email && <a href={`mailto:${k.email}`} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><Mail size={11} /> {k.email}</a>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-3 bg-white rounded-lg p-0.5 border border-[var(--color-border)] overflow-x-auto">
        {(["status", "anlagen", "auftraege", "historie"] as const).map((tab) => {
          const labels = { status: "Service-Status", anlagen: "Anlagen", auftraege: "Aufträge", historie: "Historie" };
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex-1 text-center ${
                activeTab === tab ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:bg-gray-100"
              }`}>
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* SERVICE STATUS TAB - THE KEY FEATURE */}
      {activeTab === "status" && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-[var(--color-text-muted)]">Wann wurde was zuletzt gemacht?</h3>
          {serviceStatus && serviceStatus.length > 0 ? serviceStatus.map((ss, i) => {
            const overdue = isOverdue(ss.naechste_faelligkeit);
            const soon = isSoon(ss.naechste_faelligkeit);
            return (
              <div key={i} className={`rounded-lg border-2 p-3 ${
                overdue ? "border-red-300 bg-red-50" : soon ? "border-yellow-300 bg-yellow-50" : "border-green-300 bg-green-50"
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {overdue && <AlertTriangle size={16} className="text-red-600" />}
                      {soon && !overdue && <Clock size={16} className="text-yellow-600" />}
                      {!overdue && !soon && <CheckCircle size={16} className="text-green-600" />}
                      <span className="font-semibold text-sm">{ss.typ}</span>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      Zuletzt: <span className="font-medium">{new Date(ss.letztes_datum).toLocaleDateString("de-CH")}</span>
                      {ss.letzter_techniker && <span> (von {ss.letzter_techniker})</span>}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">Intervall: alle {ss.intervall_jahre} Jahre</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${overdue ? "text-red-700" : soon ? "text-yellow-700" : "text-green-700"}`}>
                      {overdue ? "ÜBERFÄLLIG" : soon ? "Bald fällig" : "OK"}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      Nächstes Mal: {new Date(ss.naechste_faelligkeit).toLocaleDateString("de-CH")}
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white rounded-lg p-4 text-center text-[var(--color-text-muted)] text-sm">
              Keine Service-Historie vorhanden
            </div>
          )}
        </div>
      )}

      {/* ANLAGEN TAB */}
      {activeTab === "anlagen" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anlagen.map((a) => {
            const Icon = anlageIcons[a.typ] || Wrench;
            return (
              <div key={a.id} className="bg-white rounded-lg border border-[var(--color-border)] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-[var(--color-primary)]" />
                  <span className="font-semibold text-sm">{a.typ}</span>
                  {a.hat_tigerloop === 1 && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full">Tigerloop</span>}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {a.modell && <div><span className="text-[var(--color-text-muted)]">Modell:</span> {a.modell}</div>}
                  {a.hersteller && <div><span className="text-[var(--color-text-muted)]">Hersteller:</span> {a.hersteller}</div>}
                  {a.baujahr > 0 && <div><span className="text-[var(--color-text-muted)]">Baujahr:</span> {a.baujahr}</div>}
                  {a.kapazitaet && <div><span className="text-[var(--color-text-muted)]">Kapazität:</span> {a.kapazitaet}</div>}
                  {a.filter_modell && <div><span className="text-[var(--color-text-muted)]">Filter:</span> {a.filter_modell}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AUFTRÄGE TAB */}
      {activeTab === "auftraege" && (
        <div className="space-y-2">
          {auftraege.map((a) => (
            <div key={a.id} className="bg-white rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{a.typ}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status]}`}>{statusLabels[a.status]}</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    Fällig: {a.faellig_am ? new Date(a.faellig_am).toLocaleDateString("de-CH") : "-"}
                    {a.intervall_jahre && ` • Alle ${a.intervall_jahre} Jahre`}
                  </div>
                  {a.notizen && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{a.notizen}</div>}
                </div>
                <div className="text-right text-xs">
                  {a.angebots_betrag > 0 && <div className="font-bold">CHF {a.angebots_betrag.toLocaleString("de-CH")}</div>}
                  {a.erledigt_am && <div className="text-green-600">Erledigt: {new Date(a.erledigt_am).toLocaleDateString("de-CH")}</div>}
                  {a.techniker && <div className="text-[var(--color-text-muted)]">von {a.techniker}</div>}
                </div>
              </div>
            </div>
          ))}
          {auftraege.length === 0 && <div className="bg-white rounded-lg p-4 text-center text-[var(--color-text-muted)]">Keine Aufträge</div>}
        </div>
      )}

      {/* HISTORIE TAB */}
      {activeTab === "historie" && (
        <div className="space-y-2">
          {historie.map((h) => (
            <div key={h.id} className="bg-white rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded">{new Date(h.datum).toLocaleDateString("de-CH")}</span>
                  <span className="font-medium text-sm">{h.typ}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {h.techniker && <span className="text-[var(--color-text-muted)]">{h.techniker}</span>}
                  {h.kosten > 0 && <span className="font-medium text-green-600">CHF {h.kosten.toLocaleString("de-CH")}</span>}
                </div>
              </div>
              <p className="text-xs">{h.beschreibung}</p>
              {h.notizen && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 italic">{h.notizen}</p>}
            </div>
          ))}
          {historie.length === 0 && <div className="bg-white rounded-lg p-4 text-center text-[var(--color-text-muted)]">Keine Historie</div>}
        </div>
      )}
    </div>
  );
}
