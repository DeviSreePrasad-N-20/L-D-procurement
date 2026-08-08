import { Card } from '../common/OperationalUI';

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Team Training Hub</h2>
        <p className="text-sm text-muted">Manage your team's training budgets and request specialized material.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Direct Reports" value="14" />
        <Card label="Team Training Budget Remaining" value="$2,450" />
        <Card label="Active Enrolments" value="8" />
      </div>

      <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-medium border-b border-border pb-3">Recent Team Requests</h3>
        <div className="text-center py-8">
          <p className="text-muted">No pending requests from your direct reports.</p>
        </div>
      </div>
    </div>
  );
}
