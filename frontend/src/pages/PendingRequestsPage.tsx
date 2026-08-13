import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.approvals.list().then((d: any) => setRequests((d.requests || []).filter((r: any) => r.status === 'PENDING'))).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Pending Requests">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pending Requests</h1>
        <p className="text-muted">Track your submitted approval requests</p>
      </div>
      {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Type</th><th>Submitted</th><th>Status</th></tr></thead>
              <tbody>
                {requests.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.type.replace(/_/g,' ')}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className="status-chip status-pending">{r.status}</span></td>
                  </tr>
                ))}
                {requests.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No pending requests.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
