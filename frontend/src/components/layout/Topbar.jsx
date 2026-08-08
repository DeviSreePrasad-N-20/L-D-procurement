import { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  PROCUREMENT_MANAGER: 'Procurement Manager',
  INVENTORY_PLANNER: 'Inventory Planner',
  WAREHOUSE_USER: 'Warehouse User',
  SUPPLIER: 'Supplier',
  FINANCE_REVIEWER: 'Finance Reviewer',
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  INSTRUCTOR: 'Instructor',
  LEARNING_ADMIN: 'Learning Administrator',
  HR_PARTNER: 'HR Partner',
  BUSINESS_LEADER: 'Business Leader',
};

export default function Topbar({ title, breadcrumbs = [] }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 gap-4">
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-xs text-muted mb-0.5">
            {breadcrumbs.join(' / ')}
          </nav>
        )}
        <h1 className="font-display text-lg text-ink truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-paper px-3 py-1.5 w-64">
          <Search size={15} className="text-muted" />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Global search"
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted"
          />
        </div>

        <button
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
          className="relative rounded-md p-2 hover:bg-paper text-ink"
        >
          <Bell size={18} />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-paper"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-medium">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm text-ink">{user?.name}</p>
              <p className="text-[11px] text-muted">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-surface shadow-lg py-1 z-20"
            >
              <button
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-paper"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
