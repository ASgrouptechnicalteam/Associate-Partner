import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.profile.get().then((d: any) => setProfile(d.profile)).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="My Profile">
      {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
        <div className="responsive-grid-2">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
                {profile?.user?.name?.substring(0,2)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 style={{ marginBottom: 4 }}>{profile?.user?.name || '—'}</h2>
                <p className="text-muted">{profile?.user?.role} · {profile?.user?.userId}</p>
              </div>
            </div>
            <a href="/profile/edit" className="btn btn-secondary" style={{ display: 'inline-flex' }}>Edit Profile</a>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Contact Info</h3>
            {[
              ['Primary Phone', profile?.primaryPhone],
              ['WhatsApp', profile?.whatsappNumber],
              ['Email', profile?.email],
              ['Blood Group', profile?.bloodGroup],
            ].map(([label, value]) => value ? (
              <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-muted">{label}</span>
                <span style={{ fontWeight: 500 }}>{String(value)}</span>
              </div>
            ) : null)}
          </div>

          {profile?.bank && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Bank Details</h3>
              {[
                ['Account Holder', profile?.accountHolder],
                ['Bank', profile?.bank],
                ['Account No', profile?.accountNo],
                ['IFSC', profile?.ifsc],
              ].map(([label, value]) => value ? (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span className="text-muted">{label}</span>
                  <span style={{ fontWeight: 500 }}>{String(value)}</span>
                </div>
              ) : null)}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
