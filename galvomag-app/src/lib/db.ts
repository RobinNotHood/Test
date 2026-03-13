import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "galvomag.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initializeSchema(_db);
  }
  return _db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS standorte (
      id TEXT PRIMARY KEY,
      firma TEXT,
      strasse TEXT NOT NULL,
      plz TEXT NOT NULL,
      ort TEXT NOT NULL,
      region TEXT NOT NULL,
      kanton TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      zugang_schluessel TEXT DEFAULT 'Standard 5000er Schlüssel',
      kalk_region TEXT DEFAULT 'Mittel',
      ist_restaurant INTEGER DEFAULT 0,
      notizen TEXT,
      erstellt_am TEXT DEFAULT (datetime('now')),
      aktualisiert_am TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS kontakte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      typ TEXT NOT NULL,
      name TEXT NOT NULL,
      telefon TEXT,
      email TEXT,
      notizen TEXT
    );

    CREATE TABLE IF NOT EXISTS anlagen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      typ TEXT NOT NULL,
      modell TEXT,
      hersteller TEXT,
      baujahr INTEGER,
      kapazitaet TEXT,
      hat_tigerloop INTEGER DEFAULT 0,
      filter_modell TEXT,
      notizen TEXT
    );

    CREATE TABLE IF NOT EXISTS auftraege (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      typ TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'geplant',
      faellig_am TEXT,
      intervall_jahre INTEGER,
      angebots_datum TEXT,
      angebots_betrag REAL,
      erledigt_am TEXT,
      techniker TEXT,
      kosten REAL,
      notizen TEXT,
      erstellt_am TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS historie (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      auftrag_id INTEGER REFERENCES auftraege(id),
      datum TEXT NOT NULL,
      typ TEXT NOT NULL,
      beschreibung TEXT,
      techniker TEXT,
      kosten REAL,
      notizen TEXT
    );

    CREATE TABLE IF NOT EXISTS bilder (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      dateiname TEXT NOT NULL,
      beschreibung TEXT,
      hochgeladen_am TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wochenplan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mitarbeiter TEXT NOT NULL,
      datum TEXT NOT NULL,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      auftrag_ids TEXT,
      reihenfolge INTEGER DEFAULT 0,
      notizen TEXT
    );

    CREATE TABLE IF NOT EXISTS offerten (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standort_id TEXT NOT NULL REFERENCES standorte(id) ON DELETE CASCADE,
      datum TEXT DEFAULT (date('now')),
      positionen TEXT NOT NULL,
      total_betrag REAL NOT NULL,
      status TEXT DEFAULT 'entwurf',
      gesendet_am TEXT,
      notizen TEXT
    );
  `);
}

export const SERVICE_INTERVALLE: Record<string, { intervall: number; label: string }> = {
  "Boiler-Entkalkung": { intervall: 3, label: "Boiler-Entkalkung" },
  "Tank-Sichtkontrolle": { intervall: 10, label: "Tank-Sichtkontrolle" },
  "Tankreinigung": { intervall: 5, label: "Tankreinigung" },
  "Filterwechsel": { intervall: 2, label: "Filterwechsel (Wasser)" },
  "Filterwechsel-Restaurant": { intervall: 1, label: "Filterwechsel (Restaurant)" },
  "Oelfilter-Wechsel": { intervall: 2, label: "Ölfilter-Wechsel" },
};

export const PREIS_KLASSEN: Record<string, { min: number; standard: number; max: number }> = {
  "Boiler-Entkalkung-Klein": { min: 550, standard: 700, max: 900 },
  "Boiler-Entkalkung-Mittel": { min: 800, standard: 1000, max: 1300 },
  "Boiler-Entkalkung-Gross": { min: 1200, standard: 1600, max: 2200 },
  "Tankreinigung-Klein": { min: 900, standard: 1200, max: 1600 },
  "Tankreinigung-Mittel": { min: 1500, standard: 2000, max: 2800 },
  "Tankreinigung-Gross": { min: 2500, standard: 3500, max: 5000 },
  "Tank-Sichtkontrolle": { min: 300, standard: 450, max: 650 },
  "Filterwechsel-Wasser": { min: 200, standard: 320, max: 450 },
  "Filterwechsel-Oel": { min: 180, standard: 280, max: 400 },
  "Filterwechsel-Tigerloop": { min: 350, standard: 480, max: 650 },
};
