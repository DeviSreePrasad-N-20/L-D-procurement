import { Construction } from 'lucide-react';

/**
 * Phase 1 placeholder shell - already wired into routing, nav, and RBAC.
 * Each of these becomes a full page in Phase 2 following the pattern
 * established in Login.jsx and Dashboard.jsx (real API calls, loading/
 * error/empty states, role-restricted actions).
 */
export default function PagePlaceholder({ title, description, plannedFeatures = [] }) {
  return (
    <div className="max-w-2xl">
      <div className="status-rail bg-surface border border-border rounded-lg p-6" style={{ '--rail-color': '#2B3A67' }}>
        <div className="flex items-center gap-2 text-muted mb-3">
          <Construction size={16} />
          <span className="text-xs uppercase tracking-wide">Planned for Phase 2</span>
        </div>
        <h2 className="font-display text-xl text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink/70 mb-4">{description}</p>
        {plannedFeatures.length > 0 && (
          <ul className="space-y-1.5 text-sm text-ink/70 list-disc list-inside">
            {plannedFeatures.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
