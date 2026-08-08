import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const SEVERITY_STYLE = {
  INFO: { icon: Info, rail: '#2B3A67' },
  WARNING: { icon: AlertTriangle, rail: '#B7791F' },
  CRITICAL: { icon: AlertTriangle, rail: '#B23B3B' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/notifications');
      setNotifications(data.data);
    } catch {
      setError('Could not load notifications. Try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
    } catch {
      load(); // resync on failure
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-surface border border-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-base text-ink flex items-center gap-2">
            <Bell size={16} /> Notifications
          </h2>
          <span className="text-xs text-muted">{notifications.filter((n) => !n.read).length} unread</span>
        </div>

        {loading && <div className="p-6 text-sm text-muted">Loading notifications…</div>}
        {error && <div className="p-6 text-sm text-status-critical">{error}</div>}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-ink/70">You're all caught up.</p>
            <p className="text-xs text-muted mt-1">Assignments, exceptions, approvals, and alerts will appear here.</p>
          </div>
        )}

        <ul>
          {notifications.map((n) => {
            const style = SEVERITY_STYLE[n.severity] || SEVERITY_STYLE.INFO;
            const Icon = style.icon;
            return (
              <li
                key={n.id}
                className={`status-rail flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-0 ${
                  n.read ? 'opacity-60' : ''
                }`}
                style={{ '--rail-color': style.rail }}
              >
                <Icon size={16} className="mt-0.5 text-ink/60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium">{n.title}</p>
                  {n.body && <p className="text-sm text-ink/70">{n.body}</p>}
                  <p className="text-xs text-muted mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                  >
                    <CheckCircle2 size={13} /> Mark read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
