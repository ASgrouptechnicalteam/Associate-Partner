import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function AssociateManagementPage() {
  const [associates, setAssociates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.associates.list().then((d: any) => setAssociates(d.associates || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await (isActive ? api.associates.deactivate(id) : api.associates.activate(id));
    load();
  };

  return (
    <AppLayout title="Manage Associates">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Manage Associates</h1><p className="text-muted">{associates.length} associates registered</p></div>
        <Link to="/associates/new" className="btn btn-primary"><Plus size={16} /> Add Associate</Link>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Name</th><th>User ID</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {associates.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td>{a.userId}</td>
                    <td>{a.role}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><span className={`status-chip ${a.isActive ? 'status-approved' : 'status-rejected'}`}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ height: 32, fontSize: 12 }} onClick={() => toggleActive(a.id, a.isActive)}>
                        {a.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {associates.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No associates yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
