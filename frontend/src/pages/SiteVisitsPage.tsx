import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function SiteVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: '', customerName: '', customerPhone: '', date: '', time: '10:00', numVisitors: 1, purpose: 'SITE_TOUR', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.siteVisits.list().then((d: any) => setVisits(d.visits || [])),
      api.projects.list().then((d: any) => setProjects(d.projects || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.siteVisits.create(form);
      const d = await api.siteVisits.list() as any;
      setVisits(d.visits || []);
      setShowForm(false);
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <AppLayout title="Site Visits">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Site Visits</h1><p className="text-muted">Schedule and track customer site visits</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Schedule Visit</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 16 }}>Schedule New Visit</h3>
          <form onSubmit={submit}>
            <div className="responsive-grid-2">
              <div className="input-group"><label className="input-label">Project *</label>
                <select className="input-control" value={form.projectId} onChange={e => setForm(f => ({...f, projectId: e.target.value}))} required>
                  <option value="">Select project...</option>
                  {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="input-label">Customer Name *</label><input className="input-control" value={form.customerName} onChange={e => setForm(f => ({...f, customerName: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Customer Phone *</label><input className="input-control" value={form.customerPhone} onChange={e => setForm(f => ({...f, customerPhone: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Date *</label><input type="date" className="input-control" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">Time *</label><input type="time" className="input-control" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} required /></div>
              <div className="input-group"><label className="input-label">No. of Visitors</label><input type="number" className="input-control" value={form.numVisitors} onChange={e => setForm(f => ({...f, numVisitors: Number(e.target.value)}))} min={1} /></div>
            </div>
            <div className="input-group"><label className="input-label">Notes</label><textarea className="input-control" style={{ height: 'auto', padding: '12px 16px', resize: 'vertical', minHeight: 80 }} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Scheduling...' : 'Schedule Visit'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Customer</th><th>Project</th><th>Date & Time</th><th>Visitors</th><th>Status</th></tr></thead>
              <tbody>
                {visits.map((v: any) => (
                  <tr key={v.id}>
                    <td><div style={{ fontWeight: 500 }}>{v.customerName}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.customerPhone}</div></td>
                    <td>{v.project?.name || '—'}</td>
                    <td>{new Date(v.date).toLocaleDateString()} {v.time}</td>
                    <td>{v.numVisitors}</td>
                    <td><span className={`status-chip ${v.status === 'COMPLETED' ? 'status-approved' : v.status === 'CANCELLED' ? 'status-rejected' : 'status-pending'}`}>{v.status}</span></td>
                  </tr>
                ))}
                {visits.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No site visits scheduled.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
