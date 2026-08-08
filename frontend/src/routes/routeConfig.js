// Central nav + access map for the 12 required pages. Sidebar renders from
// this list; ProtectedRoute + RoleGuard enforce it; the backend enforces the
// real permission boundary independently.

export const ALL_ROLES = [
  'ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER', 'WAREHOUSE_USER', 'SUPPLIER',
  'FINANCE_REVIEWER', 'EMPLOYEE', 'MANAGER', 'INSTRUCTOR', 'LEARNING_ADMIN', 'HR_PARTNER', 'BUSINESS_LEADER',
];

const OPS_ROLES = ['ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER', 'WAREHOUSE_USER', 'FINANCE_REVIEWER'];
const PLANNER_ROLES = ['ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER'];

export const navSections = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ALL_ROLES },
    ],
  },
  {
    label: 'Inventory & Supply',
    items: [
      { path: '/items', label: 'Items, Lots & Stock', icon: 'Boxes', roles: OPS_ROLES },
      { path: '/replenishment', label: 'Replenishment & Alerts', icon: 'AlertTriangle', roles: OPS_ROLES },
      { path: '/approvals', label: 'Approvals & Overrides', icon: 'CheckSquare', roles: PLANNER_ROLES },
    ],
  },
  {
    label: 'Forecasting & AI',
    items: [
      { path: '/forecasting', label: 'Demand Forecasting', icon: 'TrendingUp', roles: PLANNER_ROLES },
      { path: '/recommendations', label: 'Reorder & Supplier Picks', icon: 'Route', roles: PLANNER_ROLES },
      { path: '/outcomes', label: 'Outcomes & Accuracy', icon: 'Target', roles: OPS_ROLES },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/reports', label: 'Reports & Analytics', icon: 'BarChart3', roles: ALL_ROLES },
      { path: '/notifications', label: 'Notifications', icon: 'Bell', roles: ALL_ROLES },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/users', label: 'Users & Roles', icon: 'Users', roles: ['ADMIN'] },
      { path: '/audit-logs', label: 'Audit Logs & Settings', icon: 'ShieldCheck', roles: ['ADMIN', 'FINANCE_REVIEWER', 'PROCUREMENT_MANAGER'] },
    ],
  },
];

export function flattenRoutes() {
  return navSections.flatMap((s) => s.items);
}
