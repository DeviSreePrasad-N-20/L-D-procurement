import { Card } from '../common/OperationalUI';

export default function InstructorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Instructor Portal</h2>
        <p className="text-sm text-muted">View upcoming scheduled classes and request physical classroom materials.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Upcoming Classes (This Month)" value="3" />
        <Card label="Students Enrolled" value="45" />
        <Card label="Pending Material Requests" value="1" />
      </div>

      <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-medium border-b border-border pb-3">Upcoming Schedules</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div>
            <p className="font-medium">Enterprise Cyber Security (In-Person)</p>
            <p className="text-xs text-muted">Next Tuesday, 09:00 AM - 15 Registered</p>
          </div>
          <button className="text-sm text-primary hover:underline font-medium">Request Materials</button>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div>
            <p className="font-medium">Advanced React Architecture</p>
            <p className="text-xs text-muted">Oct 14th, 10:00 AM - 30 Registered</p>
          </div>
          <button className="text-sm text-primary hover:underline font-medium">Request Materials</button>
        </div>
      </div>
    </div>
  );
}
