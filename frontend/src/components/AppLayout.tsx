import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <Header title={title} />
        <main className="main-content">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
