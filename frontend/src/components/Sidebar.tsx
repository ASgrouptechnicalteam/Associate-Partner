import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, Coins, Users,
  Gift, Hourglass, Car, MapPin, Bell, Images, MessageSquare,
  Star, UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const mainNav: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/projects', label: 'Projects', icon: <Building2 size={20} /> },
  { path: '/bookings', label: 'Bookings', icon: <FileText size={20} /> },
  { path: '/commissions', label: 'Commissions', icon: <Coins size={20} /> },
  { path: '/team', label: 'Team', icon: <Users size={20} /> },
];

const opsNav: NavItem[] = [
  { path: '/offers', label: 'Offers', icon: <Gift size={20} /> },
  { path: '/pending-requests', label: 'Pending Requests', icon: <Hourglass size={20} /> },
  { path: '/travel', label: 'Travel Allowance', icon: <Car size={20} /> },
  { path: '/site-visits', label: 'Site Visits', icon: <MapPin size={20} /> },
  { path: '/reviews', label: 'Reviews', icon: <Star size={20} /> },
  { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
];

const adminNav: NavItem[] = [
  { path: '/admin/associates', label: 'Manage Associates', icon: <UserCheck size={20} />, roles: ['MD', 'AM'] },
  { path: '/approval-center', label: 'Approval Center', icon: <UserCheck size={20} />, roles: ['MD', 'AM'] },
  { path: '/carousel-manager', label: 'Carousel', icon: <Images size={20} />, roles: ['MD', 'AM'] },
  { path: '/popup-manager', label: 'Popup', icon: <MessageSquare size={20} />, roles: ['MD', 'AM'] },
  { path: '/dashboard-content', label: 'Dashboard Content', icon: <LayoutDashboard size={20} />, roles: ['MD', 'AM'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const NavLink = ({ item }: { item: NavItem }) => {
    if (item.roles && user && !item.roles.includes(user.role)) return null;
    return (
      <Link to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
        {item.icon}
        <span className="nav-label">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: 'var(--space-6) var(--space-4) var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="/assets/branding/sonthillu_constructions_logo_exact.svg"
          alt="Sonthillu Constructions"
          style={{ maxWidth: '130px', height: 'auto', objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-2) var(--space-4)' }}>
        <div className="nav-section-title">Main</div>
        {mainNav.map(item => <NavLink key={item.path} item={item} />)}

        <div className="nav-section-title">Operations</div>
        {opsNav.map(item => <NavLink key={item.path} item={item} />)}

        {user && (user.role === 'MD' || user.role === 'AM') && (
          <>
            <div className="nav-section-title">Engagement / Content</div>
            {adminNav.map(item => <NavLink key={item.path} item={item} />)}
          </>
        )}
      </nav>
    </aside>
  );
}
