import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

interface Slide { id: string; title?: string; subtitle?: string; description?: string; image: string; type: string; ctaText?: string; ctaUrl?: string; }
interface Offer { id: string; title: string; description?: string; image?: string; discount?: string; commissionBonus?: string; startDate?: string; endDate?: string; }
interface Announcement { id: string; title: string; message: string; type: string; priority: string; ctaText?: string; ctaUrl?: string; displayFrequency: string; image?: string; }
interface Stats { totalBookings: number; totalCommissions: string; activeProjects: number; teamSize: number; pendingRequests: number; }

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      api.dashboard.stats().then((d: any) => setStats(d.stats)),
      api.dashboard.carousel().then((d: any) => setSlides(d.carousel || [])),
      api.dashboard.offers().then((d: any) => setOffers(d.offers || [])),
      api.dashboard.announcements().then((d: any) => setAnnouncements(d.announcements || [])),
    ]).finally(() => setLoading(false));
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setCurrentSlide(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const dismissAnnouncement = async (id: string) => {
    try { await api.dashboard.dismissAnnouncement(id); }
    catch {}
    setAnnouncements(a => a.filter(x => x.id !== id));
  };

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings ?? '—', color: 'var(--info)' },
    { label: 'My Commissions', value: stats?.totalCommissions ? `₹${Number(stats.totalCommissions).toLocaleString()}` : '—', color: 'var(--success)' },
    { label: 'Active Projects', value: stats?.activeProjects ?? '—', color: 'var(--primary)' },
    { label: 'Team Size', value: stats?.teamSize ?? '—', color: 'var(--warning)' },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* Stats */}
      <div className="responsive-grid-4">
        {statCards.map(card => (
          <div key={card.label} className="card" style={{ borderLeft: `4px solid ${card.color}` }}>
            {loading ? (
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
            ) : (
              <>
                <p className="text-muted" style={{ marginBottom: 4, fontSize: 13 }}>{card.label}</p>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{String(card.value)}</h2>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: 'var(--space-4)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.title}</p>
                <p className="text-muted">{a.message}</p>
                {a.ctaText && a.ctaUrl && (
                  <a href={a.ctaUrl} className="btn btn-primary" style={{ marginTop: 12, height: 36, fontSize: 13 }}>{a.ctaText}</a>
                )}
              </div>
              <button onClick={() => dismissAnnouncement(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, fontSize: 18 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Carousel */}
      {slides.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: 350, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: 'var(--surface)' }}>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === currentSlide ? 1 : 0, transition: 'opacity 0.5s ease-in-out', zIndex: i === currentSlide ? 1 : 0 }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 50%, transparent 100%)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
                <span style={{ background: 'var(--brand-gold)', color: 'var(--brand-navy)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 'var(--radius-pill)', alignSelf: 'flex-start', marginBottom: 12 }}>{slide.type}</span>
                <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{slide.title}</h2>
                {slide.description && <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 500, marginBottom: 24 }}>{slide.description}</p>}
                {slide.ctaText && slide.ctaUrl && (
                  <a href={slide.ctaUrl} style={{ background: 'var(--brand-gold)', color: 'var(--brand-navy)', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 700, alignSelf: 'flex-start' }}>{slide.ctaText}</a>
                )}
              </div>
            </div>
          ))}
          {slides.length > 1 && (
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 24 : 8, height: 8, borderRadius: 'var(--radius-pill)', background: i === currentSlide ? 'var(--brand-gold)' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <>
          <h3 style={{ marginBottom: 0 }}>Active Offers</h3>
          <div className="responsive-grid-3">
            {offers.map(offer => (
              <div key={offer.id} className="card" style={{ padding: 'var(--space-4)' }}>
                {offer.image && <img src={offer.image} alt={offer.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 12 }} />}
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>{offer.title}</h3>
                <p className="text-muted">{offer.description}</p>
                {offer.discount && <div className="status-chip status-approved" style={{ marginTop: 8 }}>Discount: {offer.discount}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate('/bookings/new')}>+ New Booking</button>
          <button className="btn btn-secondary" onClick={() => navigate('/site-visits')}>+ Schedule Visit</button>
          <button className="btn btn-secondary" onClick={() => navigate('/travel')}>+ Travel Request</button>
          {user && (user.role === 'MD' || user.role === 'AM') && (
            <button className="btn btn-secondary" onClick={() => navigate('/associates/new')}>+ Add Associate</button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
