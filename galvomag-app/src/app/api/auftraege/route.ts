import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const url = new URL(request.url);
    const region = url.searchParams.get("region");
    const status = url.searchParams.get("status");
    const typ = url.searchParams.get("typ");

    let query = `
      SELECT a.*, s.firma, s.strasse, s.plz, s.ort, s.region, s.kanton
      FROM auftraege a
      JOIN standorte s ON a.standort_id = s.id
    `;

    const conditions: string[] = [];
    const params: string[] = [];

    if (region) {
      conditions.push("s.region = ?");
      params.push(region);
    }
    if (status) {
      conditions.push("a.status = ?");
      params.push(status);
    }
    if (typ) {
      conditions.push("a.typ = ?");
      params.push(typ);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY a.faellig_am ASC";

    const auftraege = db.prepare(query).all(...params);
    return NextResponse.json({ auftraege });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: "ID erforderlich" }, { status: 400 });

    const setClause = Object.keys(fields).map((f) => `${f} = ?`).join(", ");
    const values = Object.values(fields);

    db.prepare(`UPDATE auftraege SET ${setClause} WHERE id = ?`).run(...values, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
