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
  `);
}
