import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

interface Booking { id: string; customerName: string; customerPhone: string; projectId: string; status: string; bookingDate: string; bookingAmount: string; }

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bookings.list().then((d: any) => setBookings(d.bookings || [])).finally(() => setLoading(false));
  }, []);

  const statusClass: Record<string, string> = {
    PENDING_AM: 'status-pending', PENDING_MD: 'status-pending',
    APPROVED: 'status-approved', REJECTED: 'status-rejected', COMPLETED: 'status-approved',
  };

  return (
    <AppLayout title="Booking Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Bookings</h1>
          <p className="text-muted">{bookings.length} total bookings</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/bookings/new')}><Plus size={16} /> New Booking</button>
      </div>

      {loading && <div className="skeleton" style={{ height: 300 }} />}

      {!loading && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Booking Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.customerName}</td>
                    <td>{b.customerPhone}</td>
                    <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td>₹{Number(b.bookingAmount).toLocaleString()}</td>
                    <td><span className={`status-chip ${statusClass[b.status] || 'status-pending'}`}>{b.status.replace(/_/g,' ')}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ height: 32, fontSize: 12 }} onClick={() => navigate(`/bookings/${b.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
