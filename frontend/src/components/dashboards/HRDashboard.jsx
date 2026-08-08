import { useState } from 'react';
import { Card } from '../common/OperationalUI';
import axiosClient from '../../api/axiosClient';

export default function HRDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateRequest = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch available items to find a Pluralsight Subscription or AWS Voucher
      const { data: itemsResponse } = await axiosClient.get('/items?category=CONTENT_SUBSCRIPTION&pageSize=1');
      const item = itemsResponse.data[0];
      
      if (!item) {
        throw new Error('No subscription items found in inventory to request.');
      }

      // 2. Generate the Purchase Request for the 85 new hires
      await axiosClient.post('/operations/purchase-requests', {
        itemId: item.id,
        quantity: 85
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Workforce Planning & L&D</h2>
        <p className="text-sm text-muted">Monitor headcount trends and trigger proactive course licence procurement for incoming cohorts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total Headcount" value="1,240" />
        <Card label="Q4 Incoming Hires" value="85" />
        <Card label="Certifications Expiring (30d)" value="12" />
        <Card label="Avg Training Spend / Emp" value="$450" />
      </div>

      <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-canvas rounded-full flex items-center justify-center border border-border text-primary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">New Hire Cohort Detected</h3>
        <p className="text-muted max-w-md mx-auto">
          HR systems indicate 85 new software engineers are joining in Q4. Would you like to automatically request 85 Pluralsight Subscriptions and AWS Certification Vouchers?
        </p>
        
        {error && <p className="text-sm text-status-critical">{error}</p>}
        {success && <p className="text-sm text-status-ok font-medium">✅ Purchase Request submitted successfully and sent to Procurement for approval.</p>}
        
        <button 
          onClick={handleGenerateRequest}
          disabled={loading || success}
          className={`px-4 py-2 rounded font-medium transition-colors ${loading || success ? 'bg-canvas text-muted cursor-not-allowed border border-border' : 'bg-primary text-surface hover:bg-primary/90'}`}
        >
          {loading ? 'Submitting Request...' : success ? 'Request Submitted' : 'Generate Purchase Request'}
        </button>
      </div>
    </div>
  );
}
