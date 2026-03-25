import { useMemo, useState } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Car, LayoutDashboard, ShoppingBag, Vote, Bell } from 'lucide-react';

export default function AppLayout({ requireAdmin = false }) {
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileLinks = useMemo(() => {
    if (user?.role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/polls', icon: Vote, label: 'Polls' },
        { to: '/admin/parking', icon: Car, label: 'Parking' },
        { to: '/admin/marketplace', icon: ShoppingBag, label: 'Market' },
        { to: '/admin/notifications', icon: Bell, label: 'Alerts' },
      ];
    }

    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
      { to: '/polls', icon: Vote, label: 'Polls' },
      { to: '/parking', icon: Car, label: 'Parking' },
      { to: '/marketplace', icon: ShoppingBag, label: 'Market' },
      { to: '/notifications', icon: Bell, label: 'Alerts' },
    ];
  }, [user?.role]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (!requireAdmin && user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="ambient-stage flex min-h-screen overflow-hidden bg-app-gradient">
      <div className="ambient-lights" aria-hidden="true" />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Topbar onMenuToggle={() => setMobileOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 mobile-safe-bottom lg:pb-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-white/15 bg-slate-900/75 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {mobileLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'bg-primary-600/25 text-white' : 'text-slate-300'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
