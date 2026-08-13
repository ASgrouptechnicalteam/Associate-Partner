import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function TravelPage() {
  const [travels, setTravels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ travelDate: '', fromLocation: '', toLocation: '', purpose: '', distance: '', travelMode: 'OWN_VEHICLE', amountRequested: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.travel.list().then((d: any) => setTravels(d.travels || [])).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.travel.create(form);
      const d = await api.travel.list() as any;
      setTravels(d.travels || []);
      setShowForm(false);
      setForm({ travelDate: '', fromLocation: '', toLocation: '', purpose: '', distance: '', travelMode: 'OWN_VEHICLE', amountRequested: '' });
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <AppLayout title="Travel Allowance">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Travel Allowance</h1><p className="text-muted">Submit and track travel reimbursements</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Request</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 16 }}>New Travel Request</h3>
          <form onSubmit={submit}>
            <div className="responsive-grid-2">
              <div className="input-group"><label className="input-label">Travel Date *</label><input type="date" className="input-control" value={form.travelDate} onChange={e => setForm(f => ({...f, travelDate: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Travel Mode *</label>
                <select className="input-control" value={form.travelMode} onChange={e => setForm(f => ({...f, travelMode: e.target.value}))}>
                  {['OWN_VEHICLE','AUTO','TAXI','BUS','TRAIN','FLIGHT'].map(m => <option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="input-label">From *</label><input className="input-control" value={form.fromLocation} onChange={e => setForm(f => ({...f, fromLocation: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">To *</label><input className="input-control" value={form.toLocation} onChange={e => setForm(f => ({...f, toLocation: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Distance (km) *</label><input type="number" className="input-control" value={form.distance} onChange={e => setForm(f => ({...f, distance: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Amount Requested (₹) *</label><input type="number" className="input-control" value={form.amountRequested} onChange={e => setForm(f => ({...f, amountRequested: e.target.value}))} required /></div>
            </div>
            <div className="input-group"><label className="input-label">Purpose *</label><input className="input-control" value={form.purpose} onChange={e => setForm(f => ({...f, purpose: e.target.value}))} required /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Date</th><th>From → To</th><th>Mode</th><th>Distance</th><th>Requested</th><th>Approved</th><th>Status</th></tr></thead>
              <tbody>
                {travels.map((t: any) => (
                  <tr key={t.id}>
                    <td>{new Date(t.travelDate).toLocaleDateString()}</td>
                    <td>{t.fromLocation} → {t.toLocation}</td>
                    <td>{t.travelMode.replace(/_/g,' ')}</td>
                    <td>{t.distance} km</td>
                    <td>₹{Number(t.amountRequested).toLocaleString()}</td>
                    <td>{t.amountApproved ? `₹${Number(t.amountApproved).toLocaleString()}` : '—'}</td>
                    <td><span className={`status-chip ${t.status === 'APPROVED' ? 'status-approved' : t.status === 'REJECTED' ? 'status-rejected' : 'status-pending'}`}>{t.status}</span></td>
                  </tr>
                ))}
                {travels.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No travel records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
