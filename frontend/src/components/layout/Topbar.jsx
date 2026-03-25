import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenuToggle }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="motion-surface h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-dark-800/60 backdrop-blur-md">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden p-2.5 rounded-xl hover:bg-white/10 transition-colors" aria-label="Open menu">
            <Menu size={20} />
          </button>
        )}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-64 lg:w-80">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search marketplace..."
            className="bg-transparent text-sm text-white placeholder-slate-400 outline-none w-full"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate(isAdmin ? '/admin/notifications' : '/notifications')}
          className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Bell size={18} className="text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="w-7 h-7 rounded-lg bg-primary-600 shadow-[0_0_18px_rgba(34,197,94,0.35)] flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.flatNumber || (isAdmin ? 'Admin' : 'Resident')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
