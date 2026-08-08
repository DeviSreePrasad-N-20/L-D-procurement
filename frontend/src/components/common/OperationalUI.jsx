export function LoadingErrorEmpty({ loading, error, empty, children }) {
  if (loading) return <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">Loading operational data…</div>;
  if (error) return <div role="alert" className="rounded-lg border border-status-critical bg-status-criticalBg p-4 text-sm text-status-critical">{error}</div>;
  if (empty) return <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">No records match the current view.</div>;
  return children;
}

export function StatusBadge({ value }) {
  const styles = { CRITICAL: 'bg-status-criticalBg text-status-critical', REJECTED: 'bg-status-criticalBg text-status-critical', WARNING: 'bg-status-warnBg text-status-warn', PENDING: 'bg-status-warnBg text-status-warn', PENDING_REVIEW: 'bg-status-warnBg text-status-warn', DEFERRED: 'bg-status-warnBg text-status-warn', APPROVED: 'bg-status-okBg text-status-ok', HEALTHY: 'bg-status-okBg text-status-ok', PUBLISHED: 'bg-status-okBg text-status-ok' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[value] || 'bg-paper text-ink/70'}`}>{String(value || '—').replaceAll('_', ' ')}</span>;
}

export function Table({ headers, children }) {
  return <div className="overflow-x-auto rounded-lg border border-border bg-surface"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

export function Card({ label, value, note }) {
  return <div className="status-rail rounded-lg border border-border bg-surface p-4" style={{ '--rail-color': '#2B3A67' }}><p className="text-xs uppercase tracking-wide text-muted">{label}</p><p className="mt-1 font-display text-2xl text-ink">{value ?? '—'}</p>{note && <p className="mt-1 text-xs text-muted">{note}</p>}</div>;
}
