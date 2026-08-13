import AppLayout from '../components/AppLayout';

export default function CarouselManagerPage() {
  return (
    <AppLayout title="Carousel Manager">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Carousel Manager</h1>
        <p className="text-muted">Manage dashboard hero carousel slides</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p className="text-muted" style={{ marginBottom: 16 }}>Use Dashboard Content Manager to manage carousel slides.</p>
        <a href="/dashboard-content" className="btn btn-primary">Open Dashboard Content</a>
      </div>
    </AppLayout>
  );
}
