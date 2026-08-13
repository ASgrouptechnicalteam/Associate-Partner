import AppLayout from '../components/AppLayout';

export default function PopupManagerPage() {
  return (
    <AppLayout title="Popup Manager">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Popup Manager</h1>
        <p className="text-muted">Manage dashboard popup announcements</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p className="text-muted" style={{ marginBottom: 16 }}>Use Dashboard Content Manager to manage popups.</p>
        <a href="/dashboard-content" className="btn btn-primary">Open Dashboard Content</a>
      </div>
    </AppLayout>
  );
}
