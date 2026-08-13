import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.commissions.list().then((d: any) => setCommissions(d.commissions || [])),
      api.commissions.summary().then((d: any) => setSummary(d.summary)),
    ]).finally(() => setLoading(false));
  }, []);

  const statusClass: Record<string, string> = { PENDING: 'status-pending', PAID: 'status-approved', REJECTED: 'status-rejected' };

  return (
    <AppLayout title="Commission Management">
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <>
          {summary && (
            <div className="responsive-grid-3" style={{ marginBottom: 'var(--space-6)' }}>
              {[
                { label: 'Total Earned', value: `₹${Number(summary.totalEarned || 0).toLocaleString()}`, color: 'var(--success)' },
                { label: 'Pending', value: `₹${Number(summary.totalPending || 0).toLocaleString()}`, color: 'var(--warning)' },
                { label: 'This Month', value: `₹${Number(summary.thisMonth || 0).toLocaleString()}`, color: 'var(--info)' },
              ].map(c => (
                <div key={c.label} className="card" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <p className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>{c.label}</p>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</h2>
                </div>
              ))}
            </div>
          )}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Commission Ledger</h3>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Remarks</th></tr></thead>
                <tbody>
                  {commissions.map((c: any) => (
                    <tr key={c.id}>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>{c.type}</td>
                      <td style={{ fontWeight: 600 }}>₹{Number(c.amount).toLocaleString()}</td>
                      <td><span className={`status-chip ${statusClass[c.paymentStatus] || ''}`}>{c.paymentStatus}</span></td>
                      <td className="text-muted">{c.referenceRemarks || '—'}</td>
                    </tr>
                  ))}
                  {commissions.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No commission records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
