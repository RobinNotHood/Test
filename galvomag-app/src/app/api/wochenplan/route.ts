import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const url = new URL(request.url);
    const mitarbeiter = url.searchParams.get("mitarbeiter") || "Daniel Zahner";
    const woche = url.searchParams.get("woche") || "2026-03-16";

    const startDate = new Date(woche);
    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const plan: Record<string, any[]> = {};
    let wochenTotal = 0;

    for (const datum of dates) {
      const eintraege = db.prepare(`
        SELECT w.*, s.firma, s.strasse, s.plz, s.ort, s.region, s.latitude, s.longitude,
          (SELECT GROUP_CONCAT(a.typ || ' (CHF ' || COALESCE(a.angebots_betrag, 0) || ')', ', ')
           FROM auftraege a WHERE a.standort_id = w.standort_id AND a.status = 'angebot_akzeptiert') as geplante_arbeiten,
          (SELECT SUM(COALESCE(a.angebots_betrag, 0))
           FROM auftraege a WHERE a.standort_id = w.standort_id AND a.status = 'angebot_akzeptiert') as tages_umsatz
        FROM wochenplan w
        JOIN standorte s ON w.standort_id = s.id
        WHERE w.mitarbeiter = ? AND w.datum = ?
        ORDER BY w.reihenfolge ASC
      `).all(mitarbeiter, datum);

      const tagesTotal = eintraege.reduce((sum: number, e: any) => sum + (e.tages_umsatz || 0), 0);
      wochenTotal += tagesTotal;
      plan[datum] = eintraege;
    }

    return NextResponse.json({ plan, dates, mitarbeiter, wochenTotal });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
