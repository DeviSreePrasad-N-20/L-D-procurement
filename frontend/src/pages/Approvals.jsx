import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { LoadingErrorEmpty, StatusBadge } from '../components/common/OperationalUI';

export default function Approvals() {
  const [rows, setRows] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');

  const load = () => { 
    setLoading(true); 
    axiosClient.get('/operations/approvals')
      .then(({ data }) => { setRows(data.data); setError(''); })
      .catch(() => setError('Could not load approvals. Your role may not have review access.'))
      .finally(() => setLoading(false)); 
  };
  
  useEffect(load, []);
  
  const decide = async (id, outcome) => { 
    const reason = window.prompt(`Reason for ${outcome.toLowerCase()}:`); 
    if (!reason) return; 
    try { 
      await axiosClient.patch(`/operations/approvals/${id}`, { outcome, reason }); 
      load(); 
    } catch { 
      setError('Decision could not be saved. A reason is required.'); 
    } 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Workflow Approvals</h1>
      </div>
      <p className="text-sm text-muted">Every material recommendation requires an authorised, auditable human decision.</p>
      
      <LoadingErrorEmpty loading={loading} error={error} empty={!loading && !error && !rows.length}>
        <div className="space-y-4">
          {rows.map((row) => {
            const requestedBy = row.purchaseRequest?.requestedBy;
            const lines = row.purchaseRequest?.lines || [];
            const itemName = lines.map((line) => line.item.name).join(', ') || 'Operational decision';
            const itemQty = lines.map((line) => `${line.quantity} × ${line.item.sku}`).join(', ') || '—';
            
            return (
              <div key={row.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col space-y-4">
                
                {/* Visual Workflow Chain */}
                <div className="flex items-center space-x-3 text-sm border-b border-border pb-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary">{requestedBy?.name || 'System Generated'}</span>
                    <span className="text-xs text-muted">{requestedBy?.role?.name || 'Automated Model'}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center text-muted">
                    <div className="h-px bg-border w-12 mx-2"></div>
                    <svg className="w-4 h-4 text-primary mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <div className="h-px bg-border w-12 mx-2"></div>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="font-semibold text-ink">Action Required By</span>
                    <span className="text-xs text-muted">Procurement / Finance</span>
                  </div>
                </div>

                {/* Request Details */}
                <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium">{itemName}</h3>
                    <p className="text-sm text-muted mt-1">Requested: {itemQty}</p>
                    <div className="mt-2 text-xs bg-canvas px-2 py-1 rounded inline-block text-muted">
                      AI Model: {row.aiRun?.modelVersion?.version || 'Rule-based Priority'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge value={row.outcome} />
                    <span className="text-xs text-muted">{new Date(row.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Approver Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-sm italic text-ink/70">
                    {row.reason ? `Notes: ${row.reason}` : 'Awaiting reviewer notes...'}
                  </div>
                  
                  {row.outcome === 'PENDING' && (
                    <div className="flex space-x-3">
                      <button onClick={() => decide(row.id, 'DEFERRED')} className="px-3 py-1.5 text-sm font-medium rounded-md bg-canvas border border-border text-ink hover:bg-border transition-colors">
                        Defer
                      </button>
                      <button onClick={() => decide(row.id, 'REJECTED')} className="px-3 py-1.5 text-sm font-medium rounded-md bg-status-critical/10 text-status-critical hover:bg-status-critical/20 transition-colors">
                        Reject
                      </button>
                      <button onClick={() => decide(row.id, 'APPROVED')} className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-surface hover:bg-primary/90 transition-colors">
                        Approve Request
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </LoadingErrorEmpty>
    </div>
  );
}
