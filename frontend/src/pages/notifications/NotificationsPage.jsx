import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../../services';
import { PageLoader, EmptyState, Modal, Pagination } from '../../components/common';
import { Bell, CheckCheck, Send, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const TYPE_ICONS = { info: Info, success: CheckCircle, warning: AlertTriangle, error: XCircle };
const TYPE_COLORS = { info: 'text-cyan-300 bg-cyan-500/10', success: 'text-emerald-300 bg-emerald-500/10', warning: 'text-yellow-400 bg-yellow-500/10', error: 'text-red-400 bg-red-500/10' };

export default function NotificationsPage() {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ page, limit: 20 });
      setNotifications(res.data.data);
      setPagination(res.data.pagination);
      setUnreadCount(res.data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleBroadcast = async (data) => {
    setSubmitting(true);
    try {
      const res = await notificationService.broadcast(data);
      toast.success(res.data.message);
      setShowBroadcast(false);
      reset();
    } catch { toast.error('Failed to broadcast'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'Stay updated with community alerts'}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex-1 sm:flex-none">
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setShowBroadcast(true)} className="btn-primary flex-1 sm:flex-none">
              <Send size={15} /> Broadcast
            </button>
          )}
        </div>
      </div>

      {loading ? <PageLoader /> : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] || Info;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`glass-card p-3 sm:p-4 flex items-start gap-3 sm:gap-4 cursor-pointer transition-all ${!n.isRead ? 'border-primary-500/30 bg-primary-500/5' : 'opacity-80 hover:opacity-100'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium leading-snug ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={pagination.pages} onPage={setPage} />

      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Broadcast Notification" size="sm">
        <form onSubmit={handleSubmit(handleBroadcast)} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Title *</label>
            <input {...register('title', { required: true })} className="input-field" placeholder="Important Notice" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Message *</label>
            <textarea {...register('message', { required: true })} className="input-field resize-none" rows={4} placeholder="Your message to all residents..." />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Type</label>
            <select {...register('type')} className="input-field">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="btn-primary">
              <Send size={15} /> {submitting ? 'Sending...' : 'Send to All'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
