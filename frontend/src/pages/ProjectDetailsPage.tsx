import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.projects.get(id).then((d: any) => setProject(d.project)),
      api.projects.units(id).then((d: any) => setUnits(d.units || [])),
    ]).finally(() => setLoading(false));
  }, [id]);

  const canEdit = user?.role === 'MD' || user?.role === 'AM';

  if (loading) return <AppLayout title="Project Details"><div className="skeleton" style={{ height: 300 }} /></AppLayout>;
  if (!project) return <AppLayout title="Not Found"><p>Project not found.</p></AppLayout>;

  return (
    <AppLayout title={project.name}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/projects')}><ArrowLeft size={16} /> Back</button>
        {canEdit && <Link to={`/projects/${id}/edit`} className="btn btn-primary"><Edit size={16} /> Edit Project</Link>}
      </div>

      <div className="responsive-grid-2">
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>{project.name}</h2>
          <p className="text-muted" style={{ marginBottom: 12 }}>{project.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {project.location && <span className="status-chip" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>{project.location}</span>}
            {project.projectType && <span className="status-chip" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>{project.projectType}</span>}
            <span className={`status-chip ${project.status === 'ACTIVE' ? 'status-approved' : 'status-pending'}`}>{project.status}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Details</h3>
          {[
            ['Developer', project.developerName],
            ['Project Code', project.projectCode],
            ['Launch Date', project.launchDate ? new Date(project.launchDate).toLocaleDateString() : null],
            ['Completion Date', project.completionDate ? new Date(project.completionDate).toLocaleDateString() : null],
          ].filter(([,v]) => v).map(([label, value]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span className="text-muted">{label}</span>
              <span style={{ fontWeight: 500 }}>{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {units.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Inventory ({units.length} units)</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Unit</th><th>Block</th><th>Size</th><th>Price</th><th>Status</th></tr></thead>
              <tbody>
                {units.map(u => (
                  <tr key={u.id}>
                    <td>{u.unitNumber || u.identifier}</td>
                    <td>{u.block || '—'}</td>
                    <td>{u.size ? `${u.size} ${u.sizeUnit || ''}` : '—'}</td>
                    <td>{u.price ? `₹${Number(u.price).toLocaleString()}` : '—'}</td>
                    <td><span className={`status-chip ${u.status === 'AVAILABLE' ? 'status-approved' : u.status === 'BOOKED' ? 'status-rejected' : 'status-pending'}`}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
