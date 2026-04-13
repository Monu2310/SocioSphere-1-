import { createElement } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Car, ShoppingBag, BarChart3,
  Bell, LogOut, ChevronLeft, ChevronRight, Building2, Vote,
  Sparkles, Settings
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/residents', icon: Users, label: 'Residents' },
  { to: '/admin/polls', icon: Vote, label: 'Polls' },
  { to: '/admin/parking', icon: Car, label: 'Parking' },
  { to: '/admin/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { to: '/admin/insights', icon: Sparkles, label: 'AI Insights' },
];

const residentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/polls', icon: Vote, label: 'Community Polls' },
  { to: '/parking', icon: Car, label: 'My Parking' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
];

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = isAdmin ? adminLinks : residentLinks;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <aside
      className={`motion-surface fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-white/10 bg-dark-800/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-16' : 'w-72 lg:w-64'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary-600 shadow-[0_0_22px_rgba(56,189,248,0.35)] flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">SocioSphere</h1>
            <p className="text-xs text-slate-400">Society Management</p>
          </div>
        )}
      </div>

      {/* User Role Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-3 glass-card">
          <p className="text-xs text-slate-400 truncate">{user?.name}</p>
          <span className={`text-xs font-semibold mt-1 inline-block ${isAdmin ? 'text-primary-400' : 'text-amber-300'}`}>
            {isAdmin ? '⚡ Admin' : '🏠 Resident'} {user?.flatNumber && `· ${user.flatNumber}`}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            onClick={onClose}
          >
            {createElement(icon, { size: 18, className: 'flex-shrink-0' })}
            {!collapsed && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <NavLink to={isAdmin ? '/admin/notifications' : '/notifications'} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'} onClick={onClose}>
          <Bell size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Notifications</span>}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'} onClick={onClose}>
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Profile</span>}
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-dark-700 transition-colors hover:bg-primary-600 z-10 lg:flex"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 lg:hidden"
      >
        Close
      </button>
    </aside>
  );
}
