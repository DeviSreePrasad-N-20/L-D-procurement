import { useState, useEffect } from 'react';
import { Card, StatusBadge, LoadingErrorEmpty } from '../common/OperationalUI';
import axiosClient from '../../api/axiosClient';

const CATEGORY_OPTIONS = [
  { value: 'CONTENT_SUBSCRIPTION', label: 'Content Subscription' },
  { value: 'CERTIFICATION_VOUCHER', label: 'Certification Voucher' },
  { value: 'TRAINING_MATERIAL', label: 'Training Material' },
  { value: 'DEVICE', label: 'Device' },
  { value: 'COURSE_LICENCE', label: 'Course Licence' },
];

export default function ManagerDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('CONTENT_SUBSCRIPTION');
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axiosClient.get('/operations/purchase-requests/me');
      setHistory(data.data);
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  const loadItems = async (cat) => {
    try {
      const { data } = await axiosClient.get(`/items?category=${cat}&pageSize=50`);
      setItems(data.data);
      if (data.data.length > 0) setSelectedItemId(data.data[0].id);
      else setSelectedItemId('');
    } catch { setItems([]); }
  };

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { if (showForm) loadItems(category); }, [category, showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId) { setErrorMsg('Please select an item.'); return; }
    setSubmitting(true); setErrorMsg('');
    try {
      await axiosClient.post('/operations/purchase-requests', { itemId: selectedItemId, quantity: Number(quantity) });
      const itemName = items.find(i => i.id === selectedItemId)?.name || 'item';
      setSuccessMsg(`Requested ${quantity}× ${itemName} for your team!`);
      setShowForm(false); setQuantity(1); loadHistory();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Request failed.');
    } finally { setSubmitting(false); }
  };

  const pendingCount = history.filter(r => r.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Team Training Hub</h2>
          <p className="text-sm text-muted">Manage your team's training budgets, enrolments, and course licence requests.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-surface px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Total Requests" value={history.length} />
        <Card label="Pending Approval" value={pendingCount} />
        <Card label="Approved" value={history.filter(r => r.status === 'APPROVED').length} />
      </div>

      {successMsg && <div className="bg-status-ok/10 border border-status-ok/30 text-status-ok p-4 rounded-xl text-sm font-medium flex items-center space-x-2"><svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>{successMsg}</span></div>}
      {errorMsg && <div className="bg-status-critical/10 border border-status-critical/30 text-status-critical p-4 rounded-xl text-sm font-medium">{errorMsg}</div>}

      {showForm && (
        <div className="bg-surface border border-primary/30 rounded-xl p-6 shadow-md space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-ink">Create New Team Request</h3>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-ink transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-canvas text-ink focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                  {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Item</label>
                <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-canvas text-ink focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                  {items.length === 0 && <option value="">No items available</option>}
                  {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Quantity</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-canvas text-ink focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded-lg bg-canvas border border-border text-ink hover:bg-border transition-colors">Cancel</button>
              <button type="submit" disabled={submitting || !selectedItemId} className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-surface hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="pt-4">
        <h3 className="text-lg font-medium mb-4">My Team Request History</h3>
        <LoadingErrorEmpty loading={historyLoading} error="" empty={!historyLoading && history.length === 0}>
          <div className="space-y-3">
            {history.map((req) => {
              const approval = req.approvals?.[0];
              const itemName = req.lines?.[0]?.item?.name || 'Unknown Item';
              const qty = req.lines?.[0]?.quantity || 0;
              return (
                <div key={req.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-medium text-ink">{qty} × {itemName}</h4>
                    <p className="text-xs text-muted mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge value={req.status} />
                    {req.status === 'PENDING_REVIEW' ? (
                      <span className="text-xs text-muted">Waiting for approval from Procurement / Admin</span>
                    ) : approval?.actor && (
                      <span className="text-xs text-muted">
                        {req.status === 'APPROVED' ? 'Approved by' : 'Reviewed by'}{' '}
                        <span className="font-medium text-ink">{approval.actor.name}</span> ({approval.actor.role?.name})
                      </span>
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
