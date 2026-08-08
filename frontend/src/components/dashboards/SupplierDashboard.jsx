import { useState, useEffect } from 'react';
import { Card, StatusBadge, LoadingErrorEmpty } from '../common/OperationalUI';
import axiosClient from '../../api/axiosClient';

export default function SupplierDashboard() {
  const [scorecards, setScorecards] = useState([]);
  const [history, setHistory] = useState([]);
  const [scLoading, setScLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    // Fetch supplier scorecards
    axiosClient.get('/operations/suppliers/scorecards')
      .then(({ data }) => setScorecards(data.data))
      .catch(() => {})
      .finally(() => setScLoading(false));

    // Fetch purchase requests made by / for this user
    axiosClient.get('/operations/purchase-requests/me')
      .then(({ data }) => setHistory(data.data))
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, []);

  const totalOpenOrders = scorecards.reduce((sum, s) => sum + (s.openOrders || 0), 0);
  const avgRisk = scorecards.length ? (scorecards.reduce((sum, s) => sum + Number(s.riskScore || 0), 0) / scorecards.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-3 shadow-sm mb-8">
        <span className="inline-block px-3 py-1 bg-status-ok/10 text-status-ok text-xs font-bold rounded-full mb-2">PARTNER PORTAL</span>
        <h2 className="text-2xl font-semibold text-ink">Supplier Order Management</h2>
        <p className="text-sm text-muted max-w-lg mx-auto">Welcome back. View incoming purchase orders, your scorecard, and delivery performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Open Purchase Orders" value={totalOpenOrders} />
        <Card label="Your Avg Risk Score" value={avgRisk} />
        <Card label="Suppliers in Network" value={scorecards.length} />
      </div>

      {/* Supplier Scorecards Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-canvas/50">
          <h3 className="text-lg font-medium">Supplier Network Scorecards</h3>
        </div>
        <LoadingErrorEmpty loading={scLoading} error="" empty={!scLoading && scorecards.length === 0}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/30">
                <th className="px-6 py-3 font-medium text-muted">Supplier</th>
                <th className="px-6 py-3 font-medium text-muted">Contact</th>
                <th className="px-6 py-3 font-medium text-muted">Lead Time</th>
                <th className="px-6 py-3 font-medium text-muted">Risk</th>
                <th className="px-6 py-3 font-medium text-muted">Open Orders</th>
                <th className="px-6 py-3 font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {scorecards.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 font-medium text-ink">{s.name}</td>
                  <td className="px-6 py-4 text-muted">{s.contactEmail || '—'}</td>
                  <td className="px-6 py-4 font-mono">{s.leadTimeDays ?? '—'}d</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono font-medium ${Number(s.riskScore) > 5 ? 'text-status-critical' : Number(s.riskScore) > 3 ? 'text-status-warn' : 'text-status-ok'}`}>
                      {Number(s.riskScore).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{s.openOrders}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${s.active ? 'bg-status-ok/10 text-status-ok' : 'bg-canvas text-muted'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </LoadingErrorEmpty>
      </div>

      {/* Order History */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-lg font-medium mb-4">My Order History</h3>
        <LoadingErrorEmpty loading={histLoading} error="" empty={!histLoading && history.length === 0}>
          <div className="space-y-3">
            {history.map((req) => {
              const approval = req.approvals?.[0];
              const itemName = req.lines?.[0]?.item?.name || 'Unknown Item';
              const quantity = req.lines?.[0]?.quantity || 0;
              
              return (
                <div key={req.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-medium text-ink">{quantity} × {itemName}</h4>
                    <p className="text-xs text-muted mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge value={req.status} />
                    
                    {req.status === 'PENDING_REVIEW' ? (
                      <span className="text-xs text-muted">Waiting for approval from Procurement / Admin</span>
                    ) : (
                      approval?.actor && (
                        <span className="text-xs text-muted">
                          {req.status === 'APPROVED' ? 'Approved by' : 'Reviewed by'}{' '}
                          <span className="font-medium text-ink">{approval.actor.name}</span>{' '}
                          ({approval.actor.role?.name})
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </LoadingErrorEmpty>
      </div>
    </div>
  );
}
