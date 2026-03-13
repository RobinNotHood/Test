import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id } = await params;

    const standort = db.prepare("SELECT * FROM standorte WHERE id = ?").get(id);
    if (!standort) {
      return NextResponse.json({ error: "Standort nicht gefunden" }, { status: 404 });
    }

    const kontakte = db.prepare("SELECT * FROM kontakte WHERE standort_id = ? ORDER BY typ").all(id);
    const anlagen = db.prepare("SELECT * FROM anlagen WHERE standort_id = ? ORDER BY typ").all(id);
    const auftraege = db.prepare("SELECT * FROM auftraege WHERE standort_id = ? ORDER BY faellig_am DESC").all(id);
    const historie = db.prepare("SELECT * FROM historie WHERE standort_id = ? ORDER BY datum DESC").all(id);
    const bilder = db.prepare("SELECT * FROM bilder WHERE standort_id = ? ORDER BY hochgeladen_am DESC").all(id);

    return NextResponse.json({ standort, kontakte, anlagen, auftraege, historie, bilder });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    const fields = Object.keys(body);
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => body[f]);

    db.prepare(`UPDATE standorte SET ${setClause}, aktualisiert_am = datetime('now') WHERE id = ?`).run(...values, id);

    const updated = db.prepare("SELECT * FROM standorte WHERE id = ?").get(id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
