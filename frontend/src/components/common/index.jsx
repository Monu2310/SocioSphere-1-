import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  return <Loader2 size={sizes[size]} className={`animate-spin text-primary-400 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Icon size={28} className="text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-xs mb-6">{description}</p>}
      {action && action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue: 'border-cyan-400/25 text-cyan-300',
    green: 'border-primary-500/30 text-primary-300',
    purple: 'border-sky-400/25 text-sky-300',
    orange: 'border-amber-400/25 text-amber-300',
    red: 'border-red-400/25 text-red-300',
  };

  return (
    <div className={`glass-card p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color]} bg-white/5`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    ACTIVE: 'badge-green',
    AVAILABLE: 'badge-green',
    OPEN: 'badge-green',
    CLOSED: 'badge-red',
    OCCUPIED: 'badge-red',
    SOLD: 'badge-red',
    EXPIRED: 'badge-yellow',
    RESERVED: 'badge-yellow',
    RESIDENT: 'badge-blue',
    VISITOR: 'badge-purple',
    ADMIN: 'badge-purple',
  };
  return <span className={map[status] || 'badge-blue'}>{status}</span>;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading, danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card p-6 max-w-sm w-full mx-4 animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'btn-danger text-sm' : 'btn-primary text-sm'}
          >
            {loading ? <Spinner size="sm" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className={`glass-card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-slide-up`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
      >
        ← Prev
      </button>
      {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
