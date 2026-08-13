import AppLayout from '../components/AppLayout';

export default function OffersPage() {
  return (
    <AppLayout title="Offers & Promotions">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Offers & Promotions</h1>
        <p className="text-muted">View active offers and promotions</p>
      </div>
      {/* Content loaded from dashboard offers — link to dashboard */}
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p className="text-muted">View the latest offers and promotions on the <a href="/" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Dashboard</a>.</p>
      </div>
    </AppLayout>
  );
}
