import { useState, useEffect } from 'react';
import { StatusBadge, LoadingErrorEmpty } from '../common/OperationalUI';
import axiosClient from '../../api/axiosClient';

export default function InstructorDashboard() {
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

  const handleRequestMaterials = async (category, label) => {
    const quantityStr = window.prompt(`How many ${label} units do you need for your class?`, '30');
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

      setSuccessMsg(`Requested ${quantity}× ${item.name} for your class!`);
      loadHistory();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const upcomingClasses = [
    { id: 1, name: 'Enterprise Cyber Security', date: 'Aug 15, 2026', students: 32, status: 'Upcoming' },
    { id: 2, name: 'Cloud Architecture Fundamentals', date: 'Aug 22, 2026', students: 28, status: 'Upcoming' },
    { id: 3, name: 'Agile Project Management', date: 'Sep 5, 2026', students: 45, status: 'Scheduled' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Instructor Portal</h2>
        <p className="text-sm text-muted">View your upcoming classes and request training materials, devices, and course licences for your students.</p>
      </div>

      {/* Feedback */}
      <div className="min-h-[24px]">
        {errorMsg && <p className="text-sm text-status-critical font-medium">{errorMsg}</p>}
        {successMsg && <p className="text-sm text-status-ok font-medium">✅ {successMsg}</p>}
      </div>

      {/* Upcoming Classes */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium">Upcoming Classes</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas/30">
              <th className="px-6 py-3 font-medium text-muted">Class</th>
              <th className="px-6 py-3 font-medium text-muted">Date</th>
              <th className="px-6 py-3 font-medium text-muted">Students</th>
              <th className="px-6 py-3 font-medium text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {upcomingClasses.map((cls) => (
              <tr key={cls.id} className="border-b border-border last:border-0">
                <td className="px-6 py-4 font-medium text-ink">{cls.name}</td>
                <td className="px-6 py-4 text-muted">{cls.date}</td>
                <td className="px-6 py-4 font-mono">{cls.students}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">{cls.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions — Request Materials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleRequestMaterials('TRAINING_MATERIAL', 'Training Materials')}
          disabled={loading}
          className="bg-surface border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/50 transition-all group disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-ink">Request Training Materials</h4>
              <p className="text-xs text-muted mt-0.5">Printed workbooks, guides, etc.</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRequestMaterials('CONTENT_SUBSCRIPTION', 'Course Licences')}
          disabled={loading}
          className="bg-surface border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/50 transition-all group disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-ink">Request Course Licences</h4>
              <p className="text-xs text-muted mt-0.5">Student platform access.</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRequestMaterials('DEVICE', 'Devices')}
          disabled={loading}
          className="bg-surface border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/50 transition-all group disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-ink">Request Devices</h4>
              <p className="text-xs text-muted mt-0.5">Lab laptops, projectors, etc.</p>
            </div>
          </div>
        </button>
      </div>

      {/* Request History */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-lg font-medium mb-4">My Material Request History</h3>
        
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
