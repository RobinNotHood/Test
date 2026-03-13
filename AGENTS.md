# AGENTS.md

## Cursor Cloud specific instructions

### Projects in this repository

This repo contains two projects:

1. **VR Capability Checker** (root) — Windows-only WPF desktop app (.NET 8.0). Cannot build/run on Linux.
2. **Galvomag AG App** (`galvomag-app/`) — Full-stack Next.js business management app. **This is the primary development target.**

### Galvomag AG App (`galvomag-app/`)

A German-language business management app for Galvomag AG (Swiss tank & boiler service company). Built with Next.js 16, TypeScript, Tailwind CSS v4, and SQLite (better-sqlite3).

**Key commands:**
- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npx eslint src/` — Lint check
- Database is auto-seeded on first API request (50 Swiss locations with extensive test data)

**Architecture:**
- `src/app/` — Next.js App Router pages (Dashboard, Standorte, Aufträge, Routenplanung)
- `src/app/api/` — REST API endpoints (standorte, auftraege, dashboard, seed)
- `src/lib/db.ts` — SQLite database connection and schema
- `src/lib/seed.ts` — Swiss test data seeder (runs once automatically)
- `src/components/` — Shared components (Sidebar)
- `galvomag.db` — SQLite database file (auto-created, gitignored)

**Gotchas:**
- The SQLite database file `galvomag.db` is created at project root on first run. If data looks stale, delete it and restart.
- The `better-sqlite3` package requires native compilation; `npm install` handles this.
- No `.env` file or secrets are needed.

### VR Capability Checker (root)

Windows-only WPF application targeting `net8.0-windows`. Cannot build or run on Linux.
- `dotnet restore` works on Linux (fetches `System.Management 7.0.2`).
- `dotnet build` / `dotnet run` require Windows.
- Pre-built executable: `dist/VRCapabilityChecker.exe` (69 MB).
