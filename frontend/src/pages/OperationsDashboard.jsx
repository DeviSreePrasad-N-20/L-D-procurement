import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Card, LoadingErrorEmpty, StatusBadge, Table } from '../components/common/OperationalUI';

const CATEGORY_LABELS = { COURSE_LICENCE: 'Course licences', CONTENT_SUBSCRIPTION: 'Content subscriptions', CERTIFICATION_VOUCHER: 'Certification vouchers', TRAINING_MATERIAL: 'Training materials', DEVICE: 'Devices' };

export default function OperationsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { axiosClient.get('/operations/dashboard').then(({ data: response }) => setData(response.data)).catch(() => setError('Could not load dashboard data.')).finally(() => setLoading(false)); }, []);
  const summary = data?.summary || {};
  return <div className="space-y-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"><Card label="Tracked items" value={summary.trackedItems} /><Card label="Critical stockout risk" value={summary.critical} /><Card label="Reorder soon" value={summary.warning} /><Card label="Pending approvals" value={summary.pendingApprovals} /><Card label="Unread notifications" value={summary.unreadNotifications} /></div><section><div className="mb-3"><h2 className="font-display text-lg text-ink">Demand, supply & inventory</h2><p className="text-sm text-muted">Live availability, planning thresholds, forecast demand, and exceptions.</p></div><LoadingErrorEmpty loading={loading} error={error} empty={!loading && !error && !data?.items?.length}><Table headers={['Item', 'Category', 'Available', 'Safety stock', 'Forecast', 'Status']}>{data?.items?.map((item) => <tr key={item.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><p className="font-medium text-ink">{item.name}</p><p className="font-mono text-xs text-muted">{item.sku}</p></td><td className="px-4 py-3">{CATEGORY_LABELS[item.category]}</td><td className="px-4 py-3 font-mono">{item.available}</td><td className="px-4 py-3 font-mono">{item.safetyStock}</td><td className="px-4 py-3 font-mono">{item.forecastDemand || '—'}</td><td className="px-4 py-3"><StatusBadge value={item.status} /></td></tr>)}</Table></LoadingErrorEmpty></section></div>;
}
