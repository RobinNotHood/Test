import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    seedDatabase();
    const db = getDb();

    const totalStandorte = (db.prepare("SELECT COUNT(*) as c FROM standorte").get() as { c: number }).c;
    const totalAuftraege = (db.prepare("SELECT COUNT(*) as c FROM auftraege WHERE status != 'erledigt'").get() as { c: number }).c;
    const angeboteOffen = (db.prepare("SELECT COUNT(*) as c FROM auftraege WHERE status = 'angebot_gesendet'").get() as { c: number }).c;
    const angeboteAkzeptiert = (db.prepare("SELECT COUNT(*) as c FROM auftraege WHERE status = 'angebot_akzeptiert'").get() as { c: number }).c;
    const erledigte = (db.prepare("SELECT COUNT(*) as c FROM auftraege WHERE status = 'erledigt'").get() as { c: number }).c;

    const auftraegeByTyp = db.prepare(`
      SELECT typ, COUNT(*) as anzahl FROM auftraege WHERE status != 'erledigt' GROUP BY typ ORDER BY anzahl DESC
    `).all();

    const auftraegeByRegion = db.prepare(`
      SELECT s.region, COUNT(*) as anzahl
      FROM auftraege a JOIN standorte s ON a.standort_id = s.id
      WHERE a.status != 'erledigt'
      GROUP BY s.region ORDER BY anzahl DESC
    `).all();

    const naechsteAuftraege = db.prepare(`
      SELECT a.*, s.firma, s.strasse, s.plz, s.ort, s.region
      FROM auftraege a JOIN standorte s ON a.standort_id = s.id
      WHERE a.status IN ('angebot_akzeptiert','geplant','angebot_gesendet')
      ORDER BY a.faellig_am ASC LIMIT 15
    `).all();

    const regionen = db.prepare("SELECT DISTINCT region FROM standorte ORDER BY region").all();

    // Fällige Services berechnen
    const faelligeServices = db.prepare(`
      SELECT s.id, s.firma, s.ort, s.region, s.ist_restaurant,
        h.typ as service_typ,
        MAX(h.datum) as letzte_durchfuehrung,
        CASE
          WHEN h.typ = 'Boiler-Entkalkung' THEN 3
          WHEN h.typ = 'Tankreinigung' THEN 5
          WHEN h.typ = 'Tank-Sichtkontrolle' THEN 10
          WHEN h.typ = 'Filterwechsel' AND s.ist_restaurant = 1 THEN 1
          WHEN h.typ = 'Filterwechsel' THEN 2
          ELSE 3
        END as intervall
      FROM historie h
      JOIN standorte s ON h.standort_id = s.id
      GROUP BY s.id, h.typ
      HAVING date(MAX(h.datum), '+' || intervall || ' years') <= date('now', '+6 months')
      ORDER BY date(MAX(h.datum), '+' || intervall || ' years') ASC
      LIMIT 20
    `).all();

    return NextResponse.json({
      totalStandorte, totalAuftraege, angeboteOffen, angeboteAkzeptiert, erledigte,
      auftraegeByTyp, auftraegeByRegion, naechsteAuftraege, regionen, faelligeServices,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
