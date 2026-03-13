import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  try {
    seedDatabase();
    return NextResponse.json({ success: true, message: "Datenbank erfolgreich befüllt" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
