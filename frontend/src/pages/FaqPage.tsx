import AppLayout from '../components/AppLayout';

export default function FaqPage() {
  const faqs = [
    { q: 'What is the Associate Partner Portal?', a: 'A dedicated workspace for Sonthillu Constructions associates to manage projects, bookings, commissions, site visits, and more.' },
    { q: 'How are commissions calculated?', a: 'Commissions are calculated based on the project type, booking amount, and your role-specific percentage as configured by the management.' },
    { q: 'Can I access the portal on mobile?', a: 'Yes! The portal is fully responsive and can be installed as a PWA on your phone for a native app-like experience.' },
    { q: 'What happens when I submit a booking?', a: 'The booking goes to your AM for review. Once approved by AM, it escalates to MD for final approval. You\'ll receive notifications at each step.' },
    { q: 'How do I reset my password?', a: 'Contact your Area Manager or MD. They can reset your account from the Manage Associates section.' },
  ];

  return (
    <AppLayout title="FAQ">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Frequently Asked Questions</h1>
        <p className="text-muted">Quick answers to common questions</p>
      </div>
      <div className="card">
        {faqs.map((item, i) => (
          <details key={i} style={{ padding: 'var(--space-4)', borderBottom: i < faqs.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', listStyle: 'none', fontSize: 15 }}>{item.q}</summary>
            <p className="text-muted" style={{ marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>{item.a}</p>
          </details>
        ))}
      </div>
    </AppLayout>
  );
}
