import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    seedDatabase();
    const db = getDb();

    const faellig = db.prepare(`
      SELECT
        s.id, s.firma, s.strasse, s.plz, s.ort, s.region, s.kanton, s.ist_restaurant,
        s.kalk_region, s.zugang_schluessel,
        h.typ as service_typ,
        MAX(h.datum) as letztes_datum,
        MAX(h.kosten) as letzte_kosten,
        CASE
          WHEN h.typ = 'Boiler-Entkalkung' THEN 3
          WHEN h.typ = 'Tankreinigung' THEN 5
          WHEN h.typ = 'Tank-Sichtkontrolle' THEN 10
          WHEN h.typ = 'Filterwechsel' AND s.ist_restaurant = 1 THEN 1
          WHEN h.typ = 'Filterwechsel' THEN 2
          ELSE 3
        END as intervall,
        date(MAX(h.datum), '+' ||
          CASE
            WHEN h.typ = 'Boiler-Entkalkung' THEN '3'
            WHEN h.typ = 'Tankreinigung' THEN '5'
            WHEN h.typ = 'Tank-Sichtkontrolle' THEN '10'
            WHEN h.typ = 'Filterwechsel' AND s.ist_restaurant = 1 THEN '1'
            WHEN h.typ = 'Filterwechsel' THEN '2'
            ELSE '3'
          END || ' years') as faellig_am,
        (SELECT k.name FROM kontakte k WHERE k.standort_id = s.id AND k.typ = 'Verwaltung' LIMIT 1) as verwaltung,
        (SELECT k.email FROM kontakte k WHERE k.standort_id = s.id AND k.typ = 'Verwaltung' LIMIT 1) as verwaltung_email,
        (SELECT k.name FROM kontakte k WHERE k.standort_id = s.id AND k.typ = 'Hausabwart' LIMIT 1) as hausabwart,
        (SELECT AVG(h2.kosten) FROM historie h2 WHERE h2.standort_id = s.id AND h2.typ = h.typ) as durchschnitt_kosten,
        CASE
          WHEN NOT EXISTS (SELECT 1 FROM auftraege a WHERE a.standort_id = s.id AND a.typ = h.typ AND a.status IN ('geplant','angebot_gesendet','angebot_akzeptiert')) THEN 0
          ELSE 1
        END as hat_offenen_auftrag
      FROM historie h
      JOIN standorte s ON h.standort_id = s.id
      GROUP BY s.id, h.typ
      HAVING date(MAX(h.datum), '+' ||
        CASE
          WHEN h.typ = 'Boiler-Entkalkung' THEN '3'
          WHEN h.typ = 'Tankreinigung' THEN '5'
          WHEN h.typ = 'Tank-Sichtkontrolle' THEN '10'
          WHEN h.typ = 'Filterwechsel' AND s.ist_restaurant = 1 THEN '1'
          WHEN h.typ = 'Filterwechsel' THEN '2'
          ELSE '3'
        END || ' years') <= date('now', '+18 months')
      ORDER BY faellig_am ASC
    `).all();

    const preisHistorie = db.prepare(`
      SELECT s.region, h.typ, AVG(h.kosten) as durchschnitt, MIN(h.kosten) as minimum, MAX(h.kosten) as maximum, COUNT(*) as anzahl
      FROM historie h JOIN standorte s ON h.standort_id = s.id
      WHERE h.kosten > 0
      GROUP BY s.region, h.typ
      ORDER BY s.region, h.typ
    `).all();

    return NextResponse.json({ faellig, preisHistorie });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
