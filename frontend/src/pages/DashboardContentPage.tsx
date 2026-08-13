import AppLayout from '../components/AppLayout';

export default function DashboardContentPage() {
  return (
    <AppLayout title="Dashboard Content">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard Content Manager</h1>
        <p className="text-muted">Manage carousel slides, popups, and announcements</p>
      </div>
      <div className="responsive-grid-3">
        {[
          { title: 'Carousel Slides', desc: 'Add, edit, or remove hero carousel slides on the dashboard', icon: '🖼️' },
          { title: 'Announcements', desc: 'Post important announcements for associates', icon: '📢' },
          { title: 'Popup Manager', desc: 'Configure the popup shown on dashboard load', icon: '💬' },
        ].map(card => (
          <div key={card.title} className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{card.icon}</div>
            <h3 style={{ marginBottom: 8 }}>{card.title}</h3>
            <p className="text-muted">{card.desc}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
