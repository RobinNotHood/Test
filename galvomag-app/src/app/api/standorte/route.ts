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
    const search = url.searchParams.get("search");
    const hatFilter = url.searchParams.get("hatFilter");
    const hatTigerloop = url.searchParams.get("hatTigerloop");
    const sortBy = url.searchParams.get("sortBy") || "id";

    let query = `
      SELECT s.*,
        GROUP_CONCAT(DISTINCT a_typ.typ) as anlage_typen,
        (SELECT COUNT(*) FROM auftraege au WHERE au.standort_id = s.id AND au.status != 'erledigt') as offene_auftraege,
        (SELECT GROUP_CONCAT(DISTINCT au.typ || ':' || au.status) FROM auftraege au WHERE au.standort_id = s.id AND au.status != 'erledigt') as auftraege_info,
        (SELECT COUNT(*) FROM anlagen an WHERE an.standort_id = s.id AND an.typ IN ('Wasserfilter', 'Ölfilter')) as filter_count,
        (SELECT COUNT(*) FROM anlagen an WHERE an.standort_id = s.id AND an.hat_tigerloop = 1) as tigerloop_count
      FROM standorte s
      LEFT JOIN anlagen a_typ ON a_typ.standort_id = s.id
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (region) {
      conditions.push("s.region = ?");
      params.push(region);
    }

    if (search) {
      conditions.push("(s.firma LIKE ? OR s.strasse LIKE ? OR s.ort LIKE ? OR s.id LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (status) {
      conditions.push("EXISTS (SELECT 1 FROM auftraege au WHERE au.standort_id = s.id AND au.status = ?)");
      params.push(status);
    }

    if (typ) {
      conditions.push("EXISTS (SELECT 1 FROM auftraege au WHERE au.standort_id = s.id AND au.typ = ? AND au.status != 'erledigt')");
      params.push(typ);
    }

    if (hatFilter === "1") {
      conditions.push("EXISTS (SELECT 1 FROM anlagen an WHERE an.standort_id = s.id AND an.typ IN ('Wasserfilter', 'Ölfilter'))");
    }

    if (hatTigerloop === "1") {
      conditions.push("EXISTS (SELECT 1 FROM anlagen an WHERE an.standort_id = s.id AND an.hat_tigerloop = 1)");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY s.id";

    const orderMap: Record<string, string> = {
      id: "s.id ASC",
      region: "s.region ASC, s.ort ASC",
      ort: "s.ort ASC",
      auftraege: "offene_auftraege DESC",
      faellig: "(SELECT MIN(au.faellig_am) FROM auftraege au WHERE au.standort_id = s.id AND au.status != 'erledigt') ASC",
    };
    query += ` ORDER BY ${orderMap[sortBy] || "s.id ASC"}`;

    const standorte = db.prepare(query).all(...params);

    const regionen = db.prepare("SELECT DISTINCT region FROM standorte ORDER BY region").all();

    return NextResponse.json({ standorte, regionen });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
