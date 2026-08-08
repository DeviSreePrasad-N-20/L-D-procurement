# Corporate Learning Demand, Inventory & Procurement Optimiser

AI-assisted demand forecasting, inventory, and procurement optimiser for an
Enterprise L&D team. Node.js/Express + PostgreSQL (Prisma) backend, React
(Vite + Tailwind) frontend.

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| **Frontend** | [https://l-d-procurement.vercel.app](https://l-d-procurement.vercel.app) |
| **Backend API** | [https://l-d-procurement.onrender.com](https://l-d-procurement.onrender.com) |

---

## 👥 Demo User Accounts

All accounts use password: **`Password123!`**

### Operations Team (Core Platform Users)

| # | Name | Email | Role | Dashboard | What They Can Do |
|---|------|-------|------|-----------|-----------------|
| 1 | **Ana Admin** | `admin@demo.local` | `ADMIN` | Operations Dashboard | Full system access. View inventory metrics, manage users, approve/reject all purchase requests, view audit logs, export reports. |
| 2 | **Ivan Planner** | `planner@demo.local` | `INVENTORY_PLANNER` | Operations Dashboard | Monitor stock levels, run AI demand forecasts, generate replenishment recommendations, create purchase requests, review approvals. |
| 3 | **Priya Procurement** | `procurement@demo.local` | `PROCUREMENT_MANAGER` | Operations Dashboard | Review and approve/reject purchase requests, manage supplier relationships, view supplier scorecards, create purchase orders. |
| 4 | **Fiona Finance** | `finance@demo.local` | `FINANCE_REVIEWER` | Operations Dashboard | Review financial implications of purchase requests, view spending reports, export inventory CSV reports. |
| 5 | **Wesley Warehouse** | `warehouse@demo.local` | `WAREHOUSE_USER` | Operations Dashboard | Monitor stock balances across locations, track lot movements, view item details and availability. |

### Business Users (Role-Specific Dashboards)

| # | Name | Email | Role | Dashboard | What They Can Do |
|---|------|-------|------|-----------|-----------------|
| 6 | **Harry HR** | `hr@demo.local` | `HR_PARTNER` | Workforce Planning & L&D | Create new purchase requests (pick category, item, quantity), view request history with approval status, track who approved/rejected each request. |
| 7 | **Manny Manager** | `manager@demo.local` | `MANAGER` | Team Training Hub | Request course subscriptions and certification vouchers for team members, view team request history with live KPI cards (pending, approved counts). |
| 8 | **Ira Instructor** | `instructor@demo.local` | `INSTRUCTOR` | Instructor Portal | View upcoming class schedule, request training materials / course licences / devices for students, track material request history. |
| 9 | **Evan Employee** | `employee@demo.local` | `EMPLOYEE` | Self-Service Training Portal | Request training resources for personal career development (courses, certifications, materials), view personal request history. |
| 10 | **Sam Supplier** | `supplier@demo.local` | `SUPPLIER` | Partner Portal | View supplier network scorecards (risk scores, lead times, delivery performance), view order history. |

---

## 🔄 Approval Workflow

The platform enforces an **interlinked approval chain** where every purchase request must be reviewed by an authorized user:

```
Requestor (HR / Manager / Employee / Instructor)
        │
        ▼
  Purchase Request Created
        │
        ▼
  Status: PENDING_REVIEW
        │
        ▼
  Approver (Admin / Procurement / Planner)
        │
        ├── ✅ APPROVED → Request fulfilled
        ├── ❌ REJECTED → Request denied
        └── ⏸️ DEFERRED → Request postponed
```

**Key Rule:** Once an Admin approves a request, no other user can override or reject it.

### How to Test the Full Workflow:
1. Log in as `hr@demo.local` → Click **"New Request"** → Select a category, item, and quantity → Submit
2. Log in as `admin@demo.local` → Go to **Approvals** tab → Approve or reject the request
3. Log back in as `hr@demo.local` → Check **"My Request History"** → See: *"Approved by Ana Admin (Admin)"*

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** JWT access + refresh tokens, bcrypt password hashing
- **AI:** Statistical demand forecasting (weighted moving average + trend) with optional Gemini LLM explanations
- **Deployment:** Vercel (frontend) + Render (backend)

### Features Built
- ✅ Full Prisma schema: org/auth/RBAC, learning domain, inventory domain, procurement, governance
- ✅ JWT auth with silent token refresh and role-based access control
- ✅ 12 role-gated pages with dynamic sidebar navigation
- ✅ Role-specific dashboards (HR, Manager, Instructor, Employee, Supplier)
- ✅ Interactive purchase request creation with item catalog browser
- ✅ Visual approval workflow chain (Requestor ➡️ Approver)
- ✅ Persistent request history with live approver tracking
- ✅ AI demand forecasting with confidence scores and model versioning
- ✅ Supplier scorecards with risk scoring and delivery metrics
- ✅ Replenishment simulator with demand multiplier scenarios
- ✅ Audit trail logging for all system actions
- ✅ Real-time notifications system
- ✅ CSV inventory report export
- ✅ User management (create users, toggle status)

---

## 🚀 Getting Started (Local Development)

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

---

## 📁 Project Structure
```
backend/
  prisma/schema.prisma       # full data model (12 roles, 50 items, 5 suppliers)
  prisma/seed.js             # demo data generator
  src/
    middleware/              # auth, RBAC, validation, error handling
    routes/                  # REST API route definitions
    controllers/             # request handlers
    services/                # business logic (auth, forecasting)
    utils/                   # JWT, audit logging

frontend/
  src/
    api/axiosClient.js       # Axios with JWT interceptors
    context/AuthContext.jsx   # Auth state management
    components/
      layout/                # Sidebar, Topbar, DashboardLayout
      common/                # ProtectedRoute, RoleGuard, OperationalUI
      dashboards/            # Role-specific dashboard components
    pages/                   # 12 page components
    routes/routeConfig.js    # nav + role access config
```

---

## 🎨 Design Notes
- Palette/type are custom tokens in `frontend/tailwind.config.js` (deep
  indigo `primary`, muted brass `accent`, serif display + IBM Plex Sans/Mono)
  rather than default Tailwind blue-on-white.
- The recurring **status rail** (a thin left-edge color bar on cards, table
  rows, notifications) is the one visual signature used throughout — a
  quick, consistent way for planners to read state at a glance.

---

## 📄 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/login` | Public | Login with email/password |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh JWT tokens |
| `GET` | `/api/v1/auth/me` | 🔒 | Get current user profile |
| `GET` | `/api/v1/items` | 🔒 | List items (filterable by category) |
| `GET` | `/api/v1/items/:id` | 🔒 | Get item details with stock balances |
| `POST` | `/api/v1/items` | 🔒 Admin/Planner | Create a new inventory item |
| `POST` | `/api/v1/items/:id/forecasts/generate` | 🔒 | Generate AI demand forecast |
| `GET` | `/api/v1/operations/dashboard` | 🔒 | Dashboard summary metrics |
| `GET` | `/api/v1/operations/replenishment` | 🔒 | Replenishment recommendations |
| `GET` | `/api/v1/operations/suppliers/scorecards` | 🔒 | Supplier scorecards |
| `GET` | `/api/v1/operations/approvals` | 🔒 Admin/Procurement/Planner | List all approvals |
| `PATCH` | `/api/v1/operations/approvals/:id` | 🔒 Admin/Procurement/Planner | Approve/reject/defer |
| `GET` | `/api/v1/operations/purchase-requests/me` | 🔒 | My purchase request history |
| `POST` | `/api/v1/operations/purchase-requests` | 🔒 | Create a purchase request |
| `GET` | `/api/v1/operations/outcomes` | 🔒 | Forecast accuracy metrics |
| `GET` | `/api/v1/operations/reports/inventory.csv` | 🔒 | Export inventory as CSV |
| `GET` | `/api/v1/users` | 🔒 Admin | List all users |
| `POST` | `/api/v1/users` | 🔒 Admin | Create a new user |
| `PATCH` | `/api/v1/users/:id/status` | 🔒 Admin | Toggle user active/inactive |
| `GET` | `/api/v1/notifications` | 🔒 | List user notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | 🔒 | Mark notification as read |
| `GET` | `/api/v1/audit-logs` | 🔒 Admin | View audit trail |
