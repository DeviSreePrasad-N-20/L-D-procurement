import { Card } from '../common/OperationalUI';

export default function SupplierDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-3 shadow-sm mb-8">
        <span className="inline-block px-3 py-1 bg-status-ok/10 text-status-ok text-xs font-bold rounded-full mb-2">PARTNER PORTAL</span>
        <h2 className="text-2xl font-semibold text-ink">Supplier Order Management</h2>
        <p className="text-sm text-muted max-w-lg mx-auto">Welcome back. View incoming purchase orders, update shipping statuses, and review your performance scorecard.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="New Purchase Orders" value="2" />
        <Card label="Pending Fulfillment" value="5" />
        <Card label="Your Quality Score" value="98%" />
      </div>

      <div className="bg-surface border border-border rounded-xl mt-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-canvas/50">
          <h3 className="text-lg font-medium">Incoming Purchase Orders</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas/30">
              <th className="px-6 py-3 font-medium text-muted">Order ID</th>
              <th className="px-6 py-3 font-medium text-muted">Items Requested</th>
              <th className="px-6 py-3 font-medium text-muted">Date</th>
              <th className="px-6 py-3 font-medium text-muted">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-6 py-4 font-mono text-ink">PO-10492</td>
              <td className="px-6 py-4">40 × PMP Certification Voucher</td>
              <td className="px-6 py-4 text-muted">Today, 09:30 AM</td>
              <td className="px-6 py-4">
                <button className="text-primary hover:underline font-medium text-xs">Acknowledge</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-mono text-ink">PO-10493</td>
              <td className="px-6 py-4">120 × Pluralsight Subscriptions</td>
              <td className="px-6 py-4 text-muted">Today, 11:15 AM</td>
              <td className="px-6 py-4">
                <button className="text-primary hover:underline font-medium text-xs">Acknowledge</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
