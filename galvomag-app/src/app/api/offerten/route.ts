import { NextRequest, NextResponse } from "next/server";
import { getDb, PREIS_KLASSEN } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    seedDatabase();
    const db = getDb();

    const offerten = db.prepare(`
      SELECT o.*, s.firma, s.strasse, s.plz, s.ort, s.region,
        (SELECT k.email FROM kontakte k WHERE k.standort_id = s.id AND k.typ = 'Verwaltung' LIMIT 1) as email
      FROM offerten o
      JOIN standorte s ON o.standort_id = s.id
      ORDER BY o.datum DESC
    `).all();

    return NextResponse.json({ offerten, preisKlassen: PREIS_KLASSEN });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { standort_id, positionen, total_betrag, notizen } = body;

    const result = db.prepare(`
      INSERT INTO offerten (standort_id, positionen, total_betrag, status, notizen)
      VALUES (?, ?, ?, 'entwurf', ?)
    `).run(standort_id, JSON.stringify(positionen), total_betrag, notizen || "");

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
