import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, DollarSign, Building, User, CheckCheck } from 'lucide-react';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';

interface Notification { id: string; category: string; message: string; link?: string; isRead: boolean; createdAt: string; }

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'SYSTEM': return <Settings size={20} />;
    case 'FINANCE': return <DollarSign size={20} />;
    case 'PROJECT': return <Building size={20} />;
    case 'USER': return <User size={20} />;
    default: return <Bell size={20} />;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.notifications.list() as { notifications: Notification[] };
      setNotifications(data.notifications || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try { await api.notifications.markRead(n.id); } catch {}
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    }
    if (n.link && n.link !== '#') navigate(n.link);
  };

  const markAllRead = async () => {
    try { await api.notifications.markAllRead(); } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppLayout title="Notifications">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Notifications</h1>
          <p className="text-muted">Stay up to date with your activities.</p>
        </div>
        <button className="btn btn-secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark all as read</button>
      </div>

      {loading && <div className="text-muted">Loading notifications...</div>}

      {!loading && notifications.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          No notifications yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {notifications.map(n => (
          <div
            key={n.id}
            className="card"
            style={{
              padding: 'var(--space-4)',
              borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)',
              backgroundColor: n.isRead ? undefined : 'var(--primary-bg)',
              cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', opacity: n.isRead ? 0.8 : 1,
            }}
            onClick={() => handleClick(n)}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateX(4px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'none')}
          >
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: n.isRead ? 'var(--surface-muted)' : 'var(--primary)', color: n.isRead ? 'var(--text-muted)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {categoryIcon(n.category)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: n.isRead ? 'var(--text-muted)' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {n.category}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: n.isRead ? 400 : 600, lineHeight: 1.5 }}>
                  {n.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
