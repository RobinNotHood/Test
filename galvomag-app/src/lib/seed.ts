import { getDb } from "./db";

export function seedDatabase(): void {
  const db = getDb();

  const countResult = db.prepare("SELECT COUNT(*) as cnt FROM standorte").get() as { cnt: number };
  if (countResult.cnt > 0) return;

  const insertStandort = db.prepare(`
    INSERT INTO standorte (id, firma, strasse, plz, ort, region, kanton, latitude, longitude, zugang_schluessel, kalk_region, ist_restaurant, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    INSERT INTO historie (standort_id, auftrag_id, datum, typ, beschreibung, techniker, kosten, notizen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWochenplan = db.prepare(`
    INSERT INTO wochenplan (mitarbeiter, datum, standort_id, auftrag_ids, reihenfolge, notizen)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // ---------------------------------------------------------------------------
  // STANDORTE (50 locations)
  // ---------------------------------------------------------------------------
  interface Standort {
    id: string; firma: string; strasse: string; plz: string; ort: string;
    region: string; kanton: string; lat: number; lon: number;
    zugang: string; kalk: string; restaurant: number; notizen: string;
  }

  const standorte: Standort[] = [
    // Furttal (1-8)
    { id: "GAL-001", firma: "Liegenschaft Müller", strasse: "Wehntalerstrasse 12", plz: "8105", ort: "Regensdorf", region: "Furttal", kanton: "ZH", lat: 47.4318, lon: 8.4685, zugang: "Standard 5000er Schlüssel", kalk: "Mittel", restaurant: 0, notizen: "Tiefgarage Zufahrt rechts" },
    { id: "GAL-002", firma: "MFH Brunner AG", strasse: "Feldblumenstrasse 44", plz: "8105", ort: "Regensdorf", region: "Furttal", kanton: "ZH", lat: 47.4340, lon: 8.4710, zugang: "Hauswart kontaktieren", kalk: "Hoch", restaurant: 0, notizen: "6-Familienhaus, Tankraum UG links" },
    { id: "GAL-003", firma: "Senn Immobilien GmbH", strasse: "Dorfstrasse 8", plz: "8104", ort: "Weiningen", region: "Furttal", kanton: "ZH", lat: 47.4218, lon: 8.4365, zugang: "Schlüsselbox Code 2847", kalk: "Mittel", restaurant: 0, notizen: "Zugang über Hofeinfahrt" },
    { id: "GAL-004", firma: "Restaurant Löwen", strasse: "Zürcherstrasse 15", plz: "8104", ort: "Weiningen", region: "Furttal", kanton: "ZH", lat: 47.4225, lon: 8.4352, zugang: "Hintereingang Küche", kalk: "Hoch", restaurant: 1, notizen: "Grossküche, Filter monatlich prüfen" },
    { id: "GAL-005", firma: "Verwaltung Gerber", strasse: "Im Hasel 3", plz: "8108", ort: "Dällikon", region: "Furttal", kanton: "ZH", lat: 47.4345, lon: 8.4475, zugang: "Standard 5000er Schlüssel", kalk: "Niedrig", restaurant: 0, notizen: "" },
    { id: "GAL-006", firma: "Stöckli Bau GmbH", strasse: "Industriestrasse 22", plz: "8112", ort: "Otelfingen", region: "Furttal", kanton: "ZH", lat: 47.4575, lon: 8.3975, zugang: "Empfang melden", kalk: "Mittel", restaurant: 0, notizen: "Gewerbebau, grosser Heizraum" },
    { id: "GAL-007", firma: "Schulhaus Watt", strasse: "Schulhausstrasse 1", plz: "8105", ort: "Watt", region: "Furttal", kanton: "ZH", lat: 47.4265, lon: 8.4882, zugang: "Hausdienst Tel. anrufen", kalk: "Hoch", restaurant: 0, notizen: "Öffentliches Gebäude, Termine nur in Ferien" },
    { id: "GAL-008", firma: "Restaurant Sternen Regensdorf", strasse: "Watterstrasse 99", plz: "8105", ort: "Regensdorf", region: "Furttal", kanton: "ZH", lat: 47.4305, lon: 8.4795, zugang: "Seiteneingang links", kalk: "Hoch", restaurant: 1, notizen: "Grossbetrieb, 2 Boiler, Filter alle 6 Monate" },

    // Glattal (9-15)
    { id: "GAL-009", firma: "Wohnsiedlung Rosengarten", strasse: "Thurgauerstrasse 56", plz: "8050", ort: "Zürich-Oerlikon", region: "Glattal", kanton: "ZH", lat: 47.4115, lon: 8.5475, zugang: "Standard 5000er Schlüssel", kalk: "Hoch", restaurant: 0, notizen: "12 Parteien, Zugang Waschküche" },
    { id: "GAL-010", firma: "EFH Huber", strasse: "Glattalstrasse 18", plz: "8152", ort: "Glattbrugg", region: "Glattal", kanton: "ZH", lat: 47.4335, lon: 8.5620, zugang: "Schlüssel bei Nachbar rechts", kalk: "Mittel", restaurant: 0, notizen: "Einfamilienhaus, kleiner Heizraum" },
    { id: "GAL-011", firma: "Immo Treuhand AG", strasse: "Wallisellen Allee 7", plz: "8304", ort: "Wallisellen", region: "Glattal", kanton: "ZH", lat: 47.4130, lon: 8.5945, zugang: "Schlüsselbox Code 1234", kalk: "Hoch", restaurant: 0, notizen: "Verwaltung 3 Liegenschaften" },
    { id: "GAL-012", firma: "Autowaschanlage Jet", strasse: "Industriestrasse 45", plz: "8152", ort: "Opfikon", region: "Glattal", kanton: "ZH", lat: 47.4325, lon: 8.5705, zugang: "Büro hinten", kalk: "Hoch", restaurant: 0, notizen: "Grosser Wasserverbrauch, Filter oft verkalkt" },
    { id: "GAL-013", firma: "MFH Frei-Zimmermann", strasse: "Schaffhauserstrasse 124", plz: "8302", ort: "Kloten", region: "Glattal", kanton: "ZH", lat: 47.4512, lon: 8.5825, zugang: "Standard 5000er Schlüssel", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-014", firma: "Kirchgemeindehaus Kloten", strasse: "Kirchgasse 4", plz: "8302", ort: "Kloten", region: "Glattal", kanton: "ZH", lat: 47.4518, lon: 8.5850, zugang: "Sekretariat Mo-Fr 8-12", kalk: "Mittel", restaurant: 0, notizen: "Gemeindeeigentum" },
    { id: "GAL-015", firma: "Metzgerei Keller", strasse: "Marktgasse 11", plz: "8302", ort: "Kloten", region: "Glattal", kanton: "ZH", lat: 47.4520, lon: 8.5842, zugang: "Lieferanteneingang", kalk: "Hoch", restaurant: 1, notizen: "Lebensmittelbetrieb, strenge Hygienevorschriften" },

    // Wehntal (16-21)
    { id: "GAL-016", firma: "Bauernhof Maag", strasse: "Oberdorfstrasse 5", plz: "8165", ort: "Schleinikon", region: "Wehntal", kanton: "ZH", lat: 47.4750, lon: 8.4120, zugang: "Hofzufahrt, Hund beachten", kalk: "Niedrig", restaurant: 0, notizen: "Alter Öltank 1985, bald ersetzen" },
    { id: "GAL-017", firma: "Gemeinde Niederweningen", strasse: "Gemeindehaus Dorfstrasse 1", plz: "8166", ort: "Niederweningen", region: "Wehntal", kanton: "ZH", lat: 47.4985, lon: 8.3640, zugang: "Gemeindekanzlei", kalk: "Niedrig", restaurant: 0, notizen: "Mehrere Gemeindegebäude" },
    { id: "GAL-018", firma: "Alterszentrum Am Bach", strasse: "Bachstrasse 22", plz: "8165", ort: "Oberweningen", region: "Wehntal", kanton: "ZH", lat: 47.4890, lon: 8.3855, zugang: "Empfang EG", kalk: "Mittel", restaurant: 0, notizen: "Seniorenheim, Arbeiten leise ausführen" },
    { id: "GAL-019", firma: "EFH Eigenmann", strasse: "Rebbergweg 14", plz: "8172", ort: "Niederglatt", region: "Wehntal", kanton: "ZH", lat: 47.4795, lon: 8.5015, zugang: "Schlüssel unter Matte", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-020", firma: "Weingut Schneider", strasse: "Weinbergstrasse 3", plz: "8173", ort: "Neerach", region: "Wehntal", kanton: "ZH", lat: 47.4955, lon: 8.4565, zugang: "Direktkontakt Eigentümer", kalk: "Niedrig", restaurant: 0, notizen: "Weinkeller Temperatur beachten" },
    { id: "GAL-021", firma: "Turnhalle Schöfflisdorf", strasse: "Sportplatzweg 1", plz: "8165", ort: "Schöfflisdorf", region: "Wehntal", kanton: "ZH", lat: 47.4828, lon: 8.4020, zugang: "Gemeindeschlüssel", kalk: "Niedrig", restaurant: 0, notizen: "Öffentliches Gebäude" },

    // Unterland (22-28)
    { id: "GAL-022", firma: "Überbauung Bülach Nord", strasse: "Schützenmattstrasse 30", plz: "8180", ort: "Bülach", region: "Unterland", kanton: "ZH", lat: 47.5215, lon: 8.5395, zugang: "Standard 5000er Schlüssel", kalk: "Mittel", restaurant: 0, notizen: "Grosse Siedlung, 24 Parteien" },
    { id: "GAL-023", firma: "Hotel & Restaurant Kronenhof", strasse: "Bahnhofstrasse 18", plz: "8180", ort: "Bülach", region: "Unterland", kanton: "ZH", lat: 47.5198, lon: 8.5410, zugang: "Rezeption fragen", kalk: "Hoch", restaurant: 1, notizen: "Hotel mit Restaurant, 2 Grossboiler" },
    { id: "GAL-024", firma: "Primarschule Embrach", strasse: "Schulweg 8", plz: "8424", ort: "Embrach", region: "Unterland", kanton: "ZH", lat: 47.5068, lon: 8.5935, zugang: "Hauswart Hr. Portmann", kalk: "Mittel", restaurant: 0, notizen: "Schulgebäude, Ferien beachten" },
    { id: "GAL-025", firma: "EFH Ammann", strasse: "Winzerstrasse 7", plz: "8416", ort: "Flaach", region: "Unterland", kanton: "ZH", lat: 47.5720, lon: 8.6265, zugang: "Direkt beim Eigentümer", kalk: "Niedrig", restaurant: 0, notizen: "Neueres Haus, Baujahr 2015" },
    { id: "GAL-026", firma: "Gewerbehaus Eglisau", strasse: "Obergass 12", plz: "8193", ort: "Eglisau", region: "Unterland", kanton: "ZH", lat: 47.5748, lon: 8.5225, zugang: "Schlüsselbox Code 9910", kalk: "Mittel", restaurant: 0, notizen: "Mischnutzung Gewerbe/Wohnen" },
    { id: "GAL-027", firma: "Bürkli Verwaltungen", strasse: "Steinackerstrasse 3", plz: "8180", ort: "Bülach", region: "Unterland", kanton: "ZH", lat: 47.5205, lon: 8.5365, zugang: "Standard 5000er Schlüssel", kalk: "Hoch", restaurant: 0, notizen: "3 Liegenschaften in Verwaltung" },
    { id: "GAL-028", firma: "Rafzerfeld Wohnbau", strasse: "Badenerstrasse 22", plz: "8197", ort: "Rafz", region: "Unterland", kanton: "ZH", lat: 47.6060, lon: 8.5405, zugang: "Hauswart kontaktieren", kalk: "Niedrig", restaurant: 0, notizen: "Neubausiedlung, Tank 2019" },

    // Limmattal (29-35)
    { id: "GAL-029", firma: "Wohnüberbauung Spital", strasse: "Spitalstrasse 10", plz: "8952", ort: "Schlieren", region: "Limmattal", kanton: "ZH", lat: 47.3960, lon: 8.4490, zugang: "Standard 5000er Schlüssel", kalk: "Hoch", restaurant: 0, notizen: "Grosse Liegenschaft, langer Kellergang" },
    { id: "GAL-030", firma: "Trattoria Da Giovanni", strasse: "Zürcherstrasse 57", plz: "8953", ort: "Dietikon", region: "Limmattal", kanton: "ZH", lat: 47.4035, lon: 8.3980, zugang: "Seiteneingang Parkplatz", kalk: "Hoch", restaurant: 1, notizen: "Italienisches Restaurant, hoher Wasserverbrauch" },
    { id: "GAL-031", firma: "Alters- und Pflegeheim Dietikon", strasse: "Heimstrasse 5", plz: "8953", ort: "Dietikon", region: "Limmattal", kanton: "ZH", lat: 47.4020, lon: 8.4010, zugang: "Empfang melden", kalk: "Hoch", restaurant: 0, notizen: "Grosser Boiler, 200L, viel Kalk" },
    { id: "GAL-032", firma: "MFH Widmer Erben", strasse: "Bernstrasse 15", plz: "8952", ort: "Schlieren", region: "Limmattal", kanton: "ZH", lat: 47.3968, lon: 8.4470, zugang: "Schlüssel bei Hauswart Keller", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-033", firma: "Genossenschaft Sonnenhof", strasse: "Sonnenhofweg 4", plz: "8902", ort: "Urdorf", region: "Limmattal", kanton: "ZH", lat: 47.3860, lon: 8.4250, zugang: "Standard 5000er Schlüssel", kalk: "Mittel", restaurant: 0, notizen: "20 Wohnungen, 2 Tankräume" },
    { id: "GAL-034", firma: "Coop Filiale Geroldswil", strasse: "Huebwiesenstrasse 2", plz: "8954", ort: "Geroldswil", region: "Limmattal", kanton: "ZH", lat: 47.4085, lon: 8.4175, zugang: "Filialleitung kontaktieren", kalk: "Hoch", restaurant: 0, notizen: "Grossfläche, Klimaanlage beachten" },
    { id: "GAL-035", firma: "EFH Bachmann", strasse: "Birmensdorferstrasse 8", plz: "8903", ort: "Birmensdorf", region: "Limmattal", kanton: "ZH", lat: 47.3585, lon: 8.4405, zugang: "Schlüssel bei Nachbar Nr. 6", kalk: "Niedrig", restaurant: 0, notizen: "" },

    // Winterthur (36-41)
    { id: "GAL-036", firma: "Liegenschaft Steiner Winterthur", strasse: "Technikumstrasse 28", plz: "8400", ort: "Winterthur", region: "Winterthur", kanton: "ZH", lat: 47.4985, lon: 8.7285, zugang: "Standard 5000er Schlüssel", kalk: "Hoch", restaurant: 0, notizen: "Altbau, enger Treppenabgang" },
    { id: "GAL-037", firma: "MFH Altstadt Winterthur", strasse: "Marktgasse 42", plz: "8400", ort: "Winterthur", region: "Winterthur", kanton: "ZH", lat: 47.4990, lon: 8.7245, zugang: "Hauswart Erdgeschoss", kalk: "Hoch", restaurant: 0, notizen: "Denkmalgeschützt, vorsichtig arbeiten" },
    { id: "GAL-038", firma: "Industriegebäude Seen", strasse: "Seestrasse 105", plz: "8405", ort: "Winterthur-Seen", region: "Winterthur", kanton: "ZH", lat: 47.4785, lon: 8.7565, zugang: "Pforte Werksgelände", kalk: "Mittel", restaurant: 0, notizen: "Grosse Heizanlage, 2 Tanks" },
    { id: "GAL-039", firma: "Seniorenresidenz Rosenberg", strasse: "Rosenbergstrasse 12", plz: "8400", ort: "Winterthur", region: "Winterthur", kanton: "ZH", lat: 47.5010, lon: 8.7310, zugang: "Empfang", kalk: "Hoch", restaurant: 0, notizen: "55 Wohnungen, grosser Heizbedarf" },
    { id: "GAL-040", firma: "EFH Zeller", strasse: "Lindbergstrasse 5", plz: "8404", ort: "Winterthur-Oberwinterthur", region: "Winterthur", kanton: "ZH", lat: 47.5125, lon: 8.7585, zugang: "Direkt beim Eigentümer", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-041", firma: "Gasthof Adler Winterthur", strasse: "Obertor 10", plz: "8400", ort: "Winterthur", region: "Winterthur", kanton: "ZH", lat: 47.4995, lon: 8.7255, zugang: "Küche Hintereingang", kalk: "Hoch", restaurant: 1, notizen: "Traditionsgasthaus, 2 Boiler, häufige Entkalkung" },

    // Baden (42-46)
    { id: "GAL-042", firma: "Bäder-Quartier Verwaltung", strasse: "Bäderstrasse 24", plz: "5400", ort: "Baden", region: "Baden", kanton: "AG", lat: 47.4735, lon: 8.3065, zugang: "Hausverwaltung", kalk: "Hoch", restaurant: 0, notizen: "Thermalwasser-Gebiet, extremer Kalk" },
    { id: "GAL-043", firma: "MFH Spreitenbach Zentrum", strasse: "Bahnhofstrasse 33", plz: "8957", ort: "Spreitenbach", region: "Baden", kanton: "AG", lat: 47.4225, lon: 8.3665, zugang: "Standard 5000er Schlüssel", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-044", firma: "Gewerbepark Wettingen", strasse: "Landstrasse 88", plz: "5430", ort: "Wettingen", region: "Baden", kanton: "AG", lat: 47.4625, lon: 8.3175, zugang: "Verwaltung EG", kalk: "Hoch", restaurant: 0, notizen: "Mischnutzung, mehrere Mieter" },
    { id: "GAL-045", firma: "EFH Hofer", strasse: "Sonnhaldenweg 9", plz: "5442", ort: "Fislisbach", region: "Baden", kanton: "AG", lat: 47.4510, lon: 8.3095, zugang: "Direktkontakt Eigentümer", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-046", firma: "Schulanlage Ennetbaden", strasse: "Grabenstrasse 16", plz: "5408", ort: "Ennetbaden", region: "Baden", kanton: "AG", lat: 47.4802, lon: 8.3155, zugang: "Schulleitung/Hauswart", kalk: "Hoch", restaurant: 0, notizen: "Grossanlage, 3 Boiler" },

    // Zürcher Oberland (47-50)
    { id: "GAL-047", firma: "MFH Wetzikon Zentral", strasse: "Bahnhofstrasse 19", plz: "8620", ort: "Wetzikon", region: "Zürcher Oberland", kanton: "ZH", lat: 47.3265, lon: 8.7975, zugang: "Standard 5000er Schlüssel", kalk: "Mittel", restaurant: 0, notizen: "" },
    { id: "GAL-048", firma: "Baugenossenschaft Hinwil", strasse: "Wässeristrasse 6", plz: "8340", ort: "Hinwil", region: "Zürcher Oberland", kanton: "ZH", lat: 47.2975, lon: 8.8430, zugang: "Hauswart Fr. Bühler", kalk: "Niedrig", restaurant: 0, notizen: "3 Blöcke, je ein Tankraum" },
    { id: "GAL-049", firma: "Landgasthof Rössli Wald", strasse: "Tösstalstrasse 40", plz: "8636", ort: "Wald", region: "Zürcher Oberland", kanton: "ZH", lat: 47.2775, lon: 8.9130, zugang: "Wirtin direkt", kalk: "Niedrig", restaurant: 1, notizen: "Kleines Restaurant, 1 Boiler" },
    { id: "GAL-050", firma: "EFH Rüegg", strasse: "Allmenstrasse 2", plz: "8626", ort: "Ottikon", region: "Zürcher Oberland", kanton: "ZH", lat: 47.3390, lon: 8.7685, zugang: "Direktkontakt", kalk: "Niedrig", restaurant: 0, notizen: "Neubau 2020" },
  ];

  // ---------------------------------------------------------------------------
  // KONTAKTE (1-3 per standort, ~120 total)
  // ---------------------------------------------------------------------------
  interface Kontakt {
    standort_id: string; typ: string; name: string; telefon: string; email: string; notizen: string;
  }

  const kontakte: Kontakt[] = [
    // GAL-001
    { standort_id: "GAL-001", typ: "Eigentümer", name: "Hans Müller", telefon: "079 324 55 12", email: "hans.mueller@bluewin.ch", notizen: "" },
    { standort_id: "GAL-001", typ: "Hausabwart", name: "Pedro Fernandez", telefon: "078 612 34 98", email: "p.fernandez@gmx.ch", notizen: "Spricht wenig Deutsch" },
    // GAL-002
    { standort_id: "GAL-002", typ: "Verwaltung", name: "Claudia Brunner", telefon: "044 842 12 00", email: "c.brunner@brunner-ag.ch", notizen: "Geschäftsführerin" },
    { standort_id: "GAL-002", typ: "Hausabwart", name: "Dragan Petrovic", telefon: "076 455 88 21", email: "", notizen: "Mo-Fr vor 16 Uhr erreichbar" },
    // GAL-003
    { standort_id: "GAL-003", typ: "Verwaltung", name: "Martin Senn", telefon: "044 750 22 33", email: "info@senn-immo.ch", notizen: "" },
    { standort_id: "GAL-003", typ: "Hausabwart", name: "Beat Widmer", telefon: "079 345 67 89", email: "beat.widmer@sunrise.ch", notizen: "" },
    // GAL-004
    { standort_id: "GAL-004", typ: "Eigentümer", name: "Giuseppe Rossi", telefon: "079 812 45 33", email: "g.rossi@loewen-weiningen.ch", notizen: "Wirt und Eigentümer" },
    // GAL-005
    { standort_id: "GAL-005", typ: "Verwaltung", name: "Markus Gerber", telefon: "044 844 90 10", email: "m.gerber@verwaltung-gerber.ch", notizen: "" },
    { standort_id: "GAL-005", typ: "Hausabwart", name: "Rolf Meier", telefon: "078 234 56 78", email: "", notizen: "" },
    // GAL-006
    { standort_id: "GAL-006", typ: "Eigentümer", name: "Andreas Stöckli", telefon: "079 100 20 30", email: "a.stoeckli@stoeckli-bau.ch", notizen: "Inhaber" },
    { standort_id: "GAL-006", typ: "Hausabwart", name: "Enver Hoxha", telefon: "076 912 34 56", email: "", notizen: "" },
    // GAL-007
    { standort_id: "GAL-007", typ: "Verwaltung", name: "Gemeinde Regensdorf", telefon: "044 842 62 62", email: "liegenschaften@regensdorf.ch", notizen: "" },
    { standort_id: "GAL-007", typ: "Hausabwart", name: "Thomas Frei", telefon: "079 456 12 34", email: "t.frei@schulen-regensdorf.ch", notizen: "" },
    // GAL-008
    { standort_id: "GAL-008", typ: "Eigentümer", name: "Walter Bühler", telefon: "079 555 66 77", email: "info@sternen-regensdorf.ch", notizen: "Geschäftsführer" },
    { standort_id: "GAL-008", typ: "Hausabwart", name: "Arben Krasniqi", telefon: "076 200 30 40", email: "", notizen: "" },
    // GAL-009
    { standort_id: "GAL-009", typ: "Verwaltung", name: "Livit AG", telefon: "058 360 33 33", email: "zurich@livit.ch", notizen: "Grossverwaltung" },
    { standort_id: "GAL-009", typ: "Hausabwart", name: "Ali Yilmaz", telefon: "078 345 67 12", email: "", notizen: "" },
    { standort_id: "GAL-009", typ: "Eigentümer", name: "Pensionskasse Zürich", telefon: "044 412 50 50", email: "immobilien@pkzh.ch", notizen: "" },
    // GAL-010
    { standort_id: "GAL-010", typ: "Eigentümer", name: "Heidi Huber", telefon: "079 888 12 34", email: "heidi.huber@gmail.com", notizen: "" },
    // GAL-011
    { standort_id: "GAL-011", typ: "Verwaltung", name: "Immo Treuhand AG", telefon: "044 830 55 55", email: "info@immo-treuhand.ch", notizen: "" },
    { standort_id: "GAL-011", typ: "Hausabwart", name: "Josef Knecht", telefon: "079 123 45 67", email: "j.knecht@bluewin.ch", notizen: "" },
    // GAL-012
    { standort_id: "GAL-012", typ: "Eigentümer", name: "Autowaschanlage Jet GmbH", telefon: "044 810 20 30", email: "info@jet-wash.ch", notizen: "" },
    // GAL-013
    { standort_id: "GAL-013", typ: "Verwaltung", name: "Urs Frei", telefon: "044 814 55 66", email: "urs.frei@frei-zimmermann.ch", notizen: "" },
    { standort_id: "GAL-013", typ: "Hausabwart", name: "Marcel Burger", telefon: "076 543 21 09", email: "", notizen: "" },
    // GAL-014
    { standort_id: "GAL-014", typ: "Verwaltung", name: "Ref. Kirchgemeinde Kloten", telefon: "044 813 22 11", email: "sekretariat@ref-kloten.ch", notizen: "" },
    // GAL-015
    { standort_id: "GAL-015", typ: "Eigentümer", name: "Fritz Keller", telefon: "079 700 80 90", email: "f.keller@metzgerei-keller.ch", notizen: "Metzgermeister" },
    { standort_id: "GAL-015", typ: "Hausabwart", name: "Silvio Costa", telefon: "078 112 23 34", email: "", notizen: "" },
    // GAL-016
    { standort_id: "GAL-016", typ: "Eigentümer", name: "Werner Maag", telefon: "079 234 56 00", email: "w.maag@bluewin.ch", notizen: "Landwirt" },
    // GAL-017
    { standort_id: "GAL-017", typ: "Verwaltung", name: "Gemeindeverwaltung Niederweningen", telefon: "044 857 12 12", email: "gemeinde@niederweningen.ch", notizen: "" },
    { standort_id: "GAL-017", typ: "Hausabwart", name: "Christian Baumgartner", telefon: "079 650 43 21", email: "c.baumgartner@niederweningen.ch", notizen: "" },
    // GAL-018
    { standort_id: "GAL-018", typ: "Verwaltung", name: "Stiftung Am Bach", telefon: "044 856 10 00", email: "verwaltung@ambach.ch", notizen: "" },
    { standort_id: "GAL-018", typ: "Hausabwart", name: "Patrick Studer", telefon: "079 100 55 66", email: "p.studer@ambach.ch", notizen: "" },
    // GAL-019
    { standort_id: "GAL-019", typ: "Eigentümer", name: "Manfred Eigenmann", telefon: "079 445 67 89", email: "m.eigenmann@sunrise.ch", notizen: "" },
    // GAL-020
    { standort_id: "GAL-020", typ: "Eigentümer", name: "Rudolf Schneider", telefon: "079 302 45 67", email: "info@weingut-schneider.ch", notizen: "Winzer, oft im Rebberg" },
    // GAL-021
    { standort_id: "GAL-021", typ: "Verwaltung", name: "Gemeinde Schöfflisdorf", telefon: "044 872 10 20", email: "gemeinde@schoefflisdorf.ch", notizen: "" },
    // GAL-022
    { standort_id: "GAL-022", typ: "Verwaltung", name: "Wincasa AG", telefon: "0848 100 200", email: "zuerich@wincasa.ch", notizen: "" },
    { standort_id: "GAL-022", typ: "Hausabwart", name: "Edin Hasanovic", telefon: "076 900 12 34", email: "", notizen: "" },
    { standort_id: "GAL-022", typ: "Eigentümer", name: "CS Anlagestiftung", telefon: "044 333 75 75", email: "", notizen: "" },
    // GAL-023
    { standort_id: "GAL-023", typ: "Eigentümer", name: "Familie Krone", telefon: "044 862 11 22", email: "info@kronenhof-buelach.ch", notizen: "Hoteliers in 3. Generation" },
    { standort_id: "GAL-023", typ: "Hausabwart", name: "Marco Biundo", telefon: "078 456 78 90", email: "", notizen: "" },
    // GAL-024
    { standort_id: "GAL-024", typ: "Verwaltung", name: "Schulverwaltung Embrach", telefon: "044 866 40 50", email: "schulverwaltung@embrach.ch", notizen: "" },
    { standort_id: "GAL-024", typ: "Hausabwart", name: "Daniel Portmann", telefon: "079 789 01 23", email: "d.portmann@embrach.ch", notizen: "" },
    // GAL-025
    { standort_id: "GAL-025", typ: "Eigentümer", name: "Stefan Ammann", telefon: "079 555 11 22", email: "stefan.ammann@gmail.com", notizen: "" },
    // GAL-026
    { standort_id: "GAL-026", typ: "Verwaltung", name: "Gewerbehaus Eglisau AG", telefon: "044 867 22 33", email: "info@gewerbehaus-eglisau.ch", notizen: "" },
    { standort_id: "GAL-026", typ: "Hausabwart", name: "Bruno Schmid", telefon: "076 321 45 67", email: "", notizen: "" },
    // GAL-027
    { standort_id: "GAL-027", typ: "Verwaltung", name: "Heinz Bürkli", telefon: "044 860 15 15", email: "h.buerkli@buerkli-verwaltungen.ch", notizen: "Verwalter" },
    { standort_id: "GAL-027", typ: "Hausabwart", name: "Ismet Sejdiu", telefon: "078 678 90 12", email: "", notizen: "" },
    // GAL-028
    { standort_id: "GAL-028", typ: "Verwaltung", name: "Rafzerfeld Wohnbau AG", telefon: "044 869 33 44", email: "info@rafzerfeld-wohnbau.ch", notizen: "" },
    { standort_id: "GAL-028", typ: "Hausabwart", name: "Roger Bachmann", telefon: "079 234 10 20", email: "", notizen: "" },
    // GAL-029
    { standort_id: "GAL-029", typ: "Verwaltung", name: "PRIVERA AG", telefon: "058 105 30 00", email: "schlieren@privera.ch", notizen: "" },
    { standort_id: "GAL-029", typ: "Hausabwart", name: "Mustafa Özcan", telefon: "076 890 12 34", email: "", notizen: "" },
    // GAL-030
    { standort_id: "GAL-030", typ: "Eigentümer", name: "Giovanni Esposito", telefon: "079 312 45 67", email: "giovanni@dagiovanni.ch", notizen: "Wirt" },
    // GAL-031
    { standort_id: "GAL-031", typ: "Verwaltung", name: "Stadt Dietikon, Liegenschaften", telefon: "044 744 35 35", email: "liegenschaften@dietikon.ch", notizen: "" },
    { standort_id: "GAL-031", typ: "Hausabwart", name: "Peter Schmidlin", telefon: "079 567 89 01", email: "p.schmidlin@dietikon.ch", notizen: "" },
    // GAL-032
    { standort_id: "GAL-032", typ: "Verwaltung", name: "Ruth Widmer", telefon: "044 731 22 33", email: "r.widmer@bluewin.ch", notizen: "Erbengemeinschaft" },
    { standort_id: "GAL-032", typ: "Hausabwart", name: "Nico Keller", telefon: "076 234 56 78", email: "", notizen: "" },
    // GAL-033
    { standort_id: "GAL-033", typ: "Verwaltung", name: "Genossenschaft Sonnenhof", telefon: "044 735 40 50", email: "verwaltung@sonnenhof-urdorf.ch", notizen: "" },
    { standort_id: "GAL-033", typ: "Hausabwart", name: "Mario Luisier", telefon: "078 345 67 89", email: "", notizen: "" },
    // GAL-034
    { standort_id: "GAL-034", typ: "Verwaltung", name: "Coop Immobilien AG", telefon: "061 336 66 66", email: "immobilien@coop.ch", notizen: "" },
    // GAL-035
    { standort_id: "GAL-035", typ: "Eigentümer", name: "Sandra Bachmann", telefon: "079 678 90 12", email: "s.bachmann@sunrise.ch", notizen: "" },
    // GAL-036
    { standort_id: "GAL-036", typ: "Verwaltung", name: "Steiner Immobilien AG", telefon: "052 268 10 10", email: "verwaltung@steiner-immo-winti.ch", notizen: "" },
    { standort_id: "GAL-036", typ: "Hausabwart", name: "Franco Ricci", telefon: "076 456 78 90", email: "", notizen: "" },
    // GAL-037
    { standort_id: "GAL-037", typ: "Eigentümer", name: "Erbengemeinschaft Huber", telefon: "052 212 33 44", email: "huber-erben@bluewin.ch", notizen: "" },
    { standort_id: "GAL-037", typ: "Hausabwart", name: "Roland Schwarz", telefon: "079 890 12 34", email: "", notizen: "" },
    // GAL-038
    { standort_id: "GAL-038", typ: "Eigentümer", name: "Industriepark Seen AG", telefon: "052 235 55 66", email: "info@ip-seen.ch", notizen: "" },
    { standort_id: "GAL-038", typ: "Hausabwart", name: "Viktor Todorovic", telefon: "078 567 89 01", email: "", notizen: "" },
    // GAL-039
    { standort_id: "GAL-039", typ: "Verwaltung", name: "Stiftung Rosenberg", telefon: "052 260 22 22", email: "info@rosenberg-winti.ch", notizen: "" },
    { standort_id: "GAL-039", typ: "Hausabwart", name: "Samuel Wüthrich", telefon: "079 012 34 56", email: "s.wuethrich@rosenberg-winti.ch", notizen: "" },
    // GAL-040
    { standort_id: "GAL-040", typ: "Eigentümer", name: "Thomas Zeller", telefon: "079 345 67 00", email: "t.zeller@gmail.com", notizen: "" },
    // GAL-041
    { standort_id: "GAL-041", typ: "Eigentümer", name: "Ursula Zbinden", telefon: "052 213 44 55", email: "info@adler-winterthur.ch", notizen: "Wirtin" },
    { standort_id: "GAL-041", typ: "Hausabwart", name: "Sandro Mendes", telefon: "076 678 90 12", email: "", notizen: "" },
    // GAL-042
    { standort_id: "GAL-042", typ: "Verwaltung", name: "Baden Immo GmbH", telefon: "056 222 33 44", email: "info@baden-immo.ch", notizen: "" },
    { standort_id: "GAL-042", typ: "Hausabwart", name: "Reto Künzli", telefon: "079 567 89 00", email: "", notizen: "" },
    // GAL-043
    { standort_id: "GAL-043", typ: "Verwaltung", name: "Hälg Verwaltungen", telefon: "056 401 55 66", email: "info@haelg-verwaltungen.ch", notizen: "" },
    { standort_id: "GAL-043", typ: "Hausabwart", name: "Blerim Gashi", telefon: "078 789 01 23", email: "", notizen: "" },
    // GAL-044
    { standort_id: "GAL-044", typ: "Eigentümer", name: "Gewerbepark Wettingen AG", telefon: "056 427 10 20", email: "info@gewerbepark-wettingen.ch", notizen: "" },
    // GAL-045
    { standort_id: "GAL-045", typ: "Eigentümer", name: "Daniel Hofer", telefon: "079 123 44 55", email: "d.hofer@bluewin.ch", notizen: "" },
    // GAL-046
    { standort_id: "GAL-046", typ: "Verwaltung", name: "Gemeinde Ennetbaden", telefon: "056 200 06 06", email: "gemeinde@ennetbaden.ch", notizen: "" },
    { standort_id: "GAL-046", typ: "Hausabwart", name: "Remo Giger", telefon: "079 890 10 20", email: "r.giger@ennetbaden.ch", notizen: "" },
    // GAL-047
    { standort_id: "GAL-047", typ: "Verwaltung", name: "Homegate Verwaltung AG", telefon: "044 711 22 33", email: "wetzikon@homegate-verwaltung.ch", notizen: "" },
    { standort_id: "GAL-047", typ: "Hausabwart", name: "Erwin Schneebeli", telefon: "076 901 23 45", email: "", notizen: "" },
    // GAL-048
    { standort_id: "GAL-048", typ: "Verwaltung", name: "Baugenossenschaft Hinwil", telefon: "044 938 50 60", email: "info@bghw.ch", notizen: "" },
    { standort_id: "GAL-048", typ: "Hausabwart", name: "Sonja Bühler", telefon: "079 234 56 70", email: "s.buehler@bghw.ch", notizen: "" },
    // GAL-049
    { standort_id: "GAL-049", typ: "Eigentümer", name: "Maria Rüegg", telefon: "079 456 78 90", email: "info@roessli-wald.ch", notizen: "Wirtin" },
    // GAL-050
    { standort_id: "GAL-050", typ: "Eigentümer", name: "Christoph Rüegg", telefon: "079 567 89 10", email: "c.rueegg@outlook.com", notizen: "" },

    // Extra contacts to reach 100+
    { standort_id: "GAL-001", typ: "Verwaltung", name: "Immoservice Furttal GmbH", telefon: "044 840 12 00", email: "info@immoservice-furttal.ch", notizen: "" },
    { standort_id: "GAL-009", typ: "Hausabwart", name: "Dejan Markovic", telefon: "078 100 20 30", email: "", notizen: "Stellvertreter" },
    { standort_id: "GAL-022", typ: "Hausabwart", name: "Luca Bernasconi", telefon: "076 234 12 34", email: "", notizen: "Stellvertreter Wochenende" },
    { standort_id: "GAL-029", typ: "Eigentümer", name: "Zürich Versicherung Immobilien", telefon: "044 628 28 28", email: "immobilien@zurich.ch", notizen: "" },
    { standort_id: "GAL-033", typ: "Eigentümer", name: "Genossenschaftsvorstand", telefon: "044 735 40 51", email: "vorstand@sonnenhof-urdorf.ch", notizen: "" },
    { standort_id: "GAL-036", typ: "Eigentümer", name: "Steiner Holding AG", telefon: "052 268 10 20", email: "holding@steiner-ag.ch", notizen: "" },
    { standort_id: "GAL-039", typ: "Eigentümer", name: "Stiftungsrat Rosenberg", telefon: "052 260 22 23", email: "stiftungsrat@rosenberg-winti.ch", notizen: "" },
    { standort_id: "GAL-042", typ: "Eigentümer", name: "Bäder-Quartier Stiftung", telefon: "056 222 44 55", email: "stiftung@baeder-quartier.ch", notizen: "" },
    { standort_id: "GAL-044", typ: "Hausabwart", name: "Claudio Antonelli", telefon: "078 890 12 30", email: "", notizen: "" },
    { standort_id: "GAL-048", typ: "Eigentümer", name: "Genossenschaftsvorstand Hinwil", telefon: "044 938 50 61", email: "vorstand@bghw.ch", notizen: "" },
    { standort_id: "GAL-031", typ: "Eigentümer", name: "Stadt Dietikon", telefon: "044 744 35 00", email: "info@dietikon.ch", notizen: "" },
    { standort_id: "GAL-017", typ: "Eigentümer", name: "Gemeinde Niederweningen", telefon: "044 857 12 00", email: "info@niederweningen.ch", notizen: "" },
    { standort_id: "GAL-007", typ: "Eigentümer", name: "Gemeinde Regensdorf", telefon: "044 842 62 00", email: "info@regensdorf.ch", notizen: "" },
    { standort_id: "GAL-014", typ: "Hausabwart", name: "Ueli Graf", telefon: "079 301 45 67", email: "", notizen: "" },
    { standort_id: "GAL-046", typ: "Eigentümer", name: "Gemeinde Ennetbaden Liegensch.", telefon: "056 200 06 07", email: "liegenschaften@ennetbaden.ch", notizen: "" },
    { standort_id: "GAL-006", typ: "Verwaltung", name: "Stöckli Bau Verwaltung", telefon: "044 844 20 30", email: "verwaltung@stoeckli-bau.ch", notizen: "" },
    { standort_id: "GAL-018", typ: "Eigentümer", name: "Stiftungsrat Am Bach", telefon: "044 856 10 01", email: "stiftungsrat@ambach.ch", notizen: "" },
    { standort_id: "GAL-021", typ: "Hausabwart", name: "Werner Pfister", telefon: "079 456 78 12", email: "", notizen: "Teilzeit Hauswart" },
    { standort_id: "GAL-024", typ: "Eigentümer", name: "Gemeinde Embrach", telefon: "044 866 40 00", email: "info@embrach.ch", notizen: "" },
    { standort_id: "GAL-026", typ: "Eigentümer", name: "Erbengemeinschaft Schwarz", telefon: "044 867 22 00", email: "", notizen: "" },
    { standort_id: "GAL-034", typ: "Hausabwart", name: "Armin Thalmann", telefon: "076 567 89 01", email: "", notizen: "Technischer Dienst" },
    { standort_id: "GAL-037", typ: "Verwaltung", name: "Verwaltung Huber Winterthur", telefon: "052 212 33 00", email: "verwaltung@huber-winti.ch", notizen: "" },
    { standort_id: "GAL-040", typ: "Hausabwart", name: "Kurt Lehmann", telefon: "079 678 12 34", email: "", notizen: "Nachbar hilft mit" },
    { standort_id: "GAL-047", typ: "Eigentümer", name: "Immofonds Wetzikon", telefon: "044 711 22 00", email: "info@immofonds-wetzikon.ch", notizen: "" },
    { standort_id: "GAL-050", typ: "Hausabwart", name: "Felix Baumann", telefon: "078 234 56 70", email: "", notizen: "Nachbar als Ansprechperson" },
  ];

  // ---------------------------------------------------------------------------
  // ANLAGEN (2-5 per standort, ~170 total)
  // ---------------------------------------------------------------------------
  interface Anlage {
    standort_id: string; typ: string; modell: string; hersteller: string;
    baujahr: number; kapazitaet: string; hat_tigerloop: number;
    filter_modell: string; notizen: string;
  }

  const anlagen: Anlage[] = [
    // GAL-001
    { standort_id: "GAL-001", typ: "Öltank", modell: "KWT 2000", hersteller: "Roth", baujahr: 2005, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-001", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2010, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-001", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2010, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-002
    { standort_id: "GAL-002", typ: "Öltank", modell: "Tank 3000 Duo", hersteller: "Werit", baujahr: 2000, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Doppelwandiger Stahltank" },
    { standort_id: "GAL-002", typ: "Boiler", modell: "SBB 301", hersteller: "Stiebel Eltron", baujahr: 2012, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-002", typ: "Wasserfilter", modell: "AQA life S", hersteller: "BWT", baujahr: 2018, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "Kalkschutzanlage" },
    { standort_id: "GAL-002", typ: "Heizung", modell: "Vitola 200", hersteller: "Viessmann", baujahr: 2000, kapazitaet: "25kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-003
    { standort_id: "GAL-003", typ: "Öltank", modell: "Variol", hersteller: "Roth", baujahr: 2008, kapazitaet: "1500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-003", typ: "Boiler", modell: "Logalux SU", hersteller: "Buderus", baujahr: 2014, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-003", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2014, kapazitaet: "", hat_tigerloop: 0, filter_modell: "Siku 50-75", notizen: "" },
    // GAL-004 (Restaurant)
    { standort_id: "GAL-004", typ: "Boiler", modell: "UltraSteel 300", hersteller: "Hoval", baujahr: 2016, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "Grossküchen-Boiler" },
    { standort_id: "GAL-004", typ: "Wasserfilter", modell: "AQA drink Pro 20", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filterkerze", notizen: "Für Gastroküche" },
    { standort_id: "GAL-004", typ: "Heizung", modell: "UltraGas 15", hersteller: "Hoval", baujahr: 2016, kapazitaet: "15kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-005
    { standort_id: "GAL-005", typ: "Öltank", modell: "FuelMaster 2500", hersteller: "Werit", baujahr: 2003, kapazitaet: "2500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-005", typ: "Boiler", modell: "DHE SL", hersteller: "Stiebel Eltron", baujahr: 2015, kapazitaet: "150L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-006
    { standort_id: "GAL-006", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 1998, kapazitaet: "5000L", hat_tigerloop: 0, filter_modell: "", notizen: "Grosser Gewerbetank" },
    { standort_id: "GAL-006", typ: "Boiler", modell: "Logalux SU 400", hersteller: "Buderus", baujahr: 2012, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-006", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2005, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    { standort_id: "GAL-006", typ: "Heizung", modell: "Logano G125", hersteller: "Buderus", baujahr: 1998, kapazitaet: "40kW", hat_tigerloop: 0, filter_modell: "", notizen: "Alter Kessel" },
    // GAL-007
    { standort_id: "GAL-007", typ: "Öltank", modell: "KWT 4000", hersteller: "Roth", baujahr: 2002, kapazitaet: "4000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-007", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-007", typ: "Wasserfilter", modell: "E1 Einhebelfilter", hersteller: "BWT", baujahr: 2019, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    // GAL-008 (Restaurant)
    { standort_id: "GAL-008", typ: "Boiler", modell: "UltraSteel 400", hersteller: "Hoval", baujahr: 2014, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "Hauptboiler Küche" },
    { standort_id: "GAL-008", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2018, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "Zusatzboiler Gasträume" },
    { standort_id: "GAL-008", typ: "Wasserfilter", modell: "AQA drink Pro 20", hersteller: "BWT", baujahr: 2019, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filterkerze", notizen: "" },
    { standort_id: "GAL-008", typ: "Heizung", modell: "Vitola 200", hersteller: "Viessmann", baujahr: 2005, kapazitaet: "30kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-008", typ: "Öltank", modell: "Tank 3000 Duo", hersteller: "Werit", baujahr: 2005, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-009
    { standort_id: "GAL-009", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 1995, kapazitaet: "6000L", hat_tigerloop: 0, filter_modell: "", notizen: "2 Tanks à 3000L" },
    { standort_id: "GAL-009", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2010, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "Grossboiler" },
    { standort_id: "GAL-009", typ: "Wasserfilter", modell: "AQA life S", hersteller: "BWT", baujahr: 2017, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    { standort_id: "GAL-009", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2005, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-010
    { standort_id: "GAL-010", typ: "Öltank", modell: "Variol", hersteller: "Roth", baujahr: 2010, kapazitaet: "1500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-010", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2015, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-011
    { standort_id: "GAL-011", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2006, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-011", typ: "Boiler", modell: "Logalux SU 300", hersteller: "Buderus", baujahr: 2013, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-011", typ: "Wasserfilter", modell: "E1 Einhebelfilter", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    { standort_id: "GAL-011", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2013, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-012
    { standort_id: "GAL-012", typ: "Wasserfilter", modell: "AQA perla", hersteller: "BWT", baujahr: 2019, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Perla Tabs", notizen: "Entkalkung Waschanlage" },
    { standort_id: "GAL-012", typ: "Boiler", modell: "DHE SL 18", hersteller: "Stiebel Eltron", baujahr: 2019, kapazitaet: "18kW", hat_tigerloop: 0, filter_modell: "", notizen: "Durchlauferhitzer" },
    // GAL-013
    { standort_id: "GAL-013", typ: "Öltank", modell: "FuelMaster 2000", hersteller: "Werit", baujahr: 2004, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-013", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2016, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-013", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2010, kapazitaet: "", hat_tigerloop: 0, filter_modell: "Siku 50-75", notizen: "" },
    // GAL-014
    { standort_id: "GAL-014", typ: "Boiler", modell: "UltraSteel 300", hersteller: "Hoval", baujahr: 2011, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-014", typ: "Heizung", modell: "UltraGas 30", hersteller: "Hoval", baujahr: 2011, kapazitaet: "30kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-015 (Metzgerei)
    { standort_id: "GAL-015", typ: "Boiler", modell: "Logalux SU 400", hersteller: "Buderus", baujahr: 2017, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "Metzgerei Grossboiler" },
    { standort_id: "GAL-015", typ: "Wasserfilter", modell: "AQA drink Pro 20", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filterkerze", notizen: "Lebensmittelbereich" },
    { standort_id: "GAL-015", typ: "Heizung", modell: "Logano G125", hersteller: "Buderus", baujahr: 2010, kapazitaet: "20kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-016
    { standort_id: "GAL-016", typ: "Öltank", modell: "Stahltank Alt", hersteller: "Unbekannt", baujahr: 1985, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Sehr alt, Ersatz empfohlen" },
    { standort_id: "GAL-016", typ: "Boiler", modell: "SBB 150", hersteller: "Stiebel Eltron", baujahr: 2005, kapazitaet: "150L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-016", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2000, kapazitaet: "", hat_tigerloop: 0, filter_modell: "Siku 50-75", notizen: "" },
    // GAL-017
    { standort_id: "GAL-017", typ: "Öltank", modell: "KWT 4000", hersteller: "Roth", baujahr: 2010, kapazitaet: "4000L", hat_tigerloop: 0, filter_modell: "", notizen: "Gemeindehaus" },
    { standort_id: "GAL-017", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-017", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "35kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-018
    { standort_id: "GAL-018", typ: "Boiler", modell: "UltraSteel 500", hersteller: "Hoval", baujahr: 2013, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "Seniorenheim Grossboiler" },
    { standort_id: "GAL-018", typ: "Wasserfilter", modell: "AQA life S", hersteller: "BWT", baujahr: 2019, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    { standort_id: "GAL-018", typ: "Heizung", modell: "UltraGas 50", hersteller: "Hoval", baujahr: 2013, kapazitaet: "50kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-019
    { standort_id: "GAL-019", typ: "Öltank", modell: "Variol", hersteller: "Roth", baujahr: 2012, kapazitaet: "1500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-019", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2018, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-020
    { standort_id: "GAL-020", typ: "Öltank", modell: "KWT 2000", hersteller: "Roth", baujahr: 2007, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-020", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2012, kapazitaet: "150L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-020", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2012, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-021
    { standort_id: "GAL-021", typ: "Boiler", modell: "Logalux SU 300", hersteller: "Buderus", baujahr: 2010, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-021", typ: "Heizung", modell: "Logano G125", hersteller: "Buderus", baujahr: 2005, kapazitaet: "25kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-022
    { standort_id: "GAL-022", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 2000, kapazitaet: "8000L", hat_tigerloop: 0, filter_modell: "", notizen: "2 Tanks à 4000L" },
    { standort_id: "GAL-022", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "Grossboiler Siedlung" },
    { standort_id: "GAL-022", typ: "Wasserfilter", modell: "AQA perla", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Perla Tabs", notizen: "" },
    { standort_id: "GAL-022", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2008, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    { standort_id: "GAL-022", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "60kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-023 (Hotel & Restaurant)
    { standort_id: "GAL-023", typ: "Boiler", modell: "UltraSteel 500", hersteller: "Hoval", baujahr: 2015, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "Hauptboiler Hotel" },
    { standort_id: "GAL-023", typ: "Boiler", modell: "UltraSteel 300", hersteller: "Hoval", baujahr: 2018, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "Restaurant-Boiler" },
    { standort_id: "GAL-023", typ: "Wasserfilter", modell: "AQA drink Pro 20", hersteller: "BWT", baujahr: 2021, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filterkerze", notizen: "" },
    { standort_id: "GAL-023", typ: "Heizung", modell: "UltraGas 60", hersteller: "Hoval", baujahr: 2015, kapazitaet: "60kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-024
    { standort_id: "GAL-024", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2005, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-024", typ: "Boiler", modell: "Logalux SU 400", hersteller: "Buderus", baujahr: 2015, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "Schulhaus Boiler" },
    { standort_id: "GAL-024", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2010, kapazitaet: "", hat_tigerloop: 0, filter_modell: "Siku 50-75", notizen: "" },
    // GAL-025
    { standort_id: "GAL-025", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-025", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2015, kapazitaet: "20kW", hat_tigerloop: 0, filter_modell: "", notizen: "Neubau" },
    // GAL-026
    { standort_id: "GAL-026", typ: "Öltank", modell: "FuelMaster 3000", hersteller: "Werit", baujahr: 2001, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-026", typ: "Boiler", modell: "SBB 301", hersteller: "Stiebel Eltron", baujahr: 2014, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-026", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2008, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-027
    { standort_id: "GAL-027", typ: "Öltank", modell: "KWT 2000", hersteller: "Roth", baujahr: 2009, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-027", typ: "Boiler", modell: "Logalux SU 200", hersteller: "Buderus", baujahr: 2016, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-027", typ: "Wasserfilter", modell: "E1 Einhebelfilter", hersteller: "BWT", baujahr: 2021, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    // GAL-028
    { standort_id: "GAL-028", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2019, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Neuer Tank" },
    { standort_id: "GAL-028", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2019, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-028", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2019, kapazitaet: "30kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-029
    { standort_id: "GAL-029", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 1997, kapazitaet: "5000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-029", typ: "Boiler", modell: "UltraSteel 400", hersteller: "Hoval", baujahr: 2012, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-029", typ: "Wasserfilter", modell: "AQA life S", hersteller: "BWT", baujahr: 2018, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    { standort_id: "GAL-029", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2005, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-030 (Restaurant)
    { standort_id: "GAL-030", typ: "Boiler", modell: "UltraSteel 300", hersteller: "Hoval", baujahr: 2018, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-030", typ: "Wasserfilter", modell: "AQA drink Pro 20", hersteller: "BWT", baujahr: 2021, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filterkerze", notizen: "" },
    { standort_id: "GAL-030", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2010, kapazitaet: "20kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-031
    { standort_id: "GAL-031", typ: "Boiler", modell: "UltraSteel 500", hersteller: "Hoval", baujahr: 2014, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "200L Grossboiler Pflegeheim" },
    { standort_id: "GAL-031", typ: "Wasserfilter", modell: "AQA perla", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Perla Tabs", notizen: "" },
    { standort_id: "GAL-031", typ: "Heizung", modell: "UltraGas 80", hersteller: "Hoval", baujahr: 2014, kapazitaet: "80kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-032
    { standort_id: "GAL-032", typ: "Öltank", modell: "FuelMaster 2000", hersteller: "Werit", baujahr: 2003, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-032", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2011, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-032", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2010, kapazitaet: "", hat_tigerloop: 0, filter_modell: "Siku 50-75", notizen: "" },
    // GAL-033
    { standort_id: "GAL-033", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2004, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Tankraum 1" },
    { standort_id: "GAL-033", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2004, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Tankraum 2" },
    { standort_id: "GAL-033", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2016, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-033", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2010, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-034
    { standort_id: "GAL-034", typ: "Boiler", modell: "Logalux SU 300", hersteller: "Buderus", baujahr: 2017, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-034", typ: "Heizung", modell: "Logano plus GB312", hersteller: "Buderus", baujahr: 2017, kapazitaet: "40kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-035
    { standort_id: "GAL-035", typ: "Öltank", modell: "Variol", hersteller: "Roth", baujahr: 2011, kapazitaet: "1500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-035", typ: "Boiler", modell: "DHE SL", hersteller: "Stiebel Eltron", baujahr: 2016, kapazitaet: "150L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-036
    { standort_id: "GAL-036", typ: "Öltank", modell: "FuelMaster 2500", hersteller: "Werit", baujahr: 1999, kapazitaet: "2500L", hat_tigerloop: 0, filter_modell: "", notizen: "Altbau Winterthur" },
    { standort_id: "GAL-036", typ: "Boiler", modell: "Logalux SU 300", hersteller: "Buderus", baujahr: 2010, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-036", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2005, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    { standort_id: "GAL-036", typ: "Heizung", modell: "Logano G125", hersteller: "Buderus", baujahr: 1999, kapazitaet: "30kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-037
    { standort_id: "GAL-037", typ: "Öltank", modell: "KWT 2000", hersteller: "Roth", baujahr: 2002, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "Altstadt, schwieriger Zugang" },
    { standort_id: "GAL-037", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2013, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-038
    { standort_id: "GAL-038", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 1996, kapazitaet: "5000L", hat_tigerloop: 0, filter_modell: "", notizen: "Tank 1 Industriegebäude" },
    { standort_id: "GAL-038", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 1996, kapazitaet: "5000L", hat_tigerloop: 0, filter_modell: "", notizen: "Tank 2 Industriegebäude" },
    { standort_id: "GAL-038", typ: "Boiler", modell: "Logalux SU 500", hersteller: "Buderus", baujahr: 2008, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-038", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2005, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    { standort_id: "GAL-038", typ: "Heizung", modell: "Logano plus GB312", hersteller: "Buderus", baujahr: 2008, kapazitaet: "80kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-039
    { standort_id: "GAL-039", typ: "Boiler", modell: "UltraSteel 500", hersteller: "Hoval", baujahr: 2016, kapazitaet: "500L", hat_tigerloop: 0, filter_modell: "", notizen: "Seniorenresidenz" },
    { standort_id: "GAL-039", typ: "Wasserfilter", modell: "AQA perla", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Perla Tabs", notizen: "" },
    { standort_id: "GAL-039", typ: "Heizung", modell: "UltraGas 100", hersteller: "Hoval", baujahr: 2016, kapazitaet: "100kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-040
    { standort_id: "GAL-040", typ: "Öltank", modell: "Variol", hersteller: "Roth", baujahr: 2014, kapazitaet: "1500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-040", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2018, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-041 (Restaurant)
    { standort_id: "GAL-041", typ: "Boiler", modell: "UltraSteel 400", hersteller: "Hoval", baujahr: 2013, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "Hauptboiler" },
    { standort_id: "GAL-041", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2019, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "Nebenboiler Küche" },
    { standort_id: "GAL-041", typ: "Wasserfilter", modell: "AQA drink Pro 20", hersteller: "BWT", baujahr: 2021, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filterkerze", notizen: "" },
    // GAL-042
    { standort_id: "GAL-042", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2011, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "Extremer Kalk durch Thermalwasser" },
    { standort_id: "GAL-042", typ: "Wasserfilter", modell: "AQA perla", hersteller: "BWT", baujahr: 2019, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Perla Tabs", notizen: "Dringend nötig wegen Thermalkalk" },
    { standort_id: "GAL-042", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2011, kapazitaet: "45kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-043
    { standort_id: "GAL-043", typ: "Öltank", modell: "FuelMaster 2000", hersteller: "Werit", baujahr: 2007, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-043", typ: "Boiler", modell: "SBB 301", hersteller: "Stiebel Eltron", baujahr: 2014, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-043", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2012, kapazitaet: "", hat_tigerloop: 0, filter_modell: "Siku 50-75", notizen: "" },
    // GAL-044
    { standort_id: "GAL-044", typ: "Öltank", modell: "Haase Stahltank", hersteller: "Haase", baujahr: 2000, kapazitaet: "4000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-044", typ: "Boiler", modell: "Logalux SU 400", hersteller: "Buderus", baujahr: 2015, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-044", typ: "Ölfilter", modell: "Oilpur Z A", hersteller: "Oventrop", baujahr: 2008, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    { standort_id: "GAL-044", typ: "Heizung", modell: "Logano G125", hersteller: "Buderus", baujahr: 2000, kapazitaet: "50kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-045
    { standort_id: "GAL-045", typ: "Öltank", modell: "Variol", hersteller: "Roth", baujahr: 2015, kapazitaet: "1500L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-045", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2017, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-046
    { standort_id: "GAL-046", typ: "Boiler", modell: "UltraSteel 300", hersteller: "Hoval", baujahr: 2012, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "Boiler 1" },
    { standort_id: "GAL-046", typ: "Boiler", modell: "UltraSteel 300", hersteller: "Hoval", baujahr: 2012, kapazitaet: "300L", hat_tigerloop: 0, filter_modell: "", notizen: "Boiler 2" },
    { standort_id: "GAL-046", typ: "Boiler", modell: "UltraSteel 200", hersteller: "Hoval", baujahr: 2018, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "Boiler 3 (neu)" },
    { standort_id: "GAL-046", typ: "Wasserfilter", modell: "AQA life S", hersteller: "BWT", baujahr: 2020, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    { standort_id: "GAL-046", typ: "Heizung", modell: "UltraGas 60", hersteller: "Hoval", baujahr: 2012, kapazitaet: "60kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-047
    { standort_id: "GAL-047", typ: "Öltank", modell: "KWT 2000", hersteller: "Roth", baujahr: 2008, kapazitaet: "2000L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-047", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2015, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-047", typ: "Ölfilter", modell: "Oilpur Z", hersteller: "Oventrop", baujahr: 2012, kapazitaet: "", hat_tigerloop: 1, filter_modell: "Tigerloop Plus", notizen: "" },
    // GAL-048
    { standort_id: "GAL-048", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2005, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Block A" },
    { standort_id: "GAL-048", typ: "Öltank", modell: "KWT 3000", hersteller: "Roth", baujahr: 2005, kapazitaet: "3000L", hat_tigerloop: 0, filter_modell: "", notizen: "Block B" },
    { standort_id: "GAL-048", typ: "Boiler", modell: "Vitocell 300-V", hersteller: "Viessmann", baujahr: 2016, kapazitaet: "400L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-048", typ: "Heizung", modell: "Vitodens 200-W", hersteller: "Viessmann", baujahr: 2016, kapazitaet: "45kW", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    // GAL-049 (Restaurant)
    { standort_id: "GAL-049", typ: "Boiler", modell: "SBB 200", hersteller: "Stiebel Eltron", baujahr: 2017, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "" },
    { standort_id: "GAL-049", typ: "Wasserfilter", modell: "E1 Einhebelfilter", hersteller: "BWT", baujahr: 2021, kapazitaet: "", hat_tigerloop: 0, filter_modell: "BWT Filtervlies", notizen: "" },
    // GAL-050
    { standort_id: "GAL-050", typ: "Boiler", modell: "Vitocell 100-V", hersteller: "Viessmann", baujahr: 2020, kapazitaet: "200L", hat_tigerloop: 0, filter_modell: "", notizen: "Neubau" },
    { standort_id: "GAL-050", typ: "Heizung", modell: "Vitocal 200-S", hersteller: "Viessmann", baujahr: 2020, kapazitaet: "10kW", hat_tigerloop: 0, filter_modell: "", notizen: "Wärmepumpe" },
  ];

  // ---------------------------------------------------------------------------
  // AUFTRAEGE (100+ orders across all statuses)
  // ---------------------------------------------------------------------------
  interface Auftrag {
    standort_id: string; typ: string; status: string; faellig_am: string;
    intervall_jahre: number; angebots_datum: string; angebots_betrag: number | null;
    erledigt_am: string; techniker: string; kosten: number | null; notizen: string;
  }

  const auftraege: Auftrag[] = [
    // geplant
    { standort_id: "GAL-001", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2026-06-15", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-002", typ: "Tankreinigung", status: "geplant", faellig_am: "2026-05-01", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "Grosser Tank, evtl. 2 Tage" },
    { standort_id: "GAL-005", typ: "Tank-Sichtkontrolle", status: "geplant", faellig_am: "2026-08-01", intervall_jahre: 10, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-007", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2026-04-20", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "Schulferien abwarten" },
    { standort_id: "GAL-010", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-07-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-013", typ: "Tankreinigung", status: "geplant", faellig_am: "2026-09-15", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-016", typ: "Tank-Sichtkontrolle", status: "geplant", faellig_am: "2025-12-01", intervall_jahre: 10, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "DRINGEND - alter Tank" },
    { standort_id: "GAL-019", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2026-11-01", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-025", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2027-01-15", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-028", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-10-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-032", typ: "Tankreinigung", status: "geplant", faellig_am: "2027-03-01", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-035", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2027-02-15", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-040", typ: "Tank-Sichtkontrolle", status: "geplant", faellig_am: "2027-06-01", intervall_jahre: 10, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-047", typ: "Tankreinigung", status: "geplant", faellig_am: "2027-04-01", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-048", typ: "Tank-Sichtkontrolle", status: "geplant", faellig_am: "2027-05-01", intervall_jahre: 10, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-050", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2027-06-15", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },

    // angebot_gesendet
    { standort_id: "GAL-003", typ: "Boiler-Entkalkung", status: "angebot_gesendet", faellig_am: "2026-04-10", intervall_jahre: 3, angebots_datum: "2026-02-15", angebots_betrag: 720, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-006", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-05-15", intervall_jahre: 5, angebots_datum: "2026-02-20", angebots_betrag: 2800, erledigt_am: "", techniker: "", kosten: null, notizen: "Grosser Gewerbetank" },
    { standort_id: "GAL-009", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-06-01", intervall_jahre: 5, angebots_datum: "2026-03-01", angebots_betrag: 3200, erledigt_am: "", techniker: "", kosten: null, notizen: "2 Tanks" },
    { standort_id: "GAL-011", typ: "Boiler-Entkalkung", status: "angebot_gesendet", faellig_am: "2026-05-20", intervall_jahre: 3, angebots_datum: "2026-03-05", angebots_betrag: 1050, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-017", typ: "Filterwechsel", status: "angebot_gesendet", faellig_am: "2026-04-15", intervall_jahre: 2, angebots_datum: "2026-02-28", angebots_betrag: 320, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-022", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-07-01", intervall_jahre: 5, angebots_datum: "2026-03-10", angebots_betrag: 4200, erledigt_am: "", techniker: "", kosten: null, notizen: "Grosssiedlung, 2 Tanks" },
    { standort_id: "GAL-029", typ: "Boiler-Entkalkung", status: "angebot_gesendet", faellig_am: "2026-04-01", intervall_jahre: 3, angebots_datum: "2026-02-18", angebots_betrag: 1300, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-036", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-06-15", intervall_jahre: 5, angebots_datum: "2026-03-08", angebots_betrag: 1850, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-038", typ: "Tank-Sichtkontrolle", status: "angebot_gesendet", faellig_am: "2026-04-20", intervall_jahre: 10, angebots_datum: "2026-03-01", angebots_betrag: 580, erledigt_am: "", techniker: "", kosten: null, notizen: "2 Industrietanks" },
    { standort_id: "GAL-042", typ: "Boiler-Entkalkung", status: "angebot_gesendet", faellig_am: "2026-05-01", intervall_jahre: 3, angebots_datum: "2026-03-05", angebots_betrag: 1450, erledigt_am: "", techniker: "", kosten: null, notizen: "Stark verkalkt" },
    { standort_id: "GAL-044", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-07-15", intervall_jahre: 5, angebots_datum: "2026-03-12", angebots_betrag: 2650, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-046", typ: "Boiler-Entkalkung", status: "angebot_gesendet", faellig_am: "2026-06-01", intervall_jahre: 3, angebots_datum: "2026-03-10", angebots_betrag: 2100, erledigt_am: "", techniker: "", kosten: null, notizen: "3 Boiler" },

    // angebot_akzeptiert
    { standort_id: "GAL-001", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-20", intervall_jahre: 2, angebots_datum: "2026-01-10", angebots_betrag: 480, erledigt_am: "", techniker: "Daniel Zahner", kosten: null, notizen: "Tigerloop-Filter" },
    { standort_id: "GAL-004", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-03-18", intervall_jahre: 3, angebots_datum: "2026-01-20", angebots_betrag: 1100, erledigt_am: "", techniker: "Marco Bianchi", kosten: null, notizen: "Restaurant Boiler" },
    { standort_id: "GAL-004", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-18", intervall_jahre: 1, angebots_datum: "2026-01-20", angebots_betrag: 350, erledigt_am: "", techniker: "Marco Bianchi", kosten: null, notizen: "Restaurant Filterwechsel" },
    { standort_id: "GAL-008", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-03-19", intervall_jahre: 3, angebots_datum: "2026-01-15", angebots_betrag: 1800, erledigt_am: "", techniker: "Daniel Zahner", kosten: null, notizen: "2 Boiler entkalken" },
    { standort_id: "GAL-012", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-17", intervall_jahre: 2, angebots_datum: "2026-02-01", angebots_betrag: 420, erledigt_am: "", techniker: "Stefan Keller", kosten: null, notizen: "" },
    { standort_id: "GAL-014", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-03-25", intervall_jahre: 3, angebots_datum: "2026-02-10", angebots_betrag: 950, erledigt_am: "", techniker: "Thomas Meier", kosten: null, notizen: "" },
    { standort_id: "GAL-015", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-20", intervall_jahre: 1, angebots_datum: "2026-02-05", angebots_betrag: 380, erledigt_am: "", techniker: "Stefan Keller", kosten: null, notizen: "Metzgerei" },
    { standort_id: "GAL-018", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-04-05", intervall_jahre: 3, angebots_datum: "2026-02-20", angebots_betrag: 1600, erledigt_am: "", techniker: "Daniel Zahner", kosten: null, notizen: "500L Grossboiler" },
    { standort_id: "GAL-023", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-03-16", intervall_jahre: 3, angebots_datum: "2026-01-25", angebots_betrag: 2100, erledigt_am: "", techniker: "Daniel Zahner", kosten: null, notizen: "Hotel 2 Boiler" },
    { standort_id: "GAL-023", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-16", intervall_jahre: 1, angebots_datum: "2026-01-25", angebots_betrag: 380, erledigt_am: "", techniker: "Daniel Zahner", kosten: null, notizen: "Restaurant Filter" },
    { standort_id: "GAL-027", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-04-10", intervall_jahre: 3, angebots_datum: "2026-03-01", angebots_betrag: 750, erledigt_am: "", techniker: "Marco Bianchi", kosten: null, notizen: "" },
    { standort_id: "GAL-030", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-17", intervall_jahre: 1, angebots_datum: "2026-02-10", angebots_betrag: 380, erledigt_am: "", techniker: "Stefan Keller", kosten: null, notizen: "Restaurant" },
    { standort_id: "GAL-031", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-04-15", intervall_jahre: 3, angebots_datum: "2026-02-25", angebots_betrag: 1650, erledigt_am: "", techniker: "Thomas Meier", kosten: null, notizen: "Pflegeheim" },
    { standort_id: "GAL-033", typ: "Tankreinigung", status: "angebot_akzeptiert", faellig_am: "2026-04-20", intervall_jahre: 5, angebots_datum: "2026-02-15", angebots_betrag: 3800, erledigt_am: "", techniker: "Daniel Zahner", kosten: null, notizen: "2 Tanks" },
    { standort_id: "GAL-037", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-05-01", intervall_jahre: 3, angebots_datum: "2026-03-05", angebots_betrag: 850, erledigt_am: "", techniker: "Marco Bianchi", kosten: null, notizen: "" },
    { standort_id: "GAL-039", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-04-10", intervall_jahre: 3, angebots_datum: "2026-02-28", angebots_betrag: 1750, erledigt_am: "", techniker: "Thomas Meier", kosten: null, notizen: "Seniorenresidenz" },
    { standort_id: "GAL-041", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-03-19", intervall_jahre: 3, angebots_datum: "2026-02-05", angebots_betrag: 1900, erledigt_am: "", techniker: "Stefan Keller", kosten: null, notizen: "2 Boiler Gasthaus" },
    { standort_id: "GAL-041", typ: "Filterwechsel", status: "angebot_akzeptiert", faellig_am: "2026-03-19", intervall_jahre: 1, angebots_datum: "2026-02-05", angebots_betrag: 380, erledigt_am: "", techniker: "Stefan Keller", kosten: null, notizen: "" },
    { standort_id: "GAL-043", typ: "Boiler-Entkalkung", status: "angebot_akzeptiert", faellig_am: "2026-04-25", intervall_jahre: 3, angebots_datum: "2026-03-10", angebots_betrag: 1050, erledigt_am: "", techniker: "Marco Bianchi", kosten: null, notizen: "" },

    // angebot_abgelehnt
    { standort_id: "GAL-016", typ: "Tankreinigung", status: "angebot_abgelehnt", faellig_am: "2026-03-01", intervall_jahre: 5, angebots_datum: "2025-12-15", angebots_betrag: 2200, erledigt_am: "", techniker: "", kosten: null, notizen: "Eigentümer will warten, Tank alt" },
    { standort_id: "GAL-020", typ: "Boiler-Entkalkung", status: "angebot_abgelehnt", faellig_am: "2026-02-15", intervall_jahre: 3, angebots_datum: "2025-11-20", angebots_betrag: 680, erledigt_am: "", techniker: "", kosten: null, notizen: "Eigentümer macht selber" },
    { standort_id: "GAL-026", typ: "Tankreinigung", status: "angebot_abgelehnt", faellig_am: "2026-04-01", intervall_jahre: 5, angebots_datum: "2026-01-10", angebots_betrag: 2400, erledigt_am: "", techniker: "", kosten: null, notizen: "Preis zu hoch, Konkurrenzofferte" },
    { standort_id: "GAL-034", typ: "Boiler-Entkalkung", status: "angebot_abgelehnt", faellig_am: "2026-05-01", intervall_jahre: 3, angebots_datum: "2026-02-01", angebots_betrag: 1050, erledigt_am: "", techniker: "", kosten: null, notizen: "Coop hat eigenen Servicepartner" },
    { standort_id: "GAL-045", typ: "Boiler-Entkalkung", status: "angebot_abgelehnt", faellig_am: "2026-06-01", intervall_jahre: 3, angebots_datum: "2026-03-01", angebots_betrag: 780, erledigt_am: "", techniker: "", kosten: null, notizen: "Zu teuer, anderer Anbieter gewählt" },

    // erledigt (recent)
    { standort_id: "GAL-002", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-01-15", intervall_jahre: 3, angebots_datum: "2025-11-10", angebots_betrag: 1050, erledigt_am: "2026-01-12", techniker: "Daniel Zahner", kosten: 1050, notizen: "Stark verkalkt" },
    { standort_id: "GAL-003", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-12-01", intervall_jahre: 2, angebots_datum: "2025-10-15", angebots_betrag: 280, erledigt_am: "2025-11-28", techniker: "Stefan Keller", kosten: 280, notizen: "" },
    { standort_id: "GAL-006", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-02-01", intervall_jahre: 3, angebots_datum: "2025-12-01", angebots_betrag: 1350, erledigt_am: "2026-01-30", techniker: "Marco Bianchi", kosten: 1350, notizen: "400L Boiler" },
    { standort_id: "GAL-008", typ: "Filterwechsel", status: "erledigt", faellig_am: "2026-01-01", intervall_jahre: 1, angebots_datum: "2025-11-15", angebots_betrag: 380, erledigt_am: "2025-12-20", techniker: "Daniel Zahner", kosten: 380, notizen: "Restaurant Filter" },
    { standort_id: "GAL-009", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-11-15", intervall_jahre: 3, angebots_datum: "2025-09-20", angebots_betrag: 1550, erledigt_am: "2025-11-10", techniker: "Thomas Meier", kosten: 1550, notizen: "Grossboiler" },
    { standort_id: "GAL-010", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-02-15", intervall_jahre: 3, angebots_datum: "2025-12-10", angebots_betrag: 700, erledigt_am: "2026-02-12", techniker: "Stefan Keller", kosten: 700, notizen: "" },
    { standort_id: "GAL-011", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-10-01", intervall_jahre: 2, angebots_datum: "2025-08-15", angebots_betrag: 480, erledigt_am: "2025-09-28", techniker: "Daniel Zahner", kosten: 480, notizen: "Tigerloop" },
    { standort_id: "GAL-015", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-01-20", intervall_jahre: 3, angebots_datum: "2025-11-01", angebots_betrag: 1300, erledigt_am: "2026-01-18", techniker: "Marco Bianchi", kosten: 1350, notizen: "Metzgerei Grossboiler, mehr Arbeit als erwartet" },
    { standort_id: "GAL-017", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-01-10", intervall_jahre: 3, angebots_datum: "2025-10-20", angebots_betrag: 980, erledigt_am: "2026-01-08", techniker: "Thomas Meier", kosten: 980, notizen: "" },
    { standort_id: "GAL-021", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-11-01", intervall_jahre: 3, angebots_datum: "2025-09-01", angebots_betrag: 920, erledigt_am: "2025-10-30", techniker: "Stefan Keller", kosten: 920, notizen: "" },
    { standort_id: "GAL-024", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-03-01", intervall_jahre: 3, angebots_datum: "2025-12-20", angebots_betrag: 1250, erledigt_am: "2026-02-28", techniker: "Daniel Zahner", kosten: 1250, notizen: "" },
    { standort_id: "GAL-030", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-02-01", intervall_jahre: 3, angebots_datum: "2025-11-25", angebots_betrag: 1100, erledigt_am: "2026-01-29", techniker: "Marco Bianchi", kosten: 1100, notizen: "" },
    { standort_id: "GAL-036", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-12-15", intervall_jahre: 3, angebots_datum: "2025-10-01", angebots_betrag: 1100, erledigt_am: "2025-12-10", techniker: "Thomas Meier", kosten: 1100, notizen: "" },
    { standort_id: "GAL-037", typ: "Filterwechsel", status: "erledigt", faellig_am: "2026-01-01", intervall_jahre: 2, angebots_datum: "2025-11-01", angebots_betrag: 300, erledigt_am: "2025-12-28", techniker: "Stefan Keller", kosten: 300, notizen: "" },
    { standort_id: "GAL-039", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-12-01", intervall_jahre: 2, angebots_datum: "2025-10-10", angebots_betrag: 400, erledigt_am: "2025-11-28", techniker: "Daniel Zahner", kosten: 400, notizen: "" },
    { standort_id: "GAL-041", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-12-15", intervall_jahre: 1, angebots_datum: "2025-10-20", angebots_betrag: 380, erledigt_am: "2025-12-12", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-042", typ: "Filterwechsel", status: "erledigt", faellig_am: "2026-01-01", intervall_jahre: 2, angebots_datum: "2025-11-01", angebots_betrag: 420, erledigt_am: "2025-12-30", techniker: "Thomas Meier", kosten: 420, notizen: "" },
    { standort_id: "GAL-043", typ: "Filterwechsel", status: "erledigt", faellig_am: "2026-02-01", intervall_jahre: 2, angebots_datum: "2025-12-01", angebots_betrag: 300, erledigt_am: "2026-01-28", techniker: "Stefan Keller", kosten: 300, notizen: "" },
    { standort_id: "GAL-047", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-03-01", intervall_jahre: 3, angebots_datum: "2025-12-15", angebots_betrag: 750, erledigt_am: "2026-02-27", techniker: "Daniel Zahner", kosten: 750, notizen: "" },
    { standort_id: "GAL-048", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-02-15", intervall_jahre: 3, angebots_datum: "2025-12-01", angebots_betrag: 1200, erledigt_am: "2026-02-10", techniker: "Marco Bianchi", kosten: 1200, notizen: "" },
    { standort_id: "GAL-049", typ: "Filterwechsel", status: "erledigt", faellig_am: "2026-01-15", intervall_jahre: 1, angebots_datum: "2025-11-10", angebots_betrag: 280, erledigt_am: "2026-01-10", techniker: "Stefan Keller", kosten: 280, notizen: "" },
    { standort_id: "GAL-022", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-01-01", intervall_jahre: 3, angebots_datum: "2025-10-15", angebots_betrag: 1600, erledigt_am: "2025-12-22", techniker: "Daniel Zahner", kosten: 1600, notizen: "Grossboiler" },
    { standort_id: "GAL-033", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2026-02-01", intervall_jahre: 3, angebots_datum: "2025-11-20", angebots_betrag: 1200, erledigt_am: "2026-01-30", techniker: "Thomas Meier", kosten: 1200, notizen: "" },
    { standort_id: "GAL-046", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-12-01", intervall_jahre: 2, angebots_datum: "2025-10-01", angebots_betrag: 380, erledigt_am: "2025-11-28", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-044", typ: "Filterwechsel", status: "erledigt", faellig_am: "2026-02-15", intervall_jahre: 2, angebots_datum: "2025-12-10", angebots_betrag: 500, erledigt_am: "2026-02-12", techniker: "Daniel Zahner", kosten: 500, notizen: "Tigerloop" },

    // Additional geplant
    { standort_id: "GAL-003", typ: "Tankreinigung", status: "geplant", faellig_am: "2026-10-15", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-009", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-08-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "Wasserfilter BWT" },
    { standort_id: "GAL-014", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-07-15", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-020", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-09-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "Ölfilter Tigerloop" },
    { standort_id: "GAL-021", typ: "Filterwechsel", status: "geplant", faellig_am: "2027-01-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-024", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-07-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "Sommerferien abwarten" },
    { standort_id: "GAL-026", typ: "Boiler-Entkalkung", status: "geplant", faellig_am: "2027-02-01", intervall_jahre: 3, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-029", typ: "Tankreinigung", status: "geplant", faellig_am: "2027-04-01", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-036", typ: "Filterwechsel", status: "geplant", faellig_am: "2026-10-01", intervall_jahre: 2, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "Ölfilter Tigerloop" },
    { standort_id: "GAL-038", typ: "Tankreinigung", status: "geplant", faellig_am: "2027-01-15", intervall_jahre: 5, angebots_datum: "", angebots_betrag: null, erledigt_am: "", techniker: "", kosten: null, notizen: "2 Industrietanks" },

    // Additional angebot_gesendet
    { standort_id: "GAL-007", typ: "Filterwechsel", status: "angebot_gesendet", faellig_am: "2026-07-01", intervall_jahre: 2, angebots_datum: "2026-03-12", angebots_betrag: 340, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-024", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-07-10", intervall_jahre: 5, angebots_datum: "2026-03-08", angebots_betrag: 1900, erledigt_am: "", techniker: "", kosten: null, notizen: "Sommerferien" },
    { standort_id: "GAL-033", typ: "Filterwechsel", status: "angebot_gesendet", faellig_am: "2026-05-01", intervall_jahre: 2, angebots_datum: "2026-03-05", angebots_betrag: 520, erledigt_am: "", techniker: "", kosten: null, notizen: "Tigerloop" },
    { standort_id: "GAL-039", typ: "Filterwechsel", status: "angebot_gesendet", faellig_am: "2026-05-15", intervall_jahre: 2, angebots_datum: "2026-03-10", angebots_betrag: 420, erledigt_am: "", techniker: "", kosten: null, notizen: "" },
    { standort_id: "GAL-048", typ: "Tankreinigung", status: "angebot_gesendet", faellig_am: "2026-09-01", intervall_jahre: 5, angebots_datum: "2026-03-12", angebots_betrag: 3600, erledigt_am: "", techniker: "", kosten: null, notizen: "2 Tanks" },

    // Additional erledigt
    { standort_id: "GAL-001", typ: "Tankreinigung", status: "erledigt", faellig_am: "2025-07-01", intervall_jahre: 5, angebots_datum: "2025-04-15", angebots_betrag: 1250, erledigt_am: "2025-06-28", techniker: "Daniel Zahner", kosten: 1250, notizen: "" },
    { standort_id: "GAL-005", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-10-01", intervall_jahre: 3, angebots_datum: "2025-08-01", angebots_betrag: 600, erledigt_am: "2025-09-28", techniker: "Marco Bianchi", kosten: 620, notizen: "Wenig Kalk, niedrige Region" },
    { standort_id: "GAL-007", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-07-10", intervall_jahre: 3, angebots_datum: "2025-05-15", angebots_betrag: 1020, erledigt_am: "2025-07-08", techniker: "Stefan Keller", kosten: 1020, notizen: "Sommerferien" },
    { standort_id: "GAL-013", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-09-01", intervall_jahre: 3, angebots_datum: "2025-06-20", angebots_betrag: 720, erledigt_am: "2025-08-28", techniker: "Thomas Meier", kosten: 720, notizen: "" },
    { standort_id: "GAL-014", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-08-01", intervall_jahre: 2, angebots_datum: "2025-06-01", angebots_betrag: 320, erledigt_am: "2025-07-28", techniker: "Daniel Zahner", kosten: 320, notizen: "" },
    { standort_id: "GAL-016", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-05-01", intervall_jahre: 3, angebots_datum: "2025-03-01", angebots_betrag: 570, erledigt_am: "2025-04-28", techniker: "Marco Bianchi", kosten: 570, notizen: "" },
    { standort_id: "GAL-019", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-08-15", intervall_jahre: 3, angebots_datum: "2025-06-10", angebots_betrag: 700, erledigt_am: "2025-08-12", techniker: "Stefan Keller", kosten: 700, notizen: "" },
    { standort_id: "GAL-026", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-06-01", intervall_jahre: 3, angebots_datum: "2025-04-01", angebots_betrag: 950, erledigt_am: "2025-05-28", techniker: "Thomas Meier", kosten: 950, notizen: "" },
    { standort_id: "GAL-032", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-05-15", intervall_jahre: 3, angebots_datum: "2025-03-10", angebots_betrag: 720, erledigt_am: "2025-05-12", techniker: "Daniel Zahner", kosten: 720, notizen: "" },
    { standort_id: "GAL-035", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-04-01", intervall_jahre: 3, angebots_datum: "2025-02-01", angebots_betrag: 600, erledigt_am: "2025-03-28", techniker: "Marco Bianchi", kosten: 600, notizen: "" },
    { standort_id: "GAL-040", typ: "Boiler-Entkalkung", status: "erledigt", faellig_am: "2025-09-01", intervall_jahre: 3, angebots_datum: "2025-07-01", angebots_betrag: 700, erledigt_am: "2025-08-28", techniker: "Stefan Keller", kosten: 700, notizen: "" },
    { standort_id: "GAL-045", typ: "Tank-Sichtkontrolle", status: "erledigt", faellig_am: "2025-11-01", intervall_jahre: 10, angebots_datum: "2025-09-01", angebots_betrag: 400, erledigt_am: "2025-10-28", techniker: "Thomas Meier", kosten: 400, notizen: "Tank 2015, guter Zustand" },
    { standort_id: "GAL-050", typ: "Filterwechsel", status: "erledigt", faellig_am: "2025-08-01", intervall_jahre: 2, angebots_datum: "2025-06-01", angebots_betrag: 280, erledigt_am: "2025-07-28", techniker: "Daniel Zahner", kosten: 280, notizen: "" },
  ];

  // ---------------------------------------------------------------------------
  // HISTORIE (200+ entries going back to 2018)
  // ---------------------------------------------------------------------------
  interface HistorieEntry {
    standort_id: string; auftrag_id: number | null; datum: string; typ: string;
    beschreibung: string; techniker: string; kosten: number; notizen: string;
  }

  const historie: HistorieEntry[] = [
    // 2018
    { standort_id: "GAL-001", auftrag_id: null, datum: "2018-03-15", typ: "Boiler-Entkalkung", beschreibung: "Boiler Viessmann 200L entkalkt. Starke Kalkablagerungen am Heizstab, ca. 3mm Schicht entfernt. Anode geprüft und für gut befunden.", techniker: "Daniel Zahner", kosten: 650, notizen: "" },
    { standort_id: "GAL-001", auftrag_id: null, datum: "2018-09-20", typ: "Tank-Sichtkontrolle", beschreibung: "Sichtkontrolle Öltank Roth 2000L durchgeführt. Keine Auffälligkeiten, Tank in gutem Zustand. Dichtungen kontrolliert.", techniker: "Daniel Zahner", kosten: 380, notizen: "" },
    { standort_id: "GAL-002", auftrag_id: null, datum: "2018-05-10", typ: "Tankreinigung", beschreibung: "Tank Werit 3000L komplett gereinigt. Ca. 15cm Schlamm am Boden entfernt. Tankinnenwand intakt, keine Korrosion festgestellt.", techniker: "Marco Bianchi", kosten: 1850, notizen: "" },
    { standort_id: "GAL-002", auftrag_id: null, datum: "2018-11-22", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 300L entkalkt. Kalkablagerungen moderat. Sicherheitsventil ersetzt.", techniker: "Stefan Keller", kosten: 980, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2018-02-14", typ: "Filterwechsel", beschreibung: "Wasserfilter BWT in der Grossküche gewechselt. Alter Filter stark verschmutzt. Durchflussmenge wieder normal.", techniker: "Thomas Meier", kosten: 320, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2018-06-20", typ: "Boiler-Entkalkung", beschreibung: "Restaurant-Boiler Hoval 300L entkalkt. Sehr starke Verkalkung wegen hohem Wasserverbrauch. Heizstab musste getauscht werden.", techniker: "Daniel Zahner", kosten: 1250, notizen: "" },
    { standort_id: "GAL-006", auftrag_id: null, datum: "2018-04-18", typ: "Tankreinigung", beschreibung: "Gewerbetank Haase 5000L gereinigt. Erhebliche Rückstände, ca. 25cm Bodensatz. Tankwände leicht korrodiert, Beschichtung empfohlen.", techniker: "Daniel Zahner", kosten: 3200, notizen: "" },
    { standort_id: "GAL-007", auftrag_id: null, datum: "2018-07-05", typ: "Boiler-Entkalkung", beschreibung: "Schulhaus-Boiler Viessmann 300L entkalkt während Sommerferien. Moderate Verkalkung.", techniker: "Stefan Keller", kosten: 950, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2018-01-22", typ: "Filterwechsel", beschreibung: "Restaurant Sternen: BWT Filterkerze gewechselt. Durchflussmenge deutlich verbessert.", techniker: "Marco Bianchi", kosten: 350, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2018-08-15", typ: "Boiler-Entkalkung", beschreibung: "Hauptboiler Hoval 400L entkalkt. Extreme Verkalkung, Heizleistung war stark reduziert. 2 Stunden Arbeit.", techniker: "Daniel Zahner", kosten: 1400, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2018-10-12", typ: "Tankreinigung", beschreibung: "2 Tanks à 3000L gereinigt. Beide Tanks hatten ca. 10cm Schlammschicht. Innenwände in Ordnung.", techniker: "Thomas Meier", kosten: 3000, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2018-04-05", typ: "Filterwechsel", beschreibung: "Ölfilter Oventrop mit Tigerloop gewechselt. Filter war stark verschmutzt, Tigerloop-Funktion geprüft.", techniker: "Stefan Keller", kosten: 450, notizen: "" },

    // 2019
    { standort_id: "GAL-001", auftrag_id: null, datum: "2019-04-10", typ: "Filterwechsel", beschreibung: "Ölfilter Oventrop mit Tigerloop gewechselt. Regulärer Wechsel, Filter moderat verschmutzt.", techniker: "Stefan Keller", kosten: 420, notizen: "" },
    { standort_id: "GAL-003", auftrag_id: null, datum: "2019-02-20", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 200L entkalkt. Geringe Kalkablagerung, Region Furttal hat moderaten Kalkgehalt.", techniker: "Thomas Meier", kosten: 680, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2019-01-15", typ: "Filterwechsel", beschreibung: "Halbjährlicher Filterwechsel Restaurant Löwen. BWT Filterkerze erneuert.", techniker: "Daniel Zahner", kosten: 350, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2019-07-20", typ: "Filterwechsel", beschreibung: "Filterwechsel Sommerhalbjahr. Filter war nach 6 Monaten bereits stark belastet wegen hohem Wasserverbrauch.", techniker: "Marco Bianchi", kosten: 350, notizen: "" },
    { standort_id: "GAL-005", auftrag_id: null, datum: "2019-06-15", typ: "Tank-Sichtkontrolle", beschreibung: "Sichtkontrolle Tank Werit 2500L. Tank in gutem Zustand, keine Mängel festgestellt.", techniker: "Daniel Zahner", kosten: 380, notizen: "" },
    { standort_id: "GAL-006", auftrag_id: null, datum: "2019-03-12", typ: "Filterwechsel", beschreibung: "Ölfilter mit Tigerloop gewechselt. Industriegebäude, Filter stark belastet.", techniker: "Stefan Keller", kosten: 480, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2019-02-10", typ: "Filterwechsel", beschreibung: "Restaurant Filterwechsel BWT. Normaler Verschleiss.", techniker: "Thomas Meier", kosten: 350, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2019-08-18", typ: "Filterwechsel", beschreibung: "Halbjährlicher Filterwechsel Restaurant Sternen. Hoher Wasserverbrauch in Sommermonaten.", techniker: "Daniel Zahner", kosten: 350, notizen: "" },
    { standort_id: "GAL-010", auftrag_id: null, datum: "2019-05-22", typ: "Boiler-Entkalkung", beschreibung: "EFH Boiler Stiebel Eltron 200L entkalkt. Mittlere Verkalkung, Anode noch in Ordnung.", techniker: "Marco Bianchi", kosten: 650, notizen: "" },
    { standort_id: "GAL-011", auftrag_id: null, datum: "2019-09-15", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 300L entkalkt. Region Glattal hat hohen Kalkgehalt, starke Ablagerungen.", techniker: "Daniel Zahner", kosten: 1000, notizen: "" },
    { standort_id: "GAL-012", auftrag_id: null, datum: "2019-07-01", typ: "Filterwechsel", beschreibung: "BWT Enthärtungsanlage gewartet und Filter gewechselt. Autowaschanlage hat sehr hohen Wasserverbrauch.", techniker: "Stefan Keller", kosten: 450, notizen: "" },
    { standort_id: "GAL-013", auftrag_id: null, datum: "2019-11-05", typ: "Tankreinigung", beschreibung: "Tank Werit 2000L gereinigt. Ca. 8cm Bodensatz entfernt. Tank in gutem Zustand.", techniker: "Thomas Meier", kosten: 1400, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2019-04-25", typ: "Filterwechsel", beschreibung: "Metzgerei BWT Filterkerze gewechselt. Lebensmittelbetrieb, höhere Anforderungen an Wasserqualität.", techniker: "Daniel Zahner", kosten: 380, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2019-10-20", typ: "Boiler-Entkalkung", beschreibung: "Metzgerei-Boiler Buderus 400L entkalkt. Mittlere bis starke Verkalkung.", techniker: "Marco Bianchi", kosten: 1200, notizen: "" },
    { standort_id: "GAL-016", auftrag_id: null, datum: "2019-08-10", typ: "Tank-Sichtkontrolle", beschreibung: "Alter Tank von 1985 kontrolliert. Deutliche Korrosion an Schweissnähten. Ersetzen dringend empfohlen.", techniker: "Daniel Zahner", kosten: 420, notizen: "ACHTUNG: Ersetzen empfohlen" },
    { standort_id: "GAL-017", auftrag_id: null, datum: "2019-03-25", typ: "Boiler-Entkalkung", beschreibung: "Gemeindehaus-Boiler Viessmann 300L entkalkt. Niedrige Kalkregion, geringe Ablagerungen.", techniker: "Stefan Keller", kosten: 850, notizen: "" },
    { standort_id: "GAL-018", auftrag_id: null, datum: "2019-06-20", typ: "Boiler-Entkalkung", beschreibung: "Alterszentrum Grossboiler Hoval 500L entkalkt. Moderate Verkalkung. Anode wurde ersetzt.", techniker: "Thomas Meier", kosten: 1500, notizen: "" },
    { standort_id: "GAL-022", auftrag_id: null, datum: "2019-10-15", typ: "Tankreinigung", beschreibung: "Grosssiedlung: 2 Tanks à 4000L gereinigt. Erheblicher Aufwand, ca. 20cm Bodensatz pro Tank.", techniker: "Daniel Zahner", kosten: 4000, notizen: "" },

    // 2020
    { standort_id: "GAL-001", auftrag_id: null, datum: "2020-06-18", typ: "Tankreinigung", beschreibung: "Öltank Roth 2000L gereinigt. Reguläre 5-Jahres-Reinigung. Ca. 5cm Bodensatz, Tank in gutem Zustand.", techniker: "Daniel Zahner", kosten: 1200, notizen: "" },
    { standort_id: "GAL-002", auftrag_id: null, datum: "2020-03-12", typ: "Filterwechsel", beschreibung: "Wasserfilter BWT gewechselt. Kalkschutzanlage funktioniert einwandfrei.", techniker: "Stefan Keller", kosten: 320, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2020-01-20", typ: "Filterwechsel", beschreibung: "Restaurantfilter gewechselt. Normaler Halbjahres-Rhythmus.", techniker: "Marco Bianchi", kosten: 350, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2020-07-15", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Filterwechsel Restaurant Löwen.", techniker: "Thomas Meier", kosten: 350, notizen: "" },
    { standort_id: "GAL-006", auftrag_id: null, datum: "2020-05-08", typ: "Boiler-Entkalkung", beschreibung: "Gewerbeboiler Buderus 400L entkalkt. Starke Kalkablagerungen wegen Glattal-Wasser. Heizstab ersetzt.", techniker: "Daniel Zahner", kosten: 1400, notizen: "" },
    { standort_id: "GAL-007", auftrag_id: null, datum: "2020-07-20", typ: "Tankreinigung", beschreibung: "Schulhaus-Tank Roth 4000L gereinigt während Sommerferien. Ca. 12cm Bodensatz.", techniker: "Marco Bianchi", kosten: 2200, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2020-02-15", typ: "Filterwechsel", beschreibung: "Restaurant Sternen BWT Filterkerze erneuert.", techniker: "Stefan Keller", kosten: 350, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2020-08-20", typ: "Filterwechsel", beschreibung: "Halbjährlicher Wechsel. Filter war stark belastet wegen Sommersaison.", techniker: "Daniel Zahner", kosten: 380, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2020-01-10", typ: "Boiler-Entkalkung", beschreibung: "Grossboiler Viessmann 500L entkalkt. Hohe Kalkregion Glattal, starke Ablagerungen. 3 Stunden Arbeit.", techniker: "Thomas Meier", kosten: 1500, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2020-08-05", typ: "Filterwechsel", beschreibung: "Ölfilter Oventrop mit Tigerloop gewechselt.", techniker: "Stefan Keller", kosten: 480, notizen: "" },
    { standort_id: "GAL-011", auftrag_id: null, datum: "2020-04-20", typ: "Filterwechsel", beschreibung: "Ölfilter mit Tigerloop gewechselt. Filter war stark verschmutzt.", techniker: "Daniel Zahner", kosten: 480, notizen: "" },
    { standort_id: "GAL-012", auftrag_id: null, datum: "2020-02-10", typ: "Filterwechsel", beschreibung: "BWT Enthärtungsanlage Filter gewechselt. Autowaschanlage, hoher Verbrauch.", techniker: "Marco Bianchi", kosten: 450, notizen: "" },
    { standort_id: "GAL-014", auftrag_id: null, datum: "2020-06-15", typ: "Boiler-Entkalkung", beschreibung: "Kirchgemeindehaus Boiler Hoval 300L entkalkt. Moderate Verkalkung.", techniker: "Stefan Keller", kosten: 900, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2020-03-30", typ: "Filterwechsel", beschreibung: "Metzgerei Filterwechsel. Jährlicher Rhythmus Lebensmittelbetrieb.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-017", auftrag_id: null, datum: "2020-09-10", typ: "Tankreinigung", beschreibung: "Gemeindehaus-Tank Roth 4000L gereinigt. Wenig Bodensatz, guter Zustand.", techniker: "Daniel Zahner", kosten: 2000, notizen: "" },
    { standort_id: "GAL-018", auftrag_id: null, datum: "2020-05-15", typ: "Filterwechsel", beschreibung: "BWT Filtervlies im Alterszentrum gewechselt.", techniker: "Marco Bianchi", kosten: 320, notizen: "" },
    { standort_id: "GAL-020", auftrag_id: null, datum: "2020-04-08", typ: "Tankreinigung", beschreibung: "Weingut-Tank Roth 2000L gereinigt. Ca. 7cm Bodensatz. Temperatur im Weinkeller beachtet.", techniker: "Stefan Keller", kosten: 1300, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2020-11-20", typ: "Boiler-Entkalkung", beschreibung: "Hotel Kronenhof: 2 Boiler entkalkt (500L + 300L). Sehr starke Verkalkung, Kalkregion Hoch.", techniker: "Daniel Zahner", kosten: 2000, notizen: "" },
    { standort_id: "GAL-024", auftrag_id: null, datum: "2020-07-10", typ: "Tankreinigung", beschreibung: "Primarschule Tank Roth 3000L in Sommerferien gereinigt.", techniker: "Thomas Meier", kosten: 1800, notizen: "" },
    { standort_id: "GAL-027", auftrag_id: null, datum: "2020-08-25", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 200L entkalkt. Hoher Kalkgehalt Bülach.", techniker: "Marco Bianchi", kosten: 720, notizen: "" },
    { standort_id: "GAL-029", auftrag_id: null, datum: "2020-10-05", typ: "Boiler-Entkalkung", beschreibung: "Grossboiler Hoval 400L entkalkt. Sehr starke Verkalkung Limmattal.", techniker: "Stefan Keller", kosten: 1250, notizen: "" },
    { standort_id: "GAL-031", auftrag_id: null, datum: "2020-09-20", typ: "Boiler-Entkalkung", beschreibung: "Pflegeheim-Boiler Hoval 500L entkalkt. Starke Kalkablagerungen, hoher Wasserverbrauch.", techniker: "Daniel Zahner", kosten: 1600, notizen: "" },
    { standort_id: "GAL-036", auftrag_id: null, datum: "2020-11-12", typ: "Tankreinigung", beschreibung: "Altbau Winterthur Tank Werit 2500L gereinigt. Enger Treppenabgang erschwerte Arbeit.", techniker: "Thomas Meier", kosten: 1800, notizen: "" },
    { standort_id: "GAL-038", auftrag_id: null, datum: "2020-06-25", typ: "Tankreinigung", beschreibung: "Industriegebäude 2 Tanks à 5000L gereinigt. Grosser Aufwand, ganzer Tag. Ca. 30cm Bodensatz.", techniker: "Daniel Zahner", kosten: 4500, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2020-03-18", typ: "Boiler-Entkalkung", beschreibung: "Bäder-Quartier Boiler 400L entkalkt. Extremer Kalk durch Thermalwasser-Einfluss. 4 Stunden Arbeit.", techniker: "Marco Bianchi", kosten: 1500, notizen: "" },
    { standort_id: "GAL-044", auftrag_id: null, datum: "2020-05-22", typ: "Tankreinigung", beschreibung: "Gewerbepark Wettingen Tank 4000L gereinigt. Moderate Verschmutzung.", techniker: "Stefan Keller", kosten: 2400, notizen: "" },

    // 2021
    { standort_id: "GAL-001", auftrag_id: null, datum: "2021-03-20", typ: "Boiler-Entkalkung", beschreibung: "Boiler Viessmann 200L entkalkt. 3-Jahres-Intervall. Moderate Kalkablagerungen, Anode noch ok.", techniker: "Daniel Zahner", kosten: 680, notizen: "" },
    { standort_id: "GAL-001", auftrag_id: null, datum: "2021-05-15", typ: "Filterwechsel", beschreibung: "Ölfilter Oventrop mit Tigerloop gewechselt. 2-Jahres-Intervall.", techniker: "Stefan Keller", kosten: 450, notizen: "" },
    { standort_id: "GAL-002", auftrag_id: null, datum: "2021-11-08", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 300L entkalkt. Hoher Kalkgehalt, starke Ablagerungen. Anode ersetzt.", techniker: "Marco Bianchi", kosten: 1050, notizen: "" },
    { standort_id: "GAL-003", auftrag_id: null, datum: "2021-04-15", typ: "Tankreinigung", beschreibung: "Öltank Roth 1500L gereinigt. Ca. 5cm Bodensatz. Tank in gutem Zustand.", techniker: "Thomas Meier", kosten: 1100, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2021-01-18", typ: "Filterwechsel", beschreibung: "Restaurantfilter halbjährlich gewechselt.", techniker: "Stefan Keller", kosten: 350, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2021-06-22", typ: "Boiler-Entkalkung", beschreibung: "Restaurant-Boiler Hoval 300L entkalkt. 3-Jahres-Intervall. Starke Verkalkung wegen Hochverbrauch.", techniker: "Daniel Zahner", kosten: 1150, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2021-07-15", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Filterwechsel.", techniker: "Marco Bianchi", kosten: 350, notizen: "" },
    { standort_id: "GAL-005", auftrag_id: null, datum: "2021-02-25", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 150L entkalkt. Niedrige Kalkregion, wenig Ablagerungen.", techniker: "Thomas Meier", kosten: 580, notizen: "" },
    { standort_id: "GAL-006", auftrag_id: null, datum: "2021-08-20", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop gewechselt. Gewerbebetrieb, Filter alle 2 Jahre.", techniker: "Stefan Keller", kosten: 500, notizen: "" },
    { standort_id: "GAL-007", auftrag_id: null, datum: "2021-07-08", typ: "Boiler-Entkalkung", beschreibung: "Schulhaus-Boiler in Sommerferien entkalkt. Hohe Kalkregion, starke Ablagerungen.", techniker: "Daniel Zahner", kosten: 1000, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2021-02-20", typ: "Filterwechsel", beschreibung: "Restaurant Sternen: Halbjährlicher BWT Filterwechsel.", techniker: "Thomas Meier", kosten: 370, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2021-07-25", typ: "Boiler-Entkalkung", beschreibung: "2 Boiler entkalkt (400L Hoval + 200L Stiebel Eltron). Grossbetrieb, starke Verkalkung.", techniker: "Daniel Zahner", kosten: 1700, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2021-08-15", typ: "Filterwechsel", beschreibung: "Halbjährlicher Wechsel Sommerperiode.", techniker: "Marco Bianchi", kosten: 370, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2021-06-10", typ: "Filterwechsel", beschreibung: "Wasserfilter BWT gewechselt. Grosses MFH, Filter stark belastet.", techniker: "Stefan Keller", kosten: 350, notizen: "" },
    { standort_id: "GAL-010", auftrag_id: null, datum: "2021-09-22", typ: "Tank-Sichtkontrolle", beschreibung: "10-Jahres-Sichtkontrolle Tank Roth 1500L. Tank 2010, guter Zustand. Alle Dichtungen ok.", techniker: "Thomas Meier", kosten: 400, notizen: "" },
    { standort_id: "GAL-011", auftrag_id: null, datum: "2021-03-15", typ: "Tankreinigung", beschreibung: "Tank Roth 3000L gereinigt. Ca. 8cm Schlamm. Tank intakt.", techniker: "Daniel Zahner", kosten: 1800, notizen: "" },
    { standort_id: "GAL-013", auftrag_id: null, datum: "2021-05-20", typ: "Boiler-Entkalkung", beschreibung: "Boiler Viessmann 200L entkalkt. Moderate Verkalkung.", techniker: "Marco Bianchi", kosten: 700, notizen: "" },
    { standort_id: "GAL-014", auftrag_id: null, datum: "2021-01-30", typ: "Filterwechsel", beschreibung: "Wasserfilter Kirchgemeindehaus gewechselt.", techniker: "Stefan Keller", kosten: 300, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2021-03-25", typ: "Filterwechsel", beschreibung: "Metzgerei jährlicher Filterwechsel BWT.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-016", auftrag_id: null, datum: "2021-10-05", typ: "Filterwechsel", beschreibung: "Ölfilter gewechselt. Filter Siku, 2-Jahres-Wechsel.", techniker: "Daniel Zahner", kosten: 280, notizen: "" },
    { standort_id: "GAL-018", auftrag_id: null, datum: "2021-04-10", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Alterszentrum gewechselt.", techniker: "Marco Bianchi", kosten: 320, notizen: "" },
    { standort_id: "GAL-019", auftrag_id: null, datum: "2021-08-15", typ: "Boiler-Entkalkung", beschreibung: "EFH Boiler Stiebel Eltron 200L entkalkt. Mittel-Kalkregion, normale Ablagerungen.", techniker: "Stefan Keller", kosten: 680, notizen: "" },
    { standort_id: "GAL-020", auftrag_id: null, datum: "2021-06-30", typ: "Boiler-Entkalkung", beschreibung: "Weingut Boiler Viessmann 150L entkalkt. Niedrige Kalkregion.", techniker: "Thomas Meier", kosten: 580, notizen: "" },
    { standort_id: "GAL-021", auftrag_id: null, datum: "2021-05-10", typ: "Filterwechsel", beschreibung: "Turnhalle Wasserfilter gewechselt.", techniker: "Daniel Zahner", kosten: 280, notizen: "" },
    { standort_id: "GAL-022", auftrag_id: null, datum: "2021-09-15", typ: "Filterwechsel", beschreibung: "Ölfilter mit Tigerloop Grosssiedlung gewechselt.", techniker: "Stefan Keller", kosten: 500, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2021-01-25", typ: "Filterwechsel", beschreibung: "Hotel Kronenhof Restaurant-Filter BWT gewechselt. Jährlich.", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-024", auftrag_id: null, datum: "2021-07-15", typ: "Filterwechsel", beschreibung: "Schulhaus Ölfilter in Sommerferien gewechselt.", techniker: "Thomas Meier", kosten: 280, notizen: "" },
    { standort_id: "GAL-026", auftrag_id: null, datum: "2021-11-20", typ: "Tankreinigung", beschreibung: "Gewerbehaus Tank Werit 3000L gereinigt.", techniker: "Daniel Zahner", kosten: 1800, notizen: "" },
    { standort_id: "GAL-027", auftrag_id: null, datum: "2021-04-30", typ: "Filterwechsel", beschreibung: "Wasserfilter BWT gewechselt. Regulärer 2-Jahres-Wechsel.", techniker: "Stefan Keller", kosten: 320, notizen: "" },
    { standort_id: "GAL-029", auftrag_id: null, datum: "2021-05-20", typ: "Filterwechsel", beschreibung: "Ölfilter mit Tigerloop gewechselt. Grosse Liegenschaft Schlieren.", techniker: "Marco Bianchi", kosten: 480, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2021-06-15", typ: "Filterwechsel", beschreibung: "Restaurant Da Giovanni BWT Filterkerze gewechselt.", techniker: "Thomas Meier", kosten: 370, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2021-12-10", typ: "Filterwechsel", beschreibung: "Halbjährlicher Filterwechsel Restaurant.", techniker: "Stefan Keller", kosten: 370, notizen: "" },
    { standort_id: "GAL-031", auftrag_id: null, datum: "2021-03-30", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Pflegeheim gewechselt.", techniker: "Daniel Zahner", kosten: 350, notizen: "" },
    { standort_id: "GAL-033", auftrag_id: null, datum: "2021-10-15", typ: "Tankreinigung", beschreibung: "2 Tanks à 3000L Genossenschaft gereinigt. Moderate Verschmutzung.", techniker: "Marco Bianchi", kosten: 3200, notizen: "" },
    { standort_id: "GAL-036", auftrag_id: null, datum: "2021-06-20", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Winterthur gewechselt.", techniker: "Thomas Meier", kosten: 500, notizen: "" },
    { standort_id: "GAL-037", auftrag_id: null, datum: "2021-09-08", typ: "Boiler-Entkalkung", beschreibung: "Altstadt-Boiler Viessmann 200L entkalkt. Hohe Kalkregion Winterthur.", techniker: "Stefan Keller", kosten: 780, notizen: "" },
    { standort_id: "GAL-038", auftrag_id: null, datum: "2021-04-18", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Industriegebäude gewechselt.", techniker: "Daniel Zahner", kosten: 520, notizen: "" },
    { standort_id: "GAL-039", auftrag_id: null, datum: "2021-07-12", typ: "Boiler-Entkalkung", beschreibung: "Seniorenresidenz Boiler Hoval 500L entkalkt. Hoher Kalkgehalt Winterthur, starke Ablagerungen.", techniker: "Marco Bianchi", kosten: 1650, notizen: "" },
    { standort_id: "GAL-039", auftrag_id: null, datum: "2021-11-05", typ: "Filterwechsel", beschreibung: "BWT Perla Filter gewechselt.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2021-02-15", typ: "Filterwechsel", beschreibung: "Gasthof Adler Restaurant-Filter BWT gewechselt.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2021-08-10", typ: "Boiler-Entkalkung", beschreibung: "2 Boiler Gasthof entkalkt. 400L Hoval + 200L Stiebel Eltron. Extreme Verkalkung Winterthur.", techniker: "Daniel Zahner", kosten: 1800, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2021-09-01", typ: "Filterwechsel", beschreibung: "Halbjährlicher Restaurant-Filter gewechselt.", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2021-03-10", typ: "Filterwechsel", beschreibung: "BWT Perla Filter Bäder-Quartier gewechselt. Extremer Kalk.", techniker: "Thomas Meier", kosten: 400, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2021-11-25", typ: "Boiler-Entkalkung", beschreibung: "Bäder-Quartier Boiler 400L entkalkt. Extremste Verkalkung im gesamten Kundenstamm. 5 Stunden Arbeit.", techniker: "Daniel Zahner", kosten: 1600, notizen: "" },
    { standort_id: "GAL-043", auftrag_id: null, datum: "2021-08-30", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 300L Spreitenbach entkalkt.", techniker: "Stefan Keller", kosten: 950, notizen: "" },
    { standort_id: "GAL-044", auftrag_id: null, datum: "2021-07-25", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Gewerbepark Wettingen gewechselt.", techniker: "Marco Bianchi", kosten: 520, notizen: "" },
    { standort_id: "GAL-046", auftrag_id: null, datum: "2021-06-08", typ: "Boiler-Entkalkung", beschreibung: "3 Boiler Schulanlage Ennetbaden entkalkt. Sehr starke Verkalkung. Ganzer Tag Arbeit.", techniker: "Daniel Zahner", kosten: 2200, notizen: "" },
    { standort_id: "GAL-047", auftrag_id: null, datum: "2021-05-25", typ: "Tankreinigung", beschreibung: "Tank Roth 2000L Wetzikon gereinigt.", techniker: "Thomas Meier", kosten: 1300, notizen: "" },
    { standort_id: "GAL-048", auftrag_id: null, datum: "2021-09-20", typ: "Tankreinigung", beschreibung: "2 Tanks à 3000L Baugenossenschaft Hinwil gereinigt.", techniker: "Stefan Keller", kosten: 3000, notizen: "" },
    { standort_id: "GAL-049", auftrag_id: null, datum: "2021-04-05", typ: "Filterwechsel", beschreibung: "Landgasthof Rössli Wasserfilter gewechselt.", techniker: "Marco Bianchi", kosten: 280, notizen: "" },
    { standort_id: "GAL-050", auftrag_id: null, datum: "2021-10-10", typ: "Boiler-Entkalkung", beschreibung: "Neubau-Boiler Viessmann 200L erstmals entkalkt. Wenig Kalk, niedrige Region.", techniker: "Thomas Meier", kosten: 580, notizen: "" },

    // 2022
    { standort_id: "GAL-002", auftrag_id: null, datum: "2022-05-12", typ: "Filterwechsel", beschreibung: "BWT Kalkschutz-Filter gewechselt. Regulärer 2-Jahres-Wechsel.", techniker: "Stefan Keller", kosten: 340, notizen: "" },
    { standort_id: "GAL-003", auftrag_id: null, datum: "2022-03-10", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 200L entkalkt. 3-Jahres-Intervall. Moderate Verkalkung.", techniker: "Daniel Zahner", kosten: 700, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2022-01-15", typ: "Filterwechsel", beschreibung: "Halbjährlicher Restaurantfilter-Wechsel.", techniker: "Thomas Meier", kosten: 360, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2022-07-10", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Filterwechsel Restaurant Löwen.", techniker: "Marco Bianchi", kosten: 360, notizen: "" },
    { standort_id: "GAL-005", auftrag_id: null, datum: "2022-09-15", typ: "Tankreinigung", beschreibung: "Tank Werit 2500L gereinigt. 5-Jahres-Reinigung.", techniker: "Daniel Zahner", kosten: 1500, notizen: "" },
    { standort_id: "GAL-007", auftrag_id: null, datum: "2022-04-20", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Schulhaus gewechselt.", techniker: "Stefan Keller", kosten: 320, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2022-02-18", typ: "Filterwechsel", beschreibung: "Restaurant Sternen Filterkerze erneuert.", techniker: "Thomas Meier", kosten: 370, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2022-08-22", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr BWT Filterwechsel.", techniker: "Daniel Zahner", kosten: 370, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2022-10-20", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop MFH Oerlikon gewechselt.", techniker: "Marco Bianchi", kosten: 500, notizen: "" },
    { standort_id: "GAL-010", auftrag_id: null, datum: "2022-06-18", typ: "Boiler-Entkalkung", beschreibung: "EFH Boiler Stiebel Eltron 200L entkalkt.", techniker: "Stefan Keller", kosten: 680, notizen: "" },
    { standort_id: "GAL-011", auftrag_id: null, datum: "2022-10-05", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 300L entkalkt. Hohe Kalkregion.", techniker: "Thomas Meier", kosten: 1050, notizen: "" },
    { standort_id: "GAL-012", auftrag_id: null, datum: "2022-04-10", typ: "Filterwechsel", beschreibung: "Autowaschanlage BWT Enthärtungsfilter gewechselt.", techniker: "Daniel Zahner", kosten: 450, notizen: "" },
    { standort_id: "GAL-013", auftrag_id: null, datum: "2022-07-15", typ: "Filterwechsel", beschreibung: "Ölfilter Siku gewechselt. MFH Kloten.", techniker: "Marco Bianchi", kosten: 280, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2022-04-20", typ: "Filterwechsel", beschreibung: "Metzgerei jährlicher BWT Filterwechsel.", techniker: "Stefan Keller", kosten: 390, notizen: "" },
    { standort_id: "GAL-016", auftrag_id: null, datum: "2022-03-25", typ: "Boiler-Entkalkung", beschreibung: "Bauernhof Boiler Stiebel Eltron 150L entkalkt. Geringe Verkalkung.", techniker: "Thomas Meier", kosten: 550, notizen: "" },
    { standort_id: "GAL-018", auftrag_id: null, datum: "2022-08-10", typ: "Boiler-Entkalkung", beschreibung: "Alterszentrum Grossboiler 500L entkalkt. Moderate Verkalkung.", techniker: "Daniel Zahner", kosten: 1550, notizen: "" },
    { standort_id: "GAL-022", auftrag_id: null, datum: "2022-05-20", typ: "Boiler-Entkalkung", beschreibung: "Grosssiedlung Boiler 500L entkalkt. Starke Verkalkung.", techniker: "Marco Bianchi", kosten: 1550, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2022-01-20", typ: "Filterwechsel", beschreibung: "Hotel Restaurant-Filter BWT jährlich gewechselt.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-024", auftrag_id: null, datum: "2022-12-10", typ: "Boiler-Entkalkung", beschreibung: "Schulhaus-Boiler Buderus 400L entkalkt.", techniker: "Thomas Meier", kosten: 1200, notizen: "" },
    { standort_id: "GAL-026", auftrag_id: null, datum: "2022-06-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Gewerbehaus Eglisau gewechselt.", techniker: "Daniel Zahner", kosten: 500, notizen: "" },
    { standort_id: "GAL-029", auftrag_id: null, datum: "2022-09-25", typ: "Tankreinigung", beschreibung: "Grosstank Haase 5000L Schlieren gereinigt.", techniker: "Marco Bianchi", kosten: 2800, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2022-06-20", typ: "Filterwechsel", beschreibung: "Restaurant Da Giovanni Filterwechsel.", techniker: "Stefan Keller", kosten: 370, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2022-12-15", typ: "Filterwechsel", beschreibung: "Halbjährlicher Wechsel Restaurant.", techniker: "Thomas Meier", kosten: 370, notizen: "" },
    { standort_id: "GAL-033", auftrag_id: null, datum: "2022-08-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Genossenschaft gewechselt.", techniker: "Daniel Zahner", kosten: 500, notizen: "" },
    { standort_id: "GAL-036", auftrag_id: null, datum: "2022-12-08", typ: "Boiler-Entkalkung", beschreibung: "Winterthur Altbau Boiler 300L entkalkt. Starke Verkalkung.", techniker: "Stefan Keller", kosten: 1050, notizen: "" },
    { standort_id: "GAL-038", auftrag_id: null, datum: "2022-09-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Industriegebäude Seen gewechselt.", techniker: "Marco Bianchi", kosten: 520, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2022-02-10", typ: "Filterwechsel", beschreibung: "Gasthof Adler Winter-Filterwechsel.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2022-08-25", typ: "Filterwechsel", beschreibung: "Gasthof Adler Sommer-Filterwechsel.", techniker: "Daniel Zahner", kosten: 380, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2022-04-05", typ: "Filterwechsel", beschreibung: "BWT Perla Bäder-Quartier gewechselt.", techniker: "Stefan Keller", kosten: 420, notizen: "" },
    { standort_id: "GAL-043", auftrag_id: null, datum: "2022-11-20", typ: "Filterwechsel", beschreibung: "Ölfilter Siku Spreitenbach gewechselt.", techniker: "Marco Bianchi", kosten: 300, notizen: "" },
    { standort_id: "GAL-046", auftrag_id: null, datum: "2022-11-10", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Schulanlage Ennetbaden gewechselt.", techniker: "Thomas Meier", kosten: 350, notizen: "" },
    { standort_id: "GAL-047", auftrag_id: null, datum: "2022-09-05", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Wetzikon gewechselt.", techniker: "Daniel Zahner", kosten: 480, notizen: "" },
    { standort_id: "GAL-049", auftrag_id: null, datum: "2022-04-15", typ: "Boiler-Entkalkung", beschreibung: "Landgasthof Rössli Boiler 200L entkalkt. Niedrige Kalkregion.", techniker: "Stefan Keller", kosten: 620, notizen: "" },

    // 2023
    { standort_id: "GAL-001", auftrag_id: null, datum: "2023-07-10", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop gewechselt. 2-Jahres-Intervall.", techniker: "Daniel Zahner", kosten: 460, notizen: "" },
    { standort_id: "GAL-002", auftrag_id: null, datum: "2023-06-15", typ: "Tankreinigung", beschreibung: "Tank Werit 3000L gereinigt. 5-Jahres-Reinigung. Ca. 12cm Bodensatz.", techniker: "Thomas Meier", kosten: 2000, notizen: "" },
    { standort_id: "GAL-003", auftrag_id: null, datum: "2023-09-20", typ: "Filterwechsel", beschreibung: "Ölfilter Siku gewechselt.", techniker: "Marco Bianchi", kosten: 280, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2023-01-15", typ: "Filterwechsel", beschreibung: "Restaurant Löwen Halbjahres-Filterwechsel.", techniker: "Stefan Keller", kosten: 360, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2023-07-20", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Filterwechsel.", techniker: "Daniel Zahner", kosten: 360, notizen: "" },
    { standort_id: "GAL-006", auftrag_id: null, datum: "2023-11-10", typ: "Tankreinigung", beschreibung: "Gewerbetank Haase 5000L gereinigt. Ca. 20cm Bodensatz, leichte Wandkorrosion.", techniker: "Daniel Zahner", kosten: 3400, notizen: "" },
    { standort_id: "GAL-006", auftrag_id: null, datum: "2023-10-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Gewerbebetrieb gewechselt.", techniker: "Thomas Meier", kosten: 520, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2023-02-20", typ: "Filterwechsel", beschreibung: "Restaurant Sternen BWT Filterkerze gewechselt.", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2023-08-25", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Restaurant Sternen.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2023-05-10", typ: "Tankreinigung", beschreibung: "2 Tanks MFH Oerlikon gereinigt. Grosser Aufwand.", techniker: "Daniel Zahner", kosten: 3200, notizen: "" },
    { standort_id: "GAL-010", auftrag_id: null, datum: "2023-04-15", typ: "Filterwechsel", beschreibung: "Wasserfilter EFH gewechselt.", techniker: "Thomas Meier", kosten: 300, notizen: "" },
    { standort_id: "GAL-011", auftrag_id: null, datum: "2023-08-10", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop gewechselt.", techniker: "Marco Bianchi", kosten: 500, notizen: "" },
    { standort_id: "GAL-012", auftrag_id: null, datum: "2023-06-05", typ: "Filterwechsel", beschreibung: "BWT Enthärtung Autowaschanlage gewartet.", techniker: "Stefan Keller", kosten: 480, notizen: "" },
    { standort_id: "GAL-013", auftrag_id: null, datum: "2023-02-28", typ: "Boiler-Entkalkung", beschreibung: "Boiler Viessmann 200L MFH Kloten entkalkt.", techniker: "Daniel Zahner", kosten: 720, notizen: "" },
    { standort_id: "GAL-014", auftrag_id: null, datum: "2023-07-20", typ: "Boiler-Entkalkung", beschreibung: "Kirchgemeindehaus Boiler Hoval 300L entkalkt.", techniker: "Thomas Meier", kosten: 950, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2023-04-25", typ: "Filterwechsel", beschreibung: "Metzgerei jährlicher BWT Filter.", techniker: "Marco Bianchi", kosten: 390, notizen: "" },
    { standort_id: "GAL-017", auftrag_id: null, datum: "2023-04-08", typ: "Boiler-Entkalkung", beschreibung: "Gemeindehaus Boiler Viessmann 300L entkalkt.", techniker: "Stefan Keller", kosten: 900, notizen: "" },
    { standort_id: "GAL-018", auftrag_id: null, datum: "2023-06-20", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Alterszentrum.", techniker: "Daniel Zahner", kosten: 340, notizen: "" },
    { standort_id: "GAL-019", auftrag_id: null, datum: "2023-12-05", typ: "Tankreinigung", beschreibung: "EFH Tank Roth 1500L gereinigt.", techniker: "Thomas Meier", kosten: 1100, notizen: "" },
    { standort_id: "GAL-020", auftrag_id: null, datum: "2023-05-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Weingut gewechselt.", techniker: "Marco Bianchi", kosten: 460, notizen: "" },
    { standort_id: "GAL-022", auftrag_id: null, datum: "2023-10-15", typ: "Filterwechsel", beschreibung: "BWT Perla Grosssiedlung gewechselt.", techniker: "Stefan Keller", kosten: 420, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2023-01-22", typ: "Filterwechsel", beschreibung: "Hotel Kronenhof jährlicher Filterwechsel.", techniker: "Daniel Zahner", kosten: 390, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2023-11-15", typ: "Boiler-Entkalkung", beschreibung: "Hotel 2 Boiler entkalkt. 500L + 300L. Starke Verkalkung.", techniker: "Thomas Meier", kosten: 2100, notizen: "" },
    { standort_id: "GAL-024", auftrag_id: null, datum: "2023-07-10", typ: "Filterwechsel", beschreibung: "Schulhaus Ölfilter Sommerferien.", techniker: "Marco Bianchi", kosten: 290, notizen: "" },
    { standort_id: "GAL-025", auftrag_id: null, datum: "2023-03-20", typ: "Tankreinigung", beschreibung: "Neubau Tank erstmals gereinigt (nach 8 Jahren). Wenig Verschmutzung.", techniker: "Stefan Keller", kosten: 900, notizen: "" },
    { standort_id: "GAL-027", auftrag_id: null, datum: "2023-09-10", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 200L entkalkt. Hohe Kalkregion Bülach.", techniker: "Daniel Zahner", kosten: 750, notizen: "" },
    { standort_id: "GAL-029", auftrag_id: null, datum: "2023-03-15", typ: "Boiler-Entkalkung", beschreibung: "Grossboiler Hoval 400L Schlieren entkalkt. Starke Verkalkung.", techniker: "Thomas Meier", kosten: 1300, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2023-06-18", typ: "Filterwechsel", beschreibung: "Restaurant Da Giovanni Halbjahres-Filterwechsel.", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2023-12-12", typ: "Filterwechsel", beschreibung: "Winter-Filterwechsel Restaurant.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-031", auftrag_id: null, datum: "2023-05-25", typ: "Boiler-Entkalkung", beschreibung: "Pflegeheim-Boiler Hoval 500L entkalkt.", techniker: "Daniel Zahner", kosten: 1600, notizen: "" },
    { standort_id: "GAL-033", auftrag_id: null, datum: "2023-03-30", typ: "Boiler-Entkalkung", beschreibung: "Genossenschaft Boiler Viessmann 400L entkalkt.", techniker: "Thomas Meier", kosten: 1200, notizen: "" },
    { standort_id: "GAL-036", auftrag_id: null, datum: "2023-08-20", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Winterthur gewechselt.", techniker: "Marco Bianchi", kosten: 520, notizen: "" },
    { standort_id: "GAL-037", auftrag_id: null, datum: "2023-12-15", typ: "Boiler-Entkalkung", beschreibung: "Altstadt-Boiler Viessmann 200L entkalkt.", techniker: "Stefan Keller", kosten: 800, notizen: "" },
    { standort_id: "GAL-039", auftrag_id: null, datum: "2023-10-20", typ: "Boiler-Entkalkung", beschreibung: "Seniorenresidenz Boiler 500L entkalkt. Winterthur hoher Kalk.", techniker: "Daniel Zahner", kosten: 1700, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2023-02-15", typ: "Filterwechsel", beschreibung: "Gasthof Adler Winter-Filter.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2023-08-18", typ: "Filterwechsel", beschreibung: "Gasthof Adler Sommer-Filter.", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2023-05-08", typ: "Filterwechsel", beschreibung: "BWT Perla Filter Bäder-Quartier.", techniker: "Stefan Keller", kosten: 420, notizen: "" },
    { standort_id: "GAL-044", auftrag_id: null, datum: "2023-06-30", typ: "Boiler-Entkalkung", beschreibung: "Gewerbepark Boiler Buderus 400L entkalkt.", techniker: "Daniel Zahner", kosten: 1350, notizen: "" },
    { standort_id: "GAL-046", auftrag_id: null, datum: "2023-12-05", typ: "Boiler-Entkalkung", beschreibung: "3 Boiler Schulanlage Ennetbaden entkalkt. Ganzer Tag.", techniker: "Thomas Meier", kosten: 2300, notizen: "" },
    { standort_id: "GAL-047", auftrag_id: null, datum: "2023-03-05", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 200L Wetzikon entkalkt.", techniker: "Marco Bianchi", kosten: 720, notizen: "" },
    { standort_id: "GAL-048", auftrag_id: null, datum: "2023-05-15", typ: "Boiler-Entkalkung", beschreibung: "Baugenossenschaft Boiler Viessmann 400L entkalkt.", techniker: "Stefan Keller", kosten: 1200, notizen: "" },
    { standort_id: "GAL-049", auftrag_id: null, datum: "2023-04-10", typ: "Filterwechsel", beschreibung: "Landgasthof Rössli Wasserfilter jährlich.", techniker: "Daniel Zahner", kosten: 290, notizen: "" },
    { standort_id: "GAL-050", auftrag_id: null, datum: "2023-02-10", typ: "Filterwechsel", beschreibung: "Neubau Wasserfilter erstmals gewechselt.", techniker: "Thomas Meier", kosten: 280, notizen: "" },

    // 2024
    { standort_id: "GAL-001", auftrag_id: null, datum: "2024-04-15", typ: "Boiler-Entkalkung", beschreibung: "Boiler Viessmann 200L entkalkt. 3-Jahres-Intervall. Moderate Ablagerungen.", techniker: "Daniel Zahner", kosten: 700, notizen: "" },
    { standort_id: "GAL-002", auftrag_id: null, datum: "2024-11-20", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 300L entkalkt. Hohe Kalkregion, starke Ablagerungen.", techniker: "Marco Bianchi", kosten: 1100, notizen: "" },
    { standort_id: "GAL-003", auftrag_id: null, datum: "2024-06-10", typ: "Boiler-Entkalkung", beschreibung: "Boiler Buderus 200L entkalkt. 3-Jahres-Rhythmus.", techniker: "Stefan Keller", kosten: 720, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2024-01-18", typ: "Filterwechsel", beschreibung: "Restaurant Löwen Halbjahres-Filter.", techniker: "Thomas Meier", kosten: 370, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2024-07-15", typ: "Boiler-Entkalkung", beschreibung: "Restaurant-Boiler Hoval 300L entkalkt. 3-Jahres-Intervall.", techniker: "Daniel Zahner", kosten: 1200, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2024-07-22", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Filterwechsel.", techniker: "Marco Bianchi", kosten: 370, notizen: "" },
    { standort_id: "GAL-005", auftrag_id: null, datum: "2024-03-20", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 150L entkalkt. Niedrige Kalkregion.", techniker: "Stefan Keller", kosten: 600, notizen: "" },
    { standort_id: "GAL-007", auftrag_id: null, datum: "2024-07-08", typ: "Boiler-Entkalkung", beschreibung: "Schulhaus-Boiler Viessmann 300L Sommerferien entkalkt.", techniker: "Thomas Meier", kosten: 1020, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2024-02-20", typ: "Filterwechsel", beschreibung: "Restaurant Sternen Winter-Filterwechsel.", techniker: "Daniel Zahner", kosten: 380, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2024-08-15", typ: "Boiler-Entkalkung", beschreibung: "2 Boiler Restaurant Sternen entkalkt. Starke Verkalkung.", techniker: "Marco Bianchi", kosten: 1800, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2024-08-25", typ: "Filterwechsel", beschreibung: "Sommer-Filterwechsel.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-009", auftrag_id: null, datum: "2024-03-10", typ: "Filterwechsel", beschreibung: "BWT Filtervlies MFH Oerlikon.", techniker: "Thomas Meier", kosten: 350, notizen: "" },
    { standort_id: "GAL-010", auftrag_id: null, datum: "2024-07-22", typ: "Filterwechsel", beschreibung: "Wasserfilter EFH gewechselt. 2-Jahres-Intervall.", techniker: "Daniel Zahner", kosten: 320, notizen: "" },
    { standort_id: "GAL-013", auftrag_id: null, datum: "2024-09-05", typ: "Filterwechsel", beschreibung: "Ölfilter Siku MFH Kloten gewechselt.", techniker: "Marco Bianchi", kosten: 290, notizen: "" },
    { standort_id: "GAL-015", auftrag_id: null, datum: "2024-04-20", typ: "Filterwechsel", beschreibung: "Metzgerei jährlicher BWT Filter.", techniker: "Stefan Keller", kosten: 400, notizen: "" },
    { standort_id: "GAL-016", auftrag_id: null, datum: "2024-11-10", typ: "Filterwechsel", beschreibung: "Ölfilter Siku Bauernhof gewechselt.", techniker: "Thomas Meier", kosten: 290, notizen: "" },
    { standort_id: "GAL-017", auftrag_id: null, datum: "2024-05-15", typ: "Filterwechsel", beschreibung: "Gemeindehaus Wasserfilter gewechselt.", techniker: "Daniel Zahner", kosten: 340, notizen: "" },
    { standort_id: "GAL-018", auftrag_id: null, datum: "2024-08-22", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Alterszentrum.", techniker: "Marco Bianchi", kosten: 340, notizen: "" },
    { standort_id: "GAL-020", auftrag_id: null, datum: "2024-06-25", typ: "Boiler-Entkalkung", beschreibung: "Weingut Boiler 150L entkalkt.", techniker: "Stefan Keller", kosten: 600, notizen: "" },
    { standort_id: "GAL-021", auftrag_id: null, datum: "2024-05-10", typ: "Boiler-Entkalkung", beschreibung: "Turnhalle Boiler 300L entkalkt.", techniker: "Thomas Meier", kosten: 920, notizen: "" },
    { standort_id: "GAL-022", auftrag_id: null, datum: "2024-04-05", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Grosssiedlung.", techniker: "Daniel Zahner", kosten: 520, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2024-01-25", typ: "Filterwechsel", beschreibung: "Hotel Kronenhof Restaurant-Filter jährlich.", techniker: "Marco Bianchi", kosten: 400, notizen: "" },
    { standort_id: "GAL-027", auftrag_id: null, datum: "2024-05-30", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Bürkli Verwaltungen.", techniker: "Stefan Keller", kosten: 340, notizen: "" },
    { standort_id: "GAL-029", auftrag_id: null, datum: "2024-07-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Schlieren.", techniker: "Thomas Meier", kosten: 500, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2024-06-10", typ: "Boiler-Entkalkung", beschreibung: "Restaurant Da Giovanni Boiler 300L entkalkt.", techniker: "Daniel Zahner", kosten: 1050, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2024-06-15", typ: "Filterwechsel", beschreibung: "Restaurant Halbjahres-Filterwechsel.", techniker: "Marco Bianchi", kosten: 380, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2024-12-10", typ: "Filterwechsel", beschreibung: "Winter-Filterwechsel.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-031", auftrag_id: null, datum: "2024-06-08", typ: "Filterwechsel", beschreibung: "BWT Perla Pflegeheim gewechselt.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-033", auftrag_id: null, datum: "2024-09-20", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Genossenschaft.", techniker: "Daniel Zahner", kosten: 520, notizen: "" },
    { standort_id: "GAL-036", auftrag_id: null, datum: "2024-10-15", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Winterthur.", techniker: "Marco Bianchi", kosten: 540, notizen: "" },
    { standort_id: "GAL-038", auftrag_id: null, datum: "2024-04-20", typ: "Boiler-Entkalkung", beschreibung: "Industriegebäude Boiler 500L entkalkt.", techniker: "Stefan Keller", kosten: 1500, notizen: "" },
    { standort_id: "GAL-039", auftrag_id: null, datum: "2024-05-15", typ: "Filterwechsel", beschreibung: "BWT Perla Filter Seniorenresidenz.", techniker: "Thomas Meier", kosten: 400, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2024-02-12", typ: "Filterwechsel", beschreibung: "Gasthof Adler Winter-Filter.", techniker: "Daniel Zahner", kosten: 390, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2024-08-15", typ: "Boiler-Entkalkung", beschreibung: "2 Boiler Gasthof entkalkt. Winterthur hoher Kalk.", techniker: "Marco Bianchi", kosten: 1900, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2024-08-22", typ: "Filterwechsel", beschreibung: "Sommer-Filterwechsel.", techniker: "Stefan Keller", kosten: 390, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2024-06-18", typ: "Boiler-Entkalkung", beschreibung: "Bäder-Quartier Boiler 400L entkalkt. Extremer Thermalkalk.", techniker: "Thomas Meier", kosten: 1550, notizen: "" },
    { standort_id: "GAL-043", auftrag_id: null, datum: "2024-11-08", typ: "Boiler-Entkalkung", beschreibung: "Boiler 300L Spreitenbach entkalkt.", techniker: "Daniel Zahner", kosten: 1000, notizen: "" },
    { standort_id: "GAL-044", auftrag_id: null, datum: "2024-09-25", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Gewerbepark Wettingen.", techniker: "Marco Bianchi", kosten: 540, notizen: "" },
    { standort_id: "GAL-046", auftrag_id: null, datum: "2024-10-05", typ: "Filterwechsel", beschreibung: "BWT Filtervlies Schulanlage.", techniker: "Stefan Keller", kosten: 360, notizen: "" },
    { standort_id: "GAL-047", auftrag_id: null, datum: "2024-11-20", typ: "Filterwechsel", beschreibung: "Ölfilter Tigerloop Wetzikon.", techniker: "Thomas Meier", kosten: 500, notizen: "" },
    { standort_id: "GAL-048", auftrag_id: null, datum: "2024-07-10", typ: "Filterwechsel", beschreibung: "Wasserfilter Baugenossenschaft gewechselt.", techniker: "Daniel Zahner", kosten: 340, notizen: "" },
    { standort_id: "GAL-049", auftrag_id: null, datum: "2024-04-08", typ: "Filterwechsel", beschreibung: "Landgasthof Rössli jährlicher Filter.", techniker: "Marco Bianchi", kosten: 300, notizen: "" },
    { standort_id: "GAL-050", auftrag_id: null, datum: "2024-10-25", typ: "Boiler-Entkalkung", beschreibung: "Neubau Boiler Viessmann 200L entkalkt. Niedrige Kalkregion.", techniker: "Stefan Keller", kosten: 600, notizen: "" },

    // 2025 (recent history)
    { standort_id: "GAL-001", auftrag_id: null, datum: "2025-01-20", typ: "Tank-Sichtkontrolle", beschreibung: "10-Jahres-Sichtkontrolle Tank Roth 2000L. Tank Baujahr 2005, in gutem Zustand. Alle Dichtungen ok.", techniker: "Daniel Zahner", kosten: 420, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2025-01-15", typ: "Filterwechsel", beschreibung: "Restaurant Löwen Halbjahres-Filterwechsel. BWT Filterkerze erneuert.", techniker: "Thomas Meier", kosten: 380, notizen: "" },
    { standort_id: "GAL-004", auftrag_id: null, datum: "2025-07-18", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Filterwechsel Restaurant Löwen.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-005", auftrag_id: null, datum: "2025-02-10", typ: "Boiler-Entkalkung", beschreibung: "Boiler Stiebel Eltron 150L entkalkt. Niedrige Kalkregion, wenig Ablagerung.", techniker: "Marco Bianchi", kosten: 620, notizen: "" },
    { standort_id: "GAL-007", auftrag_id: null, datum: "2025-03-15", typ: "Tankreinigung", beschreibung: "Schulhaus Tank Roth 4000L in Frühlingsferien gereinigt. Ca. 10cm Bodensatz.", techniker: "Daniel Zahner", kosten: 2400, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2025-02-18", typ: "Filterwechsel", beschreibung: "Restaurant Sternen BWT Filterkerze. Winterhalbjahr.", techniker: "Thomas Meier", kosten: 390, notizen: "" },
    { standort_id: "GAL-008", auftrag_id: null, datum: "2025-08-20", typ: "Filterwechsel", beschreibung: "Sommerhalbjahr Restaurant Sternen.", techniker: "Stefan Keller", kosten: 390, notizen: "" },
    { standort_id: "GAL-012", auftrag_id: null, datum: "2025-03-10", typ: "Filterwechsel", beschreibung: "Autowaschanlage BWT Enthärtung gewartet.", techniker: "Marco Bianchi", kosten: 480, notizen: "" },
    { standort_id: "GAL-016", auftrag_id: null, datum: "2025-04-20", typ: "Boiler-Entkalkung", beschreibung: "Bauernhof Boiler Stiebel Eltron 150L entkalkt.", techniker: "Daniel Zahner", kosten: 570, notizen: "" },
    { standort_id: "GAL-023", auftrag_id: null, datum: "2025-01-28", typ: "Filterwechsel", beschreibung: "Hotel Kronenhof jährlicher Restaurant-Filter.", techniker: "Thomas Meier", kosten: 400, notizen: "" },
    { standort_id: "GAL-025", auftrag_id: null, datum: "2025-06-15", typ: "Tank-Sichtkontrolle", beschreibung: "10-Jahres-Kontrolle Neubau-Tank. Alles bestens, Tank wie neu.", techniker: "Stefan Keller", kosten: 380, notizen: "" },
    { standort_id: "GAL-030", auftrag_id: null, datum: "2025-06-12", typ: "Filterwechsel", beschreibung: "Restaurant Da Giovanni Halbjahres-Filter.", techniker: "Marco Bianchi", kosten: 390, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2025-02-10", typ: "Filterwechsel", beschreibung: "Gasthof Adler Winter-Filterwechsel.", techniker: "Daniel Zahner", kosten: 390, notizen: "" },
    { standort_id: "GAL-041", auftrag_id: null, datum: "2025-08-12", typ: "Filterwechsel", beschreibung: "Gasthof Adler Sommer-Filterwechsel.", techniker: "Thomas Meier", kosten: 390, notizen: "" },
    { standort_id: "GAL-042", auftrag_id: null, datum: "2025-05-10", typ: "Filterwechsel", beschreibung: "BWT Perla Bäder-Quartier. Extremer Kalk.", techniker: "Stefan Keller", kosten: 440, notizen: "" },
    { standort_id: "GAL-049", auftrag_id: null, datum: "2025-04-05", typ: "Filterwechsel", beschreibung: "Landgasthof Rössli jährlicher Filterwechsel.", techniker: "Marco Bianchi", kosten: 310, notizen: "" },
  ];

  // ---------------------------------------------------------------------------
  // WOCHENPLAN (next week Mon-Fri for Daniel Zahner, 3-5 per day)
  // ---------------------------------------------------------------------------
  interface WochenplanEntry {
    mitarbeiter: string; datum: string; standort_id: string;
    auftrag_ids: string; reihenfolge: number; notizen: string;
  }

  const wochenplan: WochenplanEntry[] = [
    // Monday 2026-03-16
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-16", standort_id: "GAL-023", auftrag_ids: "", reihenfolge: 1, notizen: "Hotel Kronenhof: 2 Boiler entkalken + Filterwechsel" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-16", standort_id: "GAL-022", auftrag_ids: "", reihenfolge: 2, notizen: "Tankreinigung Angebot besprechen" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-16", standort_id: "GAL-024", auftrag_ids: "", reihenfolge: 3, notizen: "Nachkontrolle Boiler-Entkalkung" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-16", standort_id: "GAL-027", auftrag_ids: "", reihenfolge: 4, notizen: "Offerte für Entkalkung abgeben" },

    // Tuesday 2026-03-17
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-17", standort_id: "GAL-012", auftrag_ids: "", reihenfolge: 1, notizen: "Autowaschanlage Filterwechsel" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-17", standort_id: "GAL-009", auftrag_ids: "", reihenfolge: 2, notizen: "Tankreinigung Angebot übergeben" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-17", standort_id: "GAL-011", auftrag_ids: "", reihenfolge: 3, notizen: "Boiler-Entkalkung Angebot" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-17", standort_id: "GAL-030", auftrag_ids: "", reihenfolge: 4, notizen: "Restaurant Filterwechsel" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-17", standort_id: "GAL-015", auftrag_ids: "", reihenfolge: 5, notizen: "Metzgerei Filterwechsel" },

    // Wednesday 2026-03-18
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-18", standort_id: "GAL-004", auftrag_ids: "", reihenfolge: 1, notizen: "Restaurant Löwen: Boiler-Entkalkung + Filter" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-18", standort_id: "GAL-001", auftrag_ids: "", reihenfolge: 2, notizen: "Tigerloop-Filterwechsel" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-18", standort_id: "GAL-003", auftrag_ids: "", reihenfolge: 3, notizen: "Boiler-Entkalkung Offerte besprechen" },

    // Thursday 2026-03-19
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-19", standort_id: "GAL-008", auftrag_ids: "", reihenfolge: 1, notizen: "Restaurant Sternen: 2 Boiler entkalken" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-19", standort_id: "GAL-041", auftrag_ids: "", reihenfolge: 2, notizen: "Gasthof Adler: 2 Boiler + Filter" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-19", standort_id: "GAL-036", auftrag_ids: "", reihenfolge: 3, notizen: "Tankreinigung Offerte Winterthur" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-19", standort_id: "GAL-037", auftrag_ids: "", reihenfolge: 4, notizen: "Boiler-Entkalkung Offerte Altstadt" },

    // Friday 2026-03-20
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-20", standort_id: "GAL-042", auftrag_ids: "", reihenfolge: 1, notizen: "Bäder-Quartier Boiler (stark verkalkt)" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-20", standort_id: "GAL-044", auftrag_ids: "", reihenfolge: 2, notizen: "Gewerbepark Tankreinigung Offerte" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-20", standort_id: "GAL-046", auftrag_ids: "", reihenfolge: 3, notizen: "Schulanlage 3 Boiler Offerte" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-20", standort_id: "GAL-043", auftrag_ids: "", reihenfolge: 4, notizen: "Boiler-Entkalkung Offerte Spreitenbach" },
    { mitarbeiter: "Daniel Zahner", datum: "2026-03-20", standort_id: "GAL-045", auftrag_ids: "", reihenfolge: 5, notizen: "EFH Hofer Kurzbesuch" },
  ];

  // ---------------------------------------------------------------------------
  // Execute all inserts in a transaction
  // ---------------------------------------------------------------------------
  const seed = db.transaction(() => {
    for (const s of standorte) {
      insertStandort.run(s.id, s.firma, s.strasse, s.plz, s.ort, s.region, s.kanton, s.lat, s.lon, s.zugang, s.kalk, s.restaurant, s.notizen);
    }

    for (const k of kontakte) {
      insertKontakt.run(k.standort_id, k.typ, k.name, k.telefon, k.email, k.notizen);
    }

    for (const a of anlagen) {
      insertAnlage.run(a.standort_id, a.typ, a.modell, a.hersteller, a.baujahr, a.kapazitaet, a.hat_tigerloop, a.filter_modell, a.notizen);
    }

    for (const a of auftraege) {
      insertAuftrag.run(a.standort_id, a.typ, a.status, a.faellig_am, a.intervall_jahre, a.angebots_datum, a.angebots_betrag, a.erledigt_am, a.techniker, a.kosten, a.notizen);
    }

    for (const h of historie) {
      insertHistorie.run(h.standort_id, h.auftrag_id, h.datum, h.typ, h.beschreibung, h.techniker, h.kosten, h.notizen);
    }

    for (const w of wochenplan) {
      insertWochenplan.run(w.mitarbeiter, w.datum, w.standort_id, w.auftrag_ids, w.reihenfolge, w.notizen);
    }
  });

  seed();
}
