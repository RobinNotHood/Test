import { getDb } from "./db";

export function seedDatabase() {
  const db = getDb();

  const count = db.prepare("SELECT COUNT(*) as c FROM standorte").get() as { c: number };
  if (count.c > 0) return;

  const insertStandort = db.prepare(`
    INSERT INTO standorte (id, firma, strasse, plz, ort, region, kanton, latitude, longitude, zugang_schluessel, kalk_region, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertKontakt = db.prepare(`
    INSERT INTO kontakte (standort_id, typ, name, telefon, email, notizen)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAnlage = db.prepare(`
    INSERT INTO anlagen (standort_id, typ, modell, hersteller, baujahr, kapazitaet, hat_tigerloop, filter_modell, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAuftrag = db.prepare(`
    INSERT INTO auftraege (standort_id, typ, status, faellig_am, intervall_jahre, angebots_datum, angebots_betrag, erledigt_am, techniker, kosten, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistorie = db.prepare(`
    INSERT INTO historie (standort_id, datum, typ, beschreibung, techniker, kosten, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // === STANDORTE ===
    const standorte = [
      ["GAL-001", "Überbauung Sonnenhof", "Sonnenhofstrasse 12", "8105", "Regensdorf", "Furttal", "ZH", 47.4326, 8.4681, "Standard 5000er Schlüssel", "Hoch", "Grosses Mehrfamilienhaus, 3 Eingänge"],
      ["GAL-002", "Wohngenossenschaft Watt", "Watterstrasse 45", "8105", "Watt", "Furttal", "ZH", 47.4389, 8.4532, "Spezialschlüssel Kaba", "Hoch", "Zugang über Tiefgarage"],
      ["GAL-003", "Liegenschaft Müller", "Bahnhofstrasse 8", "8302", "Kloten", "Glattal", "ZH", 47.4515, 8.5849, "Standard 5000er Schlüssel", "Mittel", "Einfamilienhaus"],
      ["GAL-004", "Schulanlage Dorf", "Schulstrasse 3", "8153", "Rümlang", "Glattal", "ZH", 47.4503, 8.5280, "Schlüssel beim Hauswart abholen", "Mittel", "Schulhaus mit separatem Heizungsraum"],
      ["GAL-005", "Alterszentrum Wehntal", "Dorfstrasse 22", "8165", "Schöfflisdorf", "Wehntal", "ZH", 47.4892, 8.4301, "Standard 5000er Schlüssel", "Niedrig", "Alterszentrum, Zugang nur Mo-Fr 8-17 Uhr"],
      ["GAL-006", "MFH Zentrum", "Zürcherstrasse 150", "8406", "Winterthur", "Winterthur", "ZH", 47.4983, 8.7243, "Kaba Star Schlüssel", "Hoch", "Mehrstöckiges Gebäude"],
      ["GAL-007", "Gewerbehaus Industrie", "Industriestrasse 30", "8305", "Dietlikon", "Glattal", "ZH", 47.4134, 8.6208, "Zugangscode 4582", "Mittel", "Gewerbebau, Heizraum im UG"],
      ["GAL-008", "Wohnüberbauung Tulpenweg", "Tulpenweg 5-9", "8108", "Dällikon", "Furttal", "ZH", 47.4340, 8.4411, "Standard 5000er Schlüssel", "Hoch", "4 Mehrfamilienhäuser"],
      ["GAL-009", "EFH Gartmann", "Rebbergstrasse 18", "8113", "Boppelsen", "Furttal", "ZH", 47.4659, 8.3937, "Schlüssel unter Matte", "Niedrig", "Einfamilienhaus, Besitzer oft abwesend"],
      ["GAL-010", "Kirchgemeindehaus", "Kirchgasse 2", "8162", "Steinmaur", "Wehntal", "ZH", 47.4958, 8.4518, "Standard 5000er Schlüssel", "Niedrig", "Kirchgemeindehaus + Pfarrhaus"],
      ["GAL-011", "Überbauung Limmatfeld", "Limmatfeldstrasse 20", "8953", "Dietikon", "Limmattal", "ZH", 47.4046, 8.3995, "Badge-System", "Mittel", "Neuere Überbauung"],
      ["GAL-012", "Restaurant Bären", "Hauptstrasse 55", "8155", "Niederhasli", "Furttal", "ZH", 47.4803, 8.4856, "Standard 5000er Schlüssel", "Hoch", "Restaurant mit Wohnungen OG"],
      ["GAL-013", "Gemeindehaus Buchs", "Gemeindeweg 1", "8107", "Buchs ZH", "Furttal", "ZH", 47.4574, 8.4343, "Schlüssel bei Gemeindekanzlei", "Mittel", "Öffentliches Gebäude"],
      ["GAL-014", "Wohnanlage Bachwiesen", "Bachwiesenstrasse 8-14", "8304", "Wallisellen", "Glattal", "ZH", 47.4142, 8.5914, "Standard 5000er Schlüssel", "Hoch", "6 Eingänge, grosser Heizungsraum"],
      ["GAL-015", "Bauernhof Meier", "Dorfstrasse 88", "8166", "Niederweningen", "Wehntal", "ZH", 47.5042, 8.3681, "Offen, beim Bauern melden", "Niedrig", "Altes Bauernhaus, aufwändige Tankanlage"],
      ["GAL-016", "Mehrfamilienhaus Rosen", "Rosengartenstrasse 4", "5400", "Baden", "Baden", "AG", 47.4736, 8.3062, "Standard 5000er Schlüssel", "Hoch", "Altbau mit grossem Ölkeller"],
      ["GAL-017", "Gewerbepark Spreitenbach", "Tägerhardstrasse 100", "8957", "Spreitenbach", "Baden", "AG", 47.4208, 8.3636, "Zugangskarte beim Empfang", "Mittel", "Grosser Gewerbekomplex"],
      ["GAL-018", "Seniorenwohnungen Am Park", "Parkweg 15", "8180", "Bülach", "Unterland", "ZH", 47.5200, 8.5394, "Standard 5000er Schlüssel", "Mittel", "Betreute Seniorenwohnungen"],
      ["GAL-019", "Villa Rosenberg", "Rosenbergstrasse 33", "8302", "Kloten", "Glattal", "ZH", 47.4480, 8.5785, "Privater Schlüssel", "Mittel", "Luxusvilla, hochwertiger Boiler"],
      ["GAL-020", "MFH Sonnmatt", "Sonnmattstrasse 7", "8154", "Oberglatt", "Unterland", "ZH", 47.4791, 8.5156, "Standard 5000er Schlüssel", "Hoch", "Heizraum schwer zugänglich"],
    ];

    for (const s of standorte) {
      insertStandort.run(...s);
    }

    // === KONTAKTE ===
    const kontakte = [
      ["GAL-001", "Hausabwart", "Peter Brunner", "079 345 67 89", "p.brunner@sunrise.ch", "Mo-Fr erreichbar"],
      ["GAL-001", "Verwaltung", "Livit AG", "044 267 00 00", "info@livit.ch", "Frau Schneider zuständig"],
      ["GAL-002", "Hausabwart", "Hans Keller", "078 234 56 78", "h.keller@bluewin.ch", "Pensioniert, immer vor Ort"],
      ["GAL-002", "Verwaltung", "Wincasa AG", "044 205 32 32", "info@wincasa.ch", ""],
      ["GAL-003", "Eigentümer", "Thomas Müller", "076 567 89 01", "t.mueller@gmx.ch", "Direktkontakt"],
      ["GAL-004", "Hausabwart", "Beat Schmid", "079 876 54 32", "b.schmid@schule-ruemlang.ch", "Nur vormittags"],
      ["GAL-004", "Verwaltung", "Gemeinde Rümlang", "044 817 11 11", "bau@ruemlang.zh.ch", ""],
      ["GAL-005", "Hausabwart", "Rolf Weber", "078 123 45 67", "r.weber@altersheim.ch", "Immer erreichbar"],
      ["GAL-005", "Verwaltung", "Stiftung Wehntal", "044 857 10 00", "verwaltung@stiftung-wehntal.ch", ""],
      ["GAL-006", "Verwaltung", "Privera AG", "058 105 30 00", "winterthur@privera.ch", "Herr Tanner"],
      ["GAL-007", "Eigentümer", "Gewerbe Dietlikon AG", "044 833 22 11", "info@gewerbe-dietlikon.ch", ""],
      ["GAL-008", "Hausabwart", "Marco Bianchi", "079 456 78 90", "m.bianchi@quicknet.ch", "Spricht auch Italienisch"],
      ["GAL-008", "Verwaltung", "SPG Intercity AG", "044 388 58 58", "zh@spg.ch", ""],
      ["GAL-009", "Eigentümer", "Fritz Gartmann", "076 789 01 23", "fritz.gartmann@hispeed.ch", "Ferien Aug/Sep"],
      ["GAL-010", "Verwaltung", "Ref. Kirchgemeinde Steinmaur", "044 854 04 30", "sekretariat@kirche-steinmaur.ch", ""],
      ["GAL-011", "Hausabwart", "Ali Yilmaz", "079 111 22 33", "a.yilmaz@limmatfeld.ch", ""],
      ["GAL-012", "Eigentümer", "Familie Steiner", "044 850 11 22", "restaurant.baeren@gmail.com", ""],
      ["GAL-013", "Verwaltung", "Gemeinde Buchs ZH", "044 847 16 16", "gemeindeschreiber@buchs-zh.ch", ""],
      ["GAL-014", "Hausabwart", "Kurt Zimmermann", "079 222 33 44", "k.zimmermann@outlook.com", ""],
      ["GAL-014", "Verwaltung", "Wincasa AG", "044 205 32 32", "info@wincasa.ch", "Herr Huber"],
      ["GAL-015", "Eigentümer", "Josef Meier", "078 333 44 55", "hof-meier@bluewin.ch", "Am besten morgens anrufen"],
      ["GAL-016", "Verwaltung", "ImmoTrust AG", "056 222 33 44", "verwaltung@immotrust.ch", ""],
      ["GAL-017", "Hausabwart", "Stefan Frei", "079 444 55 66", "s.frei@gewerbepark.ch", ""],
      ["GAL-018", "Hausabwart", "Werner Baumann", "078 555 66 77", "w.baumann@seniorpark.ch", ""],
      ["GAL-019", "Eigentümer", "Dr. Andreas Rosenberg", "079 666 77 88", "a.rosenberg@bluewin.ch", "Termin immer vorher absprechen"],
      ["GAL-020", "Hausabwart", "Daniel Huber", "079 777 88 99", "d.huber@sonnmatt.ch", ""],
    ];

    for (const k of kontakte) {
      insertKontakt.run(...k);
    }

    // === ANLAGEN ===
    const anlagen = [
      ["GAL-001", "Öltank", "Roth DWT 5000", "Roth", 2005, "5000 Liter", 1, null, "Doppelwandiger Stahltank"],
      ["GAL-001", "Boiler", "Stiebel Eltron SHZ 300", "Stiebel Eltron", 2010, "300 Liter", 0, null, ""],
      ["GAL-001", "Ölfilter", "Oventrop Einstrang", "Oventrop", 2020, null, 1, "Tigerloop", "Mit Tigerloop Entlüfter"],
      ["GAL-001", "Wasserfilter", "BWT Bewados E5", "BWT", 2022, null, 0, "BWT Bewados E5", "Wechsel alle 6 Monate"],
      ["GAL-001", "Heizung", "Viessmann Vitoladens 300-C", "Viessmann", 2008, "28.9 kW", 0, null, "Öl-Brennwertkessel"],
      ["GAL-002", "Öltank", "Werit 3000", "Werit", 2000, "2x 3000 Liter", 0, null, "2 Tanks Batterie"],
      ["GAL-002", "Boiler", "Hoval TransTherm", "Hoval", 2015, "500 Liter", 0, null, ""],
      ["GAL-002", "Heizung", "Buderus Logano G125", "Buderus", 2003, "32 kW", 0, null, "Ölheizung"],
      ["GAL-003", "Öltank", "Dehoust Kellertank", "Dehoust", 2012, "2000 Liter", 0, null, ""],
      ["GAL-003", "Boiler", "Domotec Nuos 200", "Domotec", 2018, "200 Liter", 0, null, "Wärmepumpenboiler"],
      ["GAL-003", "Heizung", "Hoval UltraOil", "Hoval", 2012, "20 kW", 0, null, ""],
      ["GAL-004", "Öltank", "Schütz Tank-in-Tank", "Schütz", 1998, "10000 Liter", 1, null, "Grosser Erdtank"],
      ["GAL-004", "Boiler", "Viessmann Vitocell 100", "Viessmann", 2016, "750 Liter", 0, null, "2 Boiler in Serie"],
      ["GAL-004", "Wasserfilter", "Grünbeck GENO-mat", "Grünbeck", 2020, null, 0, "Grünbeck GENO-mat WS", ""],
      ["GAL-004", "Heizung", "Weishaupt WL30", "Weishaupt", 2005, "45 kW", 0, null, ""],
      ["GAL-005", "Öltank", "Roth DWT 10000", "Roth", 1995, "10000 Liter", 1, null, "Revisionsbedürftig"],
      ["GAL-005", "Boiler", "Stiebel Eltron SHZ 400", "Stiebel Eltron", 2012, "400 Liter", 0, null, ""],
      ["GAL-005", "Wasserfilter", "BWT AQA life S", "BWT", 2021, null, 0, "BWT AQA life S", "Enthärtungsanlage"],
      ["GAL-005", "Heizung", "Buderus Logano G234", "Buderus", 2000, "55 kW", 0, null, ""],
      ["GAL-006", "Öltank", "Werit 5000", "Werit", 2008, "5000 Liter", 0, null, ""],
      ["GAL-006", "Boiler", "CTC EcoZenith i350", "CTC", 2019, "350 Liter", 0, null, "Kombi-Speicher"],
      ["GAL-006", "Ölfilter", "Afriso Ölfilter", "Afriso", 2019, null, 0, "Afriso OptiClean", ""],
      ["GAL-006", "Heizung", "Viessmann Vitoladens 300-T", "Viessmann", 2019, "35 kW", 0, null, ""],
      ["GAL-007", "Öltank", "Dehoust Erdtank", "Dehoust", 2002, "8000 Liter", 1, null, "Erdeinbautank"],
      ["GAL-007", "Heizung", "Weishaupt WL40", "Weishaupt", 2010, "60 kW", 0, null, "Gewerbeheizung"],
      ["GAL-008", "Öltank", "Roth DWT 6000", "Roth", 2006, "2x 3000 Liter", 1, null, "Tankbatterie"],
      ["GAL-008", "Boiler", "Hoval TransTherm 300", "Hoval", 2014, "2x 300 Liter", 0, null, "2 Boiler"],
      ["GAL-008", "Wasserfilter", "Cillit Multigo 24", "Cillit", 2023, null, 0, "Cillit Multigo 24", ""],
      ["GAL-008", "Ölfilter", "Oventrop Zweistrang", "Oventrop", 2018, null, 1, "Tigerloop", "Mit Tigerloop"],
      ["GAL-008", "Heizung", "Buderus Logano plus GB145", "Buderus", 2014, "40 kW", 0, null, ""],
      ["GAL-009", "Öltank", "Haase Kellertank", "Haase", 2010, "1500 Liter", 0, null, "Klein"],
      ["GAL-009", "Boiler", "Domotec Nuos 150", "Domotec", 2020, "150 Liter", 0, null, ""],
      ["GAL-009", "Heizung", "Hoval UltraOil 15", "Hoval", 2010, "15 kW", 0, null, ""],
      ["GAL-010", "Öltank", "Schütz Tanks", "Schütz", 2001, "4000 Liter", 0, null, ""],
      ["GAL-010", "Boiler", "Viessmann Vitocell 300", "Viessmann", 2013, "300 Liter", 0, null, ""],
      ["GAL-010", "Heizung", "Viessmann Vitorondens 222-F", "Viessmann", 2013, "22 kW", 0, null, ""],
      ["GAL-011", "Boiler", "Alpha InnoTec BWP 300", "Alpha InnoTec", 2020, "300 Liter", 0, null, "Neueres Gebäude, kein Öltank"],
      ["GAL-011", "Wasserfilter", "BWT Perla Silk", "BWT", 2020, null, 0, "BWT Perla Silk", ""],
      ["GAL-012", "Öltank", "Roth DWT 3000", "Roth", 2003, "3000 Liter", 0, null, ""],
      ["GAL-012", "Boiler", "Stiebel Eltron SHZ 200", "Stiebel Eltron", 2017, "200 Liter", 0, null, ""],
      ["GAL-012", "Heizung", "Buderus Logano G125 BE", "Buderus", 2003, "25 kW", 0, null, ""],
      ["GAL-013", "Öltank", "Werit 4000", "Werit", 2007, "4000 Liter", 0, null, ""],
      ["GAL-013", "Boiler", "CTC EcoZenith 300", "CTC", 2017, "300 Liter", 0, null, ""],
      ["GAL-013", "Heizung", "Hoval UltraOil 28", "Hoval", 2007, "28 kW", 0, null, ""],
      ["GAL-014", "Öltank", "Roth DWT 8000", "Roth", 2004, "2x 4000 Liter", 1, null, "Grosse Batterieanlage"],
      ["GAL-014", "Boiler", "Viessmann Vitocell 100-V", "Viessmann", 2018, "2x 500 Liter", 0, null, ""],
      ["GAL-014", "Ölfilter", "Oventrop Einstrang", "Oventrop", 2021, null, 1, "Tigerloop", ""],
      ["GAL-014", "Wasserfilter", "Grünbeck softliQ SD21", "Grünbeck", 2021, null, 0, "Grünbeck softliQ SD21", "Enthärtungsanlage"],
      ["GAL-014", "Heizung", "Weishaupt WL30", "Weishaupt", 2010, "48 kW", 0, null, ""],
      ["GAL-015", "Öltank", "Erdtank Alt", "Unbekannt", 1985, "15000 Liter", 0, null, "Alter Erdtank, Zustand beobachten"],
      ["GAL-015", "Boiler", "Stiebel Eltron SHZ 300", "Stiebel Eltron", 2009, "300 Liter", 0, null, ""],
      ["GAL-015", "Heizung", "Buderus Logano G234 X", "Buderus", 1999, "65 kW", 0, null, "Alt, Ersatz planen"],
      ["GAL-016", "Öltank", "Roth DWT 6000", "Roth", 1998, "6000 Liter", 0, null, "Grosser Ölkeller"],
      ["GAL-016", "Boiler", "Hoval TransTherm 500", "Hoval", 2011, "500 Liter", 0, null, ""],
      ["GAL-016", "Ölfilter", "Afriso Ölfilter", "Afriso", 2015, null, 0, "Afriso Standard", ""],
      ["GAL-016", "Heizung", "Viessmann Vitoladens 300-C", "Viessmann", 2011, "32 kW", 0, null, ""],
      ["GAL-017", "Öltank", "Dehoust Erdtank 12000", "Dehoust", 2005, "12000 Liter", 1, null, "Gewerbe-Erdtank"],
      ["GAL-017", "Heizung", "Weishaupt WL50", "Weishaupt", 2005, "80 kW", 0, null, "Gewerbliche Heizanlage"],
      ["GAL-018", "Boiler", "Stiebel Eltron SHZ 400", "Stiebel Eltron", 2016, "2x 400 Liter", 0, null, ""],
      ["GAL-018", "Wasserfilter", "BWT AQA life S", "BWT", 2019, null, 0, "BWT AQA life S", ""],
      ["GAL-018", "Heizung", "Viessmann Vitorondens 200-T", "Viessmann", 2016, "35 kW", 0, null, ""],
      ["GAL-019", "Boiler", "Viessmann Vitocell 300-V", "Viessmann", 2021, "500 Liter", 0, null, "Premium-Boiler"],
      ["GAL-019", "Wasserfilter", "BWT Perla Silk", "BWT", 2021, null, 0, "BWT Perla Silk M", "Luxusanlage"],
      ["GAL-020", "Öltank", "Roth DWT 4000", "Roth", 2007, "4000 Liter", 0, null, ""],
      ["GAL-020", "Boiler", "Hoval TransTherm 300", "Hoval", 2015, "300 Liter", 0, null, ""],
      ["GAL-020", "Ölfilter", "Oventrop Einstrang", "Oventrop", 2019, null, 0, "Oventrop Standard", ""],
      ["GAL-020", "Heizung", "Buderus Logano plus GB145", "Buderus", 2015, "28 kW", 0, null, ""],
    ];

    for (const a of anlagen) {
      insertAnlage.run(...a);
    }

    // === AUFTRAEGE ===
    const auftraege = [
      ["GAL-001", "Boiler-Entkalkung", "angebot_gesendet", "2026-06-15", 3, "2026-01-15", 850, null, null, null, "Letzte Entkalkung 2023"],
      ["GAL-001", "Tankreinigung", "geplant", "2026-09-01", 5, null, null, null, null, null, ""],
      ["GAL-002", "Boiler-Entkalkung", "angebot_akzeptiert", "2026-04-20", 3, "2025-12-10", 1200, null, null, null, "Grosser Boiler"],
      ["GAL-002", "Filterwechsel", "geplant", "2026-05-01", 1, null, null, null, null, null, "Ölfilter und Wasserfilter"],
      ["GAL-003", "Boiler-Entkalkung", "erledigt", "2025-11-15", 3, "2025-09-01", 650, "2025-11-15", "Marco", 620, "Pünktlich erledigt"],
      ["GAL-004", "Boiler-Entkalkung", "angebot_gesendet", "2026-05-30", 3, "2026-02-01", 1800, null, null, null, "2 Boiler, grosser Aufwand"],
      ["GAL-004", "Filterwechsel", "angebot_akzeptiert", "2026-04-15", 1, "2026-01-20", 350, null, null, null, "Wasserfilter Grünbeck"],
      ["GAL-005", "Tankreinigung", "angebot_akzeptiert", "2026-05-15", 5, "2025-11-20", 2500, null, null, null, "Grosser Tank, aufwändig"],
      ["GAL-005", "Boiler-Entkalkung", "geplant", "2026-08-01", 3, null, null, null, null, null, ""],
      ["GAL-006", "Boiler-Entkalkung", "angebot_gesendet", "2026-07-01", 3, "2026-02-15", 900, null, null, null, ""],
      ["GAL-006", "Filterwechsel", "geplant", "2026-06-01", 2, null, null, null, null, null, "Ölfilter Afriso"],
      ["GAL-007", "Tankreinigung", "erledigt", "2025-10-01", 5, "2025-07-15", 3200, "2025-10-05", "Stefan", 3100, "Erdtank Reinigung"],
      ["GAL-008", "Boiler-Entkalkung", "angebot_akzeptiert", "2026-04-01", 3, "2025-12-20", 1600, null, null, null, "2 Boiler"],
      ["GAL-008", "Filterwechsel", "angebot_akzeptiert", "2026-04-01", 1, "2025-12-20", 450, null, null, null, "Wasserfilter + Ölfilter mit Tigerloop"],
      ["GAL-009", "Boiler-Entkalkung", "angebot_abgelehnt", "2026-06-01", 3, "2026-01-10", 550, null, null, null, "Besitzer will selber machen"],
      ["GAL-010", "Boiler-Entkalkung", "geplant", "2026-09-15", 3, null, null, null, null, null, ""],
      ["GAL-011", "Boiler-Entkalkung", "angebot_gesendet", "2026-06-01", 3, "2026-02-20", 750, null, null, null, "Wärmepumpenboiler"],
      ["GAL-012", "Tankreinigung", "angebot_akzeptiert", "2026-05-20", 5, "2025-12-01", 1200, null, null, null, ""],
      ["GAL-012", "Boiler-Entkalkung", "geplant", "2027-03-01", 3, null, null, null, null, null, "Nächstes Jahr fällig"],
      ["GAL-013", "Boiler-Entkalkung", "angebot_gesendet", "2026-05-01", 3, "2026-01-25", 800, null, null, null, ""],
      ["GAL-014", "Boiler-Entkalkung", "angebot_akzeptiert", "2026-04-10", 3, "2025-11-15", 1400, null, null, null, ""],
      ["GAL-014", "Filterwechsel", "angebot_akzeptiert", "2026-04-10", 1, "2025-11-15", 550, null, null, null, "Ölfilter Tigerloop + Wasserfilter"],
      ["GAL-014", "Tankreinigung", "geplant", "2026-10-01", 5, null, null, null, null, null, "Grosse Tankbatterie"],
      ["GAL-015", "Tankreinigung", "angebot_gesendet", "2026-04-01", 3, "2026-01-05", 4500, null, null, null, "Alter Erdtank, Sonderaufwand"],
      ["GAL-016", "Boiler-Entkalkung", "angebot_akzeptiert", "2026-05-15", 3, "2025-12-15", 950, null, null, null, ""],
      ["GAL-016", "Filterwechsel", "geplant", "2026-06-01", 2, null, null, null, null, null, ""],
      ["GAL-017", "Tankreinigung", "geplant", "2026-08-01", 5, null, null, null, null, null, "Grosser Gewerbe-Erdtank"],
      ["GAL-018", "Boiler-Entkalkung", "angebot_gesendet", "2026-06-15", 3, "2026-02-10", 1100, null, null, null, ""],
      ["GAL-018", "Filterwechsel", "angebot_gesendet", "2026-06-15", 1, "2026-02-10", 280, null, null, null, "Wasserfilter BWT"],
      ["GAL-019", "Boiler-Entkalkung", "angebot_akzeptiert", "2026-05-01", 3, "2026-01-20", 1200, null, null, null, "Premium-Boiler"],
      ["GAL-020", "Boiler-Entkalkung", "geplant", "2026-07-01", 3, null, null, null, null, null, ""],
      ["GAL-020", "Filterwechsel", "geplant", "2026-07-01", 2, null, null, null, null, null, ""],
    ];

    for (const a of auftraege) {
      insertAuftrag.run(...a);
    }

    // === HISTORIE ===
    const historie = [
      ["GAL-001", "2023-06-20", "Boiler-Entkalkung", "Boiler entkalkt, neuer Anodenstab eingesetzt", "Marco", 780, "Alles in Ordnung"],
      ["GAL-001", "2021-09-15", "Tankreinigung", "Tank gereinigt, 5000L, Zustand gut", "Stefan", 1400, ""],
      ["GAL-001", "2020-11-10", "Filterwechsel", "Ölfilter und Tigerloop gewechselt", "Marco", 320, ""],
      ["GAL-001", "2020-06-15", "Boiler-Entkalkung", "Boiler entkalkt", "Marco", 750, ""],
      ["GAL-002", "2023-04-10", "Boiler-Entkalkung", "Grosser Boiler entkalkt, starke Verkalkung", "Stefan", 1150, "Kalk-Region hoch"],
      ["GAL-002", "2021-04-20", "Tankreinigung", "2x 3000L Tanks gereinigt", "Stefan", 2200, ""],
      ["GAL-002", "2020-04-15", "Boiler-Entkalkung", "Boiler entkalkt", "Marco", 1100, ""],
      ["GAL-003", "2025-11-15", "Boiler-Entkalkung", "Wärmepumpenboiler entkalkt, wenig Kalk", "Marco", 620, ""],
      ["GAL-003", "2022-11-20", "Boiler-Entkalkung", "Boiler entkalkt", "Marco", 600, ""],
      ["GAL-004", "2023-05-25", "Boiler-Entkalkung", "2 Boiler entkalkt, Schulanlage", "Stefan", 1700, "Grosser Aufwand"],
      ["GAL-004", "2023-05-25", "Filterwechsel", "Wasserfilter Grünbeck gewechselt", "Stefan", 320, ""],
      ["GAL-005", "2024-01-15", "Boiler-Entkalkung", "Boiler entkalkt", "Marco", 850, ""],
      ["GAL-005", "2021-01-20", "Boiler-Entkalkung", "Boiler entkalkt, Anodenstab erneuert", "Stefan", 900, ""],
      ["GAL-005", "2020-05-10", "Tankreinigung", "10000L Tank gereinigt, Zustand beobachten", "Stefan", 3500, "Tank alt, nächste Reinigung dringend"],
      ["GAL-006", "2023-07-10", "Boiler-Entkalkung", "Kombi-Speicher entkalkt", "Marco", 880, ""],
      ["GAL-007", "2025-10-05", "Tankreinigung", "8000L Erdtank gereinigt", "Stefan", 3100, "Aufwändiger Zugang"],
      ["GAL-007", "2020-10-15", "Tankreinigung", "Erdtank Erstinspektion und Reinigung", "Stefan", 3000, ""],
      ["GAL-008", "2023-04-05", "Boiler-Entkalkung", "2 Boiler entkalkt", "Marco", 1500, ""],
      ["GAL-008", "2023-04-05", "Filterwechsel", "Ölfilter + Tigerloop + Wasserfilter Cillit", "Marco", 420, ""],
      ["GAL-008", "2021-09-20", "Tankreinigung", "2x 3000L Tankbatterie gereinigt", "Stefan", 2400, ""],
      ["GAL-009", "2023-06-10", "Boiler-Entkalkung", "Boiler entkalkt, kleines EFH", "Marco", 520, ""],
      ["GAL-010", "2023-09-20", "Boiler-Entkalkung", "Boiler entkalkt", "Marco", 750, ""],
      ["GAL-012", "2021-05-15", "Tankreinigung", "3000L Tank gereinigt", "Stefan", 1100, ""],
      ["GAL-014", "2023-04-15", "Boiler-Entkalkung", "2x 500L Boiler entkalkt, starke Verkalkung", "Stefan", 1350, "Kalk-Region hoch"],
      ["GAL-014", "2023-04-15", "Filterwechsel", "Tigerloop Ölfilter + Grünbeck Wasserfilter", "Stefan", 520, ""],
      ["GAL-015", "2022-06-01", "Tankreinigung", "15000L Erdtank, aufwändig", "Stefan", 4200, "Tank alt"],
      ["GAL-016", "2023-05-20", "Boiler-Entkalkung", "500L Boiler entkalkt", "Marco", 900, ""],
      ["GAL-019", "2023-05-01", "Boiler-Entkalkung", "Premium-Boiler entkalkt", "Marco", 1150, "Hochwertige Anlage"],
    ];

    for (const h of historie) {
      insertHistorie.run(...h);
    }
  });

  transaction();
}
