# Corporate Learning Demand, Inventory & Procurement Optimiser

AI-assisted demand forecasting, inventory, and procurement optimiser for an
Enterprise L&D team. Node.js/Express + PostgreSQL (Prisma) backend, React
(Vite + Tailwind) frontend.

## What's built (Phase 1 — Foundation)

- **Database:** full Prisma schema covering org/auth/RBAC, the learning
  domain (skills, courses, enrolments, certifications), the inventory domain
  (items, lots, stock, demand history, forecasts, replenishment params),
  procurement (suppliers, purchase requests/orders, receipts), and
  governance (AI runs, approvals, audit logs, notifications).
- **Auth:** JWT access + refresh tokens, bcrypt password hashing, silent
  token refresh on the frontend, role-based access control enforced
  server-side on every route.
- **API:** versioned REST under `/api/v1` — auth, items (with tenant
  isolation, filtering, pagination), demand forecasting (with an AI-run +
  audit trail), users, notifications, audit logs.
- **AI layer:** `forecast.service.js` — a statistical baseline (weighted
  moving average + trend) that works offline, plus an optional Gemini
  adapter for natural-language explanations. Every forecast is persisted
  with its input snapshot, model version, and confidence for review/
  override — the AI never writes to stock or purchasing directly.
- **Frontend:** all 12 required pages routed and role-gated. **Login**,
  **Dashboard**, and **Notifications** are fully wired to the live API.
  The remaining 9 pages are placeholder shells (already in nav, routing,
  and RBAC) ready to be filled in — each placeholder lists exactly which
  backend endpoints it will connect to.

## What's next (Phase 2+)

Build out each remaining page one at a time against the live API:
Items/Lots/Stock detail, Replenishment & Purchase Planning, Approvals &
Overrides, Recommendations, Outcomes & Accuracy, Reports & Analytics, User
Management, Audit Logs. Then: MFA for privileged roles, CSV/PDF export,
background jobs for scheduled forecasting, and the remaining AI capabilities
(supplier risk scoring, substitute recommendations, PO anomaly detection).

## Getting started

### 1. Database
Create a PostgreSQL database (local, Supabase, or any managed Postgres).

#### Supabase on an IPv4-only network

This app connects through Prisma, so it requires a PostgreSQL connection URI;
Supabase API keys (`SUPABASE_URL`, publishable keys, or secret keys) are not
used by this project. In the Supabase dashboard, choose **Connect** and copy
the **Session pooler** URI (port `5432`). Put that URI in
`backend/.env` as `DATABASE_URL`, replacing `[YOUR-PASSWORD]` with a
URL-encoded database password. This avoids the IPv6-only direct endpoint.

Do not commit or share the connection URI, database password, or JWT secrets.

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT secrets
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed                 # creates demo org, roles, users, sample items
npm run dev                  # http://localhost:4000
```

Demo logins (all use password `Password123!`):
`admin@demo.local`, `procurement@demo.local`, `planner@demo.local`,
`warehouse@demo.local`, `supplier@demo.local`, `finance@demo.local`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```
Vite proxies `/api` to `http://localhost:4000` in dev (see `vite.config.js`).

### 4. Optional: Gemini forecast explanations
Set `GEMINI_API_KEY` in `backend/.env`. Without it, forecasts still work —
they just use a templated (non-LLM) explanation instead. The key is only
ever read server-side; it's never sent to or used in the frontend.

## Project structure
```
backend/
  prisma/schema.prisma   # full data model
  prisma/seed.js         # demo data
  src/
    middleware/          # auth, RBAC, validation, error handling
    routes/ controllers/ services/
frontend/
  src/
    context/AuthContext.jsx
    components/layout/   # Sidebar, Topbar, DashboardLayout
    components/common/   # ProtectedRoute, RoleGuard, PagePlaceholder
    pages/                # one file per required page
    routes/routeConfig.js # single source of truth for nav + role access
```

## Design notes
- Palette/type are custom tokens in `frontend/tailwind.config.js` (deep
  indigo `primary`, muted brass `accent`, serif display + IBM Plex Sans/Mono)
  rather than default Tailwind blue-on-white.
- The recurring **status rail** (a thin left-edge color bar on cards, table
  rows, notifications) is the one visual signature used throughout — a
  quick, consistent way for planners to read state at a glance.
