import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function BookingFormPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', projectId: '', unitId: '', bookingDate: new Date().toISOString().split('T')[0], bookingAmount: '', expectedAmount: '', paymentMode: 'CHEQUE', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.projects.list().then((d: any) => setProjects(d.projects || []));
  }, []);

  useEffect(() => {
    if (!form.projectId) { setUnits([]); return; }
    api.projects.units(form.projectId).then((d: any) => setUnits((d.units || []).filter((u: any) => u.status === 'AVAILABLE')));
  }, [form.projectId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await api.bookings.create(form);
      navigate('/bookings');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      setSubmitting(false);
    }
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <AppLayout title="New Booking">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>New Booking</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/bookings')}>← Back</button>
      </div>

      <div className="card">
        {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <form onSubmit={submit}>
          <h3 style={{ marginBottom: 16 }}>Customer Details</h3>
          <div className="responsive-grid-2">
            <div className="input-group"><label className="input-label">Customer Name *</label><input className="input-control" value={form.customerName} onChange={e => set('customerName', e.target.value)} required /></div>
            <div className="input-group"><label className="input-label">Phone *</label><input className="input-control" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} required /></div>
            <div className="input-group"><label className="input-label">Email</label><input type="email" className="input-control" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} /></div>
          </div>

          <h3 style={{ marginBottom: 16, marginTop: 16 }}>Booking Details</h3>
          <div className="responsive-grid-2">
            <div className="input-group"><label className="input-label">Project *</label>
              <select className="input-control" value={form.projectId} onChange={e => set('projectId', e.target.value)} required>
                <option value="">Select project...</option>
                {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Unit *</label>
              <select className="input-control" value={form.unitId} onChange={e => set('unitId', e.target.value)} required disabled={!form.projectId}>
                <option value="">Select unit...</option>
                {units.map((u: any) => <option key={u.id} value={u.id}>{u.identifier} {u.unitNumber ? `(${u.unitNumber})` : ''} - {u.size} {u.sizeUnit}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Booking Date *</label><input type="date" className="input-control" value={form.bookingDate} onChange={e => set('bookingDate', e.target.value)} required /></div>
            <div className="input-group"><label className="input-label">Payment Mode *</label>
              <select className="input-control" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>
                {['CASH','CHEQUE','NEFT','UPI','DD','CARD'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Booking Amount (₹) *</label><input type="number" className="input-control" value={form.bookingAmount} onChange={e => set('bookingAmount', e.target.value)} required /></div>
            <div className="input-group"><label className="input-label">Expected Total (₹) *</label><input type="number" className="input-control" value={form.expectedAmount} onChange={e => set('expectedAmount', e.target.value)} required /></div>
          </div>

          <div className="input-group"><label className="input-label">Notes</label><textarea className="input-control" style={{ height: 'auto', padding: '12px 16px', resize: 'vertical', minHeight: 80 }} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Booking'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/bookings')}>Cancel</button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
