import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ItemDetail from './pages/ItemDetail';
import Replenishment from './pages/Replenishment';
import Approvals from './pages/Approvals';
import Forecasting from './pages/Forecasting';
import Recommendations from './pages/Recommendations';
import Outcomes from './pages/Outcomes';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';

const PLANNER_ROLES = ['ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER'];
const OPS_ROLES = ['ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER', 'WAREHOUSE_USER', 'FINANCE_REVIEWER'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout title="Dashboard" />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<DashboardLayout title="Items, Lots & Stock" breadcrumbs={['Inventory & Supply']} />}>
          <Route path="/items" element={<RoleGuard allowedRoles={OPS_ROLES}><ItemDetail /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Replenishment & Alerts" breadcrumbs={['Inventory & Supply']} />}>
          <Route path="/replenishment" element={<RoleGuard allowedRoles={OPS_ROLES}><Replenishment /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Approvals & Overrides" breadcrumbs={['Inventory & Supply']} />}>
          <Route path="/approvals" element={<RoleGuard allowedRoles={PLANNER_ROLES}><Approvals /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Demand Forecasting" breadcrumbs={['Forecasting & AI']} />}>
          <Route path="/forecasting" element={<RoleGuard allowedRoles={PLANNER_ROLES}><Forecasting /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Reorder & Supplier Recommendations" breadcrumbs={['Forecasting & AI']} />}>
          <Route path="/recommendations" element={<RoleGuard allowedRoles={PLANNER_ROLES}><Recommendations /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Outcomes & Accuracy" breadcrumbs={['Forecasting & AI']} />}>
          <Route path="/outcomes" element={<RoleGuard allowedRoles={OPS_ROLES}><Outcomes /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Reports & Analytics" breadcrumbs={['Insights']} />}>
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route element={<DashboardLayout title="Notifications" breadcrumbs={['Insights']} />}>
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route element={<DashboardLayout title="Users & Roles" breadcrumbs={['Administration']} />}>
          <Route path="/users" element={<RoleGuard allowedRoles={['ADMIN']}><UserManagement /></RoleGuard>} />
        </Route>

        <Route element={<DashboardLayout title="Audit Logs & Settings" breadcrumbs={['Administration']} />}>
          <Route
            path="/audit-logs"
            element={<RoleGuard allowedRoles={['ADMIN', 'FINANCE_REVIEWER', 'PROCUREMENT_MANAGER']}><AuditLogs /></RoleGuard>}
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
