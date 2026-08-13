import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, Coins, Menu,
  Users, Gift, CheckSquare, Car, MapPin, User, HelpCircle, LogOut, Download, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileNav() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const navStyle = (path: string): React.CSSProperties => ({
    flexDirection: 'column',
    gap: 4,
    padding: 8,
    margin: 0,
    background: 'transparent',
    border: 'none',
    color: isActive(path) ? 'var(--primary-navy)' : 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  });

  const handleNav = (path: string) => {
    setDrawerOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="mobile-nav">
        <Link to="/" className="nav-item" style={navStyle('/')}>
          <LayoutDashboard size={20} /><span style={{ fontSize: 10 }}>Home</span>
        </Link>
        <Link to="/projects" className="nav-item" style={navStyle('/projects')}>
          <Building2 size={20} /><span style={{ fontSize: 10 }}>Projects</span>
        </Link>
        <Link to="/bookings" className="nav-item" style={navStyle('/bookings')}>
          <FileText size={20} /><span style={{ fontSize: 10 }}>Bookings</span>
        </Link>
        <Link to="/commissions" className="nav-item" style={navStyle('/commissions')}>
          <Coins size={20} /><span style={{ fontSize: 10 }}>Earnings</span>
        </Link>
        <button
          className="nav-item"
          style={{ ...navStyle('__menu'), background: 'transparent', border: 'none' }}
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={20} /><span style={{ fontSize: 10 }}>Menu</span>
        </button>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 105 }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 'min(280px, 85vw)', background: 'var(--surface)',
          zIndex: 110, display: 'flex', flexDirection: 'column',
          boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/assets/branding/sonthillu_constructions_logo_exact.svg" alt="Sonthillu" style={{ maxWidth: 140, height: 'auto' }} />
          <button style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer' }} onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            { path: '/team',           label: 'My Team',          icon: <Users size={20} /> },
            { path: '/offers',         label: 'Offers',           icon: <Gift size={20} /> },
            { path: '/pending-requests', label: 'Pending Requests', icon: <CheckSquare size={20} /> },
            { path: '/travel',         label: 'Travel Allowance', icon: <Car size={20} /> },
            { path: '/site-visits',    label: 'Site Visits',      icon: <MapPin size={20} /> },
            { path: '/profile',        label: 'My Profile',       icon: <User size={20} /> },
            { path: '/help',           label: 'Help Center',      icon: <HelpCircle size={20} /> },
          ].map(item => (
            <button
              key={item.path}
              className="nav-item"
              style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)', background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }}
              onClick={() => handleNav(item.path)}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
            <button
              id="drawer-install-btn"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 8, display: 'none' }}
            >
              <Download size={16} /> Install App
            </button>
            <button
              className="btn"
              style={{ width: '100%', justifyContent: 'center', background: '#fee2e2', color: '#dc2626', border: 'none' }}
              onClick={logout}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
