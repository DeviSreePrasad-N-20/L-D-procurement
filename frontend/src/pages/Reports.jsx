import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Card, LoadingErrorEmpty, StatusBadge, Table } from '../components/common/OperationalUI';

export default function Reports() {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { axiosClient.get('/operations/dashboard').then(({ data: response }) => setData(response.data)).catch(() => setError('Could not prepare the inventory report.')).finally(() => setLoading(false)); }, []);
  const download = async () => { const response = await axiosClient.get('/operations/reports/inventory.csv', { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = 'inventory-report.csv'; link.click(); URL.revokeObjectURL(url); };
  const summary = data?.summary || {};
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted">Current operational inventory report. Exports are recorded in the audit trail.</p></div><button onClick={download} className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">Export CSV</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Card label="Critical risk" value={summary.critical} /><Card label="Reorder soon" value={summary.warning} /><Card label="Pending approval" value={summary.pendingApprovals} /></div><LoadingErrorEmpty loading={loading} error={error} empty={!loading && !error && !data?.items?.length}><Table headers={['Item', 'Available', 'Forecast', 'Recommended quantity', 'Risk']}>{data?.items?.map((item) => <tr key={item.id} className="border-b border-border"><td className="px-4 py-3"><p className="font-medium">{item.name}</p><p className="font-mono text-xs text-muted">{item.sku}</p></td><td className="px-4 py-3">{item.available}</td><td className="px-4 py-3">{item.forecastDemand || '—'}</td><td className="px-4 py-3">{item.recommendedQty || '—'}</td><td className="px-4 py-3"><StatusBadge value={item.status} /></td></tr>)}</Table></LoadingErrorEmpty></div>;
}
