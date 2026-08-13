import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

interface Project { id: string; name: string; location?: string; status: string; projectType?: string; projectCode?: string; createdAt: string; }

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.list().then((d: any) => setProjects(d.projects || [])).finally(() => setLoading(false));
  }, []);

  const canManage = user?.role === 'MD' || user?.role === 'AM';
  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.location || '').toLowerCase().includes(search.toLowerCase()));

  const statusColor: Record<string, string> = {
    ACTIVE: 'var(--success)', DRAFT: 'var(--text-muted)', COMPLETED: 'var(--info)', ARCHIVED: 'var(--warning)'
  };

  return (
    <AppLayout title="Projects">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Projects</h1>
          <p className="text-muted">{projects.length} total projects</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 16px', height: 44 }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text-primary)' }} />
          </div>
          {canManage && <Link to="/projects/new" className="btn btn-primary"><Plus size={16} /> New Project</Link>}
        </div>
      </div>

      {loading && (
        <div className="responsive-grid-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card skeleton" style={{ height: 160 }} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3>No projects found</h3>
          <p className="text-muted">No projects match your search.</p>
        </div>
      )}

      <div className="responsive-grid-3">
        {filtered.map(p => (
          <Link key={p.id} to={`/projects/${p.id}`} className="card" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className="status-chip" style={{ background: statusColor[p.status] ? `${statusColor[p.status]}20` : 'var(--surface-muted)', color: statusColor[p.status] || 'var(--text-muted)', border: 'none', fontSize: 11 }}>{p.status}</span>
              {p.projectCode && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.projectCode}</span>}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
            {p.location && <p className="text-muted" style={{ marginBottom: 8 }}>{p.location}</p>}
            {p.projectType && <span style={{ fontSize: 12, background: 'var(--surface-muted)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', color: 'var(--text-muted)' }}>{p.projectType}</span>}
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
