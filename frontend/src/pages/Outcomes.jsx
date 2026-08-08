import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Card, LoadingErrorEmpty, StatusBadge, Table } from '../components/common/OperationalUI';

export default function Outcomes() {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { axiosClient.get('/operations/outcomes').then(({ data: response }) => setData(response.data)).catch(() => setError('Could not load forecast outcomes.')).finally(() => setLoading(false)); }, []);
  const metrics = data?.metrics || {};
  return <div className="space-y-5"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card label="Mean accuracy" value={metrics.meanAccuracy === null ? '—' : `${metrics.meanAccuracy}%`} /><Card label="Evaluated runs" value={metrics.evaluatedRuns} /><Card label="Drift" value={metrics.drift} /><Card label="Adoption" value={metrics.adoption} /></div><LoadingErrorEmpty loading={loading} error={error} empty={!loading && !error && !data?.forecasts?.length}><Table headers={['Item', 'Prediction', 'Latest actual', 'Accuracy', 'Confidence', 'Status']}>{data?.forecasts?.map((row) => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><p className="font-medium">{row.item}</p><p className="font-mono text-xs text-muted">{row.sku}</p></td><td className="px-4 py-3 font-mono">{row.prediction}</td><td className="px-4 py-3 font-mono">{row.actual}</td><td className="px-4 py-3">{row.accuracy === null ? 'Pending' : `${row.accuracy}%`}</td><td className="px-4 py-3">{Math.round((row.confidence || 0) * 100)}%</td><td className="px-4 py-3"><StatusBadge value={row.status} /></td></tr>)}</Table></LoadingErrorEmpty></div>;
}
