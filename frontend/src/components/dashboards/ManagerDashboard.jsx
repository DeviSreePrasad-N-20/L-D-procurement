import { useState, useEffect } from 'react';
import { Card, StatusBadge, LoadingErrorEmpty } from '../common/OperationalUI';
import axiosClient from '../../api/axiosClient';

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axiosClient.get('/operations/purchase-requests/me');
      setHistory(data.data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleBulkRequest = async (category, label) => {
    const quantityStr = window.prompt(`How many ${label} do you want to request for your team?`, '10');
    if (!quantityStr) return;
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 1) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const { data: itemsResponse } = await axiosClient.get(`/items?category=${category}&pageSize=1`);
      const item = itemsResponse.data[0];
      if (!item) throw new Error(`No ${label} items found in inventory.`);

      await axiosClient.post('/operations/purchase-requests', {
        itemId: item.id,
        quantity,
      });

      setSuccessMsg(`Requested ${quantity}× ${item.name} for your team!`);
      loadHistory();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Team Training Hub</h2>
        <p className="text-sm text-muted">Manage your direct reports' training budgets, enrolments, and course licence requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="My Pending Requests" value={history.filter(r => r.status === 'PENDING_REVIEW').length} />
        <Card label="Approved Requests" value={history.filter(r => r.status === 'APPROVED').length} />
        <Card label="Total Requests Made" value={history.length} />
      </div>

      {/* Feedback Messages */}
      <div className="min-h-[24px]">
        {errorMsg && <p className="text-sm text-status-critical font-medium">{errorMsg}</p>}
        {successMsg && <p className="text-sm text-status-ok font-medium">✅ {successMsg}</p>}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleBulkRequest('CONTENT_SUBSCRIPTION', 'Course Subscriptions')}
          disabled={loading}
          className="bg-surface border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/50 transition-all group disabled:opacity-50"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-ink">Request Course Subscriptions</h3>
              <p className="text-sm text-muted mt-1">Bulk-request Pluralsight or Udemy licences for your team members.</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleBulkRequest('CERTIFICATION_VOUCHER', 'Certification Vouchers')}
          disabled={loading}
          className="bg-surface border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/50 transition-all group disabled:opacity-50"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-ink">Request Certification Vouchers</h3>
              <p className="text-sm text-muted mt-1">Request AWS, PMP, or Kubernetes exam vouchers for your team.</p>
            </div>
          </div>
        </button>
      </div>

      {/* My Request History */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-lg font-medium mb-4">My Team Request History</h3>
        
        <LoadingErrorEmpty loading={historyLoading} error="" empty={!historyLoading && history.length === 0}>
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
