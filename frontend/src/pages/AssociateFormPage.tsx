import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function AssociateFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: '', name: '', role: 'ASSOCIATE', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await api.associates.create(form);
      navigate('/admin/associates');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add associate');
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Add Associate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Add Associate</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/associates')}>← Back</button>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="input-group"><label className="input-label">Full Name *</label><input className="input-control" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
          <div className="input-group"><label className="input-label">User ID *</label><input className="input-control" value={form.userId} onChange={e => set('userId', e.target.value)} placeholder="e.g. ASC001" required /></div>
          <div className="input-group"><label className="input-label">Role *</label>
            <select className="input-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="ASSOCIATE">Associate</option>
              <option value="AM">Area Manager</option>
            </select>
          </div>
          <div className="input-group"><label className="input-label">Temporary Password *</label><input type="password" className="input-control" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} /></div>
          <p className="text-muted" style={{ marginBottom: 16, fontSize: 13 }}>The associate will be asked to change their password on first login.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Associate'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/associates')}>Cancel</button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
