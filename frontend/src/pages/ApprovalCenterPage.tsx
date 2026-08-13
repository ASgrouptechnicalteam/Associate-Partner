import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function ApprovalCenterPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.approvals.list().then((d: any) => setRequests(d.requests || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    await api.approvals.approve(id);
    load();
  };

  const reject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await api.approvals.reject(id, reason);
    load();
  };

  if (!user || (user.role !== 'MD' && user.role !== 'AM')) {
    return <AppLayout title="Approval Center"><p>Access denied.</p></AppLayout>;
  }

  return (
    <AppLayout title="Approval Center">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Approval Center</h1>
        <p className="text-muted">Review and action pending requests</p>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Type</th><th>Requested By</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.type.replace(/_/g,' ')}</td>
                    <td>{r.requestedBy?.name || '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className={`status-chip ${r.status === 'APPROVED' ? 'status-approved' : r.status === 'REJECTED' ? 'status-rejected' : 'status-pending'}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary" style={{ height: 32, fontSize: 12, color: 'var(--success)' }} onClick={() => approve(r.id)}>Approve</button>
                          <button className="btn btn-danger" style={{ height: 32, fontSize: 12 }} onClick={() => reject(r.id)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No pending requests.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
