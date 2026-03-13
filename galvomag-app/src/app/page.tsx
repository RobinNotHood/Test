"use client";

import { useEffect, useState } from "react";
import { Building2, ClipboardList, FileCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalStandorte: number;
  totalAuftraege: number;
  angeboteOffen: number;
  angeboteAkzeptiert: number;
  erledigte: number;
  auftraegeByTyp: { typ: string; anzahl: number }[];
  auftraegeByRegion: { region: string; anzahl: number }[];
  naechsteAuftraege: {
    id: number; standort_id: string; typ: string; status: string;
    faellig_am: string; firma: string; strasse: string; plz: string;
    ort: string; region: string; angebots_betrag: number | null;
  }[];
}

const statusLabels: Record<string, string> = {
  geplant: "Geplant",
  angebot_gesendet: "Angebot gesendet",
  angebot_akzeptiert: "Angebot akzeptiert",
  angebot_abgelehnt: "Abgelehnt",
  in_bearbeitung: "In Bearbeitung",
  erledigt: "Erledigt",
};

const statusColors: Record<string, string> = {
  geplant: "bg-gray-200 text-gray-700",
  angebot_gesendet: "bg-blue-100 text-blue-700",
  angebot_akzeptiert: "bg-green-100 text-green-700",
  angebot_abgelehnt: "bg-red-100 text-red-700",
  in_bearbeitung: "bg-yellow-100 text-yellow-700",
  erledigt: "bg-emerald-100 text-emerald-700",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg text-[var(--color-text-muted)]">Laden...</div></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Übersicht aller Aufträge und Standorte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Building2} label="Standorte" value={data.totalStandorte} color="bg-blue-500" />
        <StatCard icon={ClipboardList} label="Offene Aufträge" value={data.totalAuftraege} color="bg-orange-500" />
        <StatCard icon={Clock} label="Angebote offen" value={data.angeboteOffen} color="bg-yellow-500" />
        <StatCard icon={FileCheck} label="Akzeptiert" value={data.angeboteAkzeptiert} color="bg-green-500" />
        <StatCard icon={CheckCircle} label="Erledigt" value={data.erledigte} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm p-5 border border-[var(--color-border)]">
          <h2 className="font-semibold text-lg mb-4">Aufträge nach Typ</h2>
          <div className="space-y-3">
            {data.auftraegeByTyp.map((item) => (
              <div key={item.typ} className="flex items-center justify-between">
                <span className="text-sm">{item.typ}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[var(--color-primary)] h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.anzahl / data.totalAuftraege) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">{item.anzahl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-card)] rounded-lg shadow-sm p-5 border border-[var(--color-border)]">
          <h2 className="font-semibold text-lg mb-4">Aufträge nach Region</h2>
          <div className="space-y-3">
            {data.auftraegeByRegion.map((item) => (
              <div key={item.region} className="flex items-center justify-between">
                <span className="text-sm">{item.region}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[var(--color-accent)] h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.anzahl / data.totalAuftraege) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">{item.anzahl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
        <div className="p-5 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-lg">Nächste anstehende Aufträge</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Standort</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">Typ</th>
                <th className="px-4 py-3 font-medium">Fällig</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.naechsteAuftraege.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/standorte/${a.standort_id}`} className="text-[var(--color-primary-light)] font-medium hover:underline">
                      {a.standort_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.firma}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{a.strasse}, {a.plz} {a.ort}</div>
                  </td>
                  <td className="px-4 py-3">{a.region}</td>
                  <td className="px-4 py-3">{a.typ}</td>
                  <td className="px-4 py-3">{a.faellig_am ? new Date(a.faellig_am).toLocaleDateString("de-CH") : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || ""}`}>
                      {statusLabels[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.angebots_betrag ? `CHF ${a.angebots_betrag.toLocaleString("de-CH")}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number }>; label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--color-card)] rounded-lg shadow-sm p-4 border border-[var(--color-border)] flex items-center gap-4">
      <div className={`${color} p-3 rounded-lg text-white`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
      </div>
    </div>
  );
}
