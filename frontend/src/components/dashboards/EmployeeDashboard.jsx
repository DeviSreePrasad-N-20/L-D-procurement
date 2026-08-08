export default function EmployeeDashboard() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center py-10">
        <h2 className="text-3xl font-display text-ink mb-3">Self-Service Training Portal</h2>
        <p className="text-muted text-lg">Request courses, certifications, and resources to advance your career.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-ink">Course Licences & Subscriptions</h3>
              <p className="text-sm text-muted mt-1">Request access to platforms like Pluralsight, Udemy, or internal courses.</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-surface transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-ink">Certification Vouchers</h3>
              <p className="text-sm text-muted mt-1">Request exam vouchers for AWS, PMP, Kubernetes, and more.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-lg font-medium mb-4">My Request History</h3>
        <p className="text-muted text-sm text-center py-8">You have no active requests.</p>
      </div>
    </div>
  );
}
