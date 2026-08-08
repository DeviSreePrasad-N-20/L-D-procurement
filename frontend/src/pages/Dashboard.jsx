import { useAuth } from '../context/AuthContext';
import OperationsDashboard from './OperationsDashboard';
import HRDashboard from '../components/dashboards/HRDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import InstructorDashboard from '../components/dashboards/InstructorDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import SupplierDashboard from '../components/dashboards/SupplierDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'HR_PARTNER':
      return <HRDashboard />;
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'INSTRUCTOR':
      return <InstructorDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    case 'SUPPLIER':
      return <SupplierDashboard />;
    default:
      // Admins, Planners, Procurement, Finance, Warehouse fall back to the core operational view
      return <OperationsDashboard />;
  }
}
