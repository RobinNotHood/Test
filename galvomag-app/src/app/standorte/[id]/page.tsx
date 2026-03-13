"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Mail, Key, Droplets, Wrench, Flame, Fuel,
  User, Building2, ChevronDown, ChevronUp, ExternalLink, Navigation
} from "lucide-react";

interface Standort {
  id: string; firma: string; strasse: string; plz: string; ort: string;
  region: string; kanton: string; latitude: number; longitude: number;
  zugang_schluessel: string; kalk_region: string; notizen: string;
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

const statusLabels: Record<string, string> = {
  geplant: "Geplant", angebot_gesendet: "Angebot gesendet",
  angebot_akzeptiert: "Angebot akzeptiert", angebot_abgelehnt: "Abgelehnt",
  in_bearbeitung: "In Bearbeitung", erledigt: "Erledigt",
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
    auftraege: Auftrag[]; historie: HistorieEintrag[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "auftraege" | "historie">("info");
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    fetch(`/api/standorte/${id}`).then((r) => r.json()).then(setData);
  }, [id]);

  if (!data) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg text-[var(--color-text-muted)]">Laden...</div></div>;
  }

  const { standort: s, kontakte, anlagen, auftraege, historie } = data;

  const mapsUrl = `https://www.google.com/maps/dir/Regensdorf+8105/${encodeURIComponent(`${s.strasse},+${s.plz}+${s.ort}`)}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${s.longitude - 0.01},${s.latitude - 0.007},${s.longitude + 0.01},${s.latitude + 0.007}&layer=mapnik&marker=${s.latitude},${s.longitude}`;

  return (
    <div>
      <Link href="/standorte" className="inline-flex items-center gap-1 text-sm text-[var(--color-primary-light)] hover:underline mb-4">
        <ArrowLeft size={16} /> Zurück zur Übersicht
      </Link>

      {/* Header */}
      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm bg-[var(--color-primary)] text-white px-3 py-1 rounded">{s.id}</span>
              <h1 className="text-xl font-bold">{s.firma}</h1>
              {s.kalk_region === "Hoch" && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">Hoher Kalkgehalt</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[var(--color-text-muted)] mb-1">
              <MapPin size={16} />
              <span>{s.strasse}, {s.plz} {s.ort}</span>
              <span className="mx-1">•</span>
              <span className="font-medium">{s.region}, {s.kanton}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-sm">
              <Key size={14} />
              <span>Zugang: {s.zugang_schluessel}</span>
              <span className="mx-1">•</span>
              <Droplets size={14} />
              <span>Kalkgehalt: {s.kalk_region}</span>
            </div>
            {s.notizen && <p className="text-sm mt-2 bg-yellow-50 p-2 rounded text-yellow-800">{s.notizen}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-primary-light)] transition-colors">
              <Navigation size={16} /> Route von Regensdorf
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[var(--color-border)] px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <ExternalLink size={16} /> Google Maps öffnen
            </a>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] mb-6 overflow-hidden">
        <button onClick={() => setShowMap(!showMap)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <span className="font-semibold flex items-center gap-2"><MapPin size={18} /> Karte</span>
          {showMap ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showMap && (
          <div className="h-[300px] border-t border-[var(--color-border)]">
            <iframe src={embedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
          </div>
        )}
      </div>

      {/* Kontakte */}
      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-5 mb-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><User size={18} /> Kontakte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kontakte.map((k) => (
            <div key={k.id} className="border border-[var(--color-border)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                {k.typ === "Hausabwart" && <Building2 size={16} className="text-blue-500" />}
                {k.typ === "Verwaltung" && <Building2 size={16} className="text-purple-500" />}
                {k.typ === "Eigentümer" && <User size={16} className="text-green-500" />}
                <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{k.typ}</span>
              </div>
              <div className="font-medium">{k.name}</div>
              {k.telefon && (
                <a href={`tel:${k.telefon}`} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]">
                  <Phone size={14} /> {k.telefon}
                </a>
              )}
              {k.email && (
                <a href={`mailto:${k.email}`} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]">
                  <Mail size={14} /> {k.email}
                </a>
              )}
              {k.notizen && <p className="text-xs text-[var(--color-text-muted)] mt-1">{k.notizen}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[var(--color-card)] rounded-lg p-1 border border-[var(--color-border)] w-fit">
        {(["info", "auftraege", "historie"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:bg-gray-100"
            }`}>
            {tab === "info" ? "Anlagen" : tab === "auftraege" ? "Aufträge & Angebote" : "Historie"}
          </button>
        ))}
      </div>

      {/* Anlagen Tab */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anlagen.map((a) => {
            const Icon = anlageIcons[a.typ] || Wrench;
            return (
              <div key={a.id} className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-[var(--color-primary)]" />
                  <span className="font-semibold">{a.typ}</span>
                  {a.hat_tigerloop === 1 && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">Tigerloop</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {a.modell && <div><span className="text-[var(--color-text-muted)]">Modell:</span> {a.modell}</div>}
                  {a.hersteller && <div><span className="text-[var(--color-text-muted)]">Hersteller:</span> {a.hersteller}</div>}
                  {a.baujahr > 0 && <div><span className="text-[var(--color-text-muted)]">Baujahr:</span> {a.baujahr}</div>}
                  {a.kapazitaet && <div><span className="text-[var(--color-text-muted)]">Kapazität:</span> {a.kapazitaet}</div>}
                  {a.filter_modell && <div><span className="text-[var(--color-text-muted)]">Filter-Modell:</span> {a.filter_modell}</div>}
                </div>
                {a.notizen && <p className="text-xs text-[var(--color-text-muted)] mt-2 bg-gray-50 p-2 rounded">{a.notizen}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Aufträge Tab */}
      {activeTab === "auftraege" && (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Typ</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fällig</th>
                <th className="px-4 py-3 font-medium">Intervall</th>
                <th className="px-4 py-3 font-medium">Angebot</th>
                <th className="px-4 py-3 font-medium">Betrag</th>
                <th className="px-4 py-3 font-medium">Erledigt</th>
                <th className="px-4 py-3 font-medium">Notizen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {auftraege.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.typ}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || ""}`}>
                      {statusLabels[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.faellig_am ? new Date(a.faellig_am).toLocaleDateString("de-CH") : "-"}</td>
                  <td className="px-4 py-3">{a.intervall_jahre ? `Alle ${a.intervall_jahre} Jahre` : "-"}</td>
                  <td className="px-4 py-3">{a.angebots_datum ? new Date(a.angebots_datum).toLocaleDateString("de-CH") : "-"}</td>
                  <td className="px-4 py-3">{a.angebots_betrag ? `CHF ${a.angebots_betrag.toLocaleString("de-CH")}` : "-"}</td>
                  <td className="px-4 py-3">
                    {a.erledigt_am ? (
                      <div>
                        <div>{new Date(a.erledigt_am).toLocaleDateString("de-CH")}</div>
                        {a.techniker && <div className="text-xs text-[var(--color-text-muted)]">von {a.techniker}</div>}
                        {a.kosten && <div className="text-xs font-medium">CHF {a.kosten.toLocaleString("de-CH")}</div>}
                      </div>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{a.notizen || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auftraege.length === 0 && <p className="p-4 text-center text-[var(--color-text-muted)]">Keine Aufträge vorhanden</p>}
        </div>
      )}

      {/* Historie Tab */}
      {activeTab === "historie" && (
        <div className="space-y-4">
          {historie.map((h) => (
            <div key={h.id} className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-[var(--color-primary)] text-white px-2 py-1 rounded text-xs">
                    {new Date(h.datum).toLocaleDateString("de-CH")}
                  </div>
                  <span className="font-medium">{h.typ}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {h.techniker && (
                    <span className="text-[var(--color-text-muted)] flex items-center gap-1"><User size={14} /> {h.techniker}</span>
                  )}
                  {h.kosten > 0 && (
                    <span className="font-medium text-green-600">CHF {h.kosten.toLocaleString("de-CH")}</span>
                  )}
                </div>
              </div>
              <p className="text-sm">{h.beschreibung}</p>
              {h.notizen && <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">{h.notizen}</p>}
            </div>
          ))}
          {historie.length === 0 && (
            <div className="bg-[var(--color-card)] rounded-lg p-4 text-center text-[var(--color-text-muted)]">
              Keine Historie vorhanden
            </div>
          )}
        </div>
      )}
    </div>
  );
}
