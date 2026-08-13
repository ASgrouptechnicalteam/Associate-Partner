import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.reviews.list().then((d: any) => setReviews(d.reviews || [])),
      api.reviews.stats().then((d: any) => setStats(d.stats)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Customer Reviews">
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <>
          {stats && (
            <div className="responsive-grid-3" style={{ marginBottom: 'var(--space-6)' }}>
              {[
                { label: 'Total Reviews', value: stats.totalReviews, color: 'var(--info)' },
                { label: 'Average Rating', value: `${stats.averageRating} ★`, color: 'var(--warning)' },
                { label: '5-Star %', value: `${stats.fiveStarPercentage}%`, color: 'var(--success)' },
              ].map(c => (
                <div key={c.label} className="card" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <p className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>{c.label}</p>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</h2>
                </div>
              ))}
            </div>
          )}
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Customer</th><th>Project</th><th>Rating</th><th>Review</th><th>Date</th></tr></thead>
                <tbody>
                  {reviews.map((r: any) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.customerName}</td>
                      <td>{r.project?.name || '—'}</td>
                      <td>{r.overallRating ? '★'.repeat(r.overallRating) : '—'}</td>
                      <td style={{ maxWidth: 300 }}>{r.writtenReview || '—'}</td>
                      <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {reviews.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No reviews yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
