import AppLayout from '../components/AppLayout';

export default function TutorialsPage() {
  return (
    <AppLayout title="Tutorials">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Tutorials</h1>
        <p className="text-muted">Learn how to use the portal</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p className="text-muted">Tutorials coming soon. Contact your manager for guidance.</p>
      </div>
    </AppLayout>
  );
}
