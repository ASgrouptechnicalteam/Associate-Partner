import AppLayout from '../components/AppLayout';
import { HelpCircle, Mail, Phone, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  return (
    <AppLayout title="Help Center">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Help Center</h1>
        <p className="text-muted">Get support and find answers</p>
      </div>
      <div className="responsive-grid-3">
        {[
          { icon: <Mail size={32} />, title: 'Email Support', desc: 'Send us an email for detailed queries', action: 'mailto:support@sonthilluconstructions.com', label: 'Send Email' },
          { icon: <Phone size={32} />, title: 'Call Support', desc: 'Speak to our team directly', action: 'tel:+919999999999', label: 'Call Now' },
          { icon: <MessageSquare size={32} />, title: 'WhatsApp', desc: 'Chat with us on WhatsApp', action: 'https://wa.me/919999999999', label: 'Open WhatsApp' },
        ].map(card => (
          <div key={card.title} className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ color: 'var(--primary)', margin: '0 auto var(--space-4)', display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
            <h3 style={{ marginBottom: 8 }}>{card.title}</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>{card.desc}</p>
            <a href={card.action} className="btn btn-primary">{card.label}</a>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}><HelpCircle size={20} style={{ display: 'inline', marginRight: 8 }} />Frequently Asked Questions</h3>
        {[
          { q: 'How do I submit a booking?', a: 'Go to Bookings → New Booking and fill in the customer and project details.' },
          { q: 'How do I check my commissions?', a: 'Go to Commissions to view your full earnings ledger and payment status.' },
          { q: 'How do I add a team member?', a: 'Your Area Manager (AM) or MD can add new associates from Manage Associates.' },
          { q: 'How do I request travel reimbursement?', a: 'Go to Travel Allowance → New Request and submit the details.' },
        ].map((item, i) => (
          <details key={i} style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', listStyle: 'none' }}>Q: {item.q}</summary>
            <p className="text-muted" style={{ marginTop: 8, paddingLeft: 16 }}>{item.a}</p>
          </details>
        ))}
      </div>
    </AppLayout>
  );
}
