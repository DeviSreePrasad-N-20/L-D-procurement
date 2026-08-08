import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { navSections } from '../../routes/routeConfig';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-display text-sm">
          L&D
        </div>
        <div>
          <p className="font-display text-sm leading-tight text-ink">Optimiser</p>
          <p className="text-[11px] text-muted leading-tight">Demand · Inventory · Procurement</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Primary">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(user?.role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = Icons[item.icon] || Icons.Circle;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-ink/80 hover:bg-paper hover:text-ink'
                          }`
                        }
                      >
                        <Icon size={16} strokeWidth={2} />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
