import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Poll unread notification count
  useEffect(() => {
    const poll = async () => {
      try {
        const data = await api.notifications.list(true) as { notifications: unknown[] };
        setUnreadCount(data.notifications?.length ?? 0);
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const initials = user ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="header">
      {/* Left: mobile logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <img
          src="/assets/branding/sonthillu-logo.svg"
          alt="Sonthillu Constructions"
          className="mobile-only"
          style={{ maxWidth: '130px', height: '32px', objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <h2
          className="header-title"
          style={{ margin: 0, fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}
        >
          {title}
        </h2>
      </div>

      {/* Centre: search (desktop only) */}
      <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }} className="desktop-only">
        <div
          className="header-search"
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 400, backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-pill)', padding: '0 var(--space-4)', height: 44, border: '1px solid transparent', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search projects, bookings..."
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14, color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-4)', flex: 1 }}>
        {/* Notification Bell */}
        <button
          className="btn btn-secondary"
          style={{ padding: '0 10px', position: 'relative', border: 'none', background: 'transparent' }}
          onClick={() => navigate('/notifications')}
        >
          <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: 0, right: 2, background: 'var(--error)', color: 'white', borderRadius: '50%', fontSize: 10, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, border: '2px solid var(--surface)' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-1) var(--space-3) var(--space-1) var(--space-1)', borderRadius: 'var(--radius-pill)', transition: 'background-color 0.2s' }}
            onClick={() => setMenuOpen(o => !o)}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-bg)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0, fontSize: 14 }}>
              {initials}
            </div>
            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name ?? 'User'}</span>
              <span className="caption" style={{ lineHeight: 1.2, color: 'var(--text-muted)' }}>{user?.role ?? ''}</span>
            </div>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} className="desktop-only" />
          </div>

          <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>{user?.role}</span>
            </div>
            <div style={{ padding: 'var(--space-2) 0' }}>
              <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <User size={16} /> My Profile
              </Link>
              <Link to="/help" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <HelpCircle size={16} /> Help Center
              </Link>
            </div>
            <div style={{ padding: 'var(--space-2) 0', borderTop: '1px solid var(--border-light)' }}>
              <button className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
