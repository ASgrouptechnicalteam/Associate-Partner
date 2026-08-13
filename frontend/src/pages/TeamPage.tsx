import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.team.myTeam().then((d: any) => setTeam(d.team || [])).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="My Team">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Team</h1>
        <p className="text-muted">Your downline associates</p>
      </div>

      {loading && <div className="skeleton" style={{ height: 300 }} />}

      {!loading && team.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-muted">No team members yet.</p>
        </div>
      )}

      <div className="responsive-grid-3">
        {team.map((member: any) => (
          <div key={member.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {member.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>{member.name}</p>
              <p className="text-muted" style={{ fontSize: 12 }}>{member.userId} · {member.role}</p>
              <span className={`status-chip ${member.isActive ? 'status-approved' : 'status-rejected'}`} style={{ marginTop: 4, fontSize: 10 }}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
