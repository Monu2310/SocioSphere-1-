import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pollService, parkingService, marketplaceService, notificationService } from '../../services';
import { StatCard, PageLoader, Badge } from '../../components/common';
import { Vote, Car, ShoppingBag, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pollsRes, parkingRes, marketRes, notifRes] = await Promise.all([
          pollService.getAll({ status: 'ACTIVE', limit: 3 }),
          parkingService.getAll({ status: 'OCCUPIED' }),
          marketplaceService.getAll({ limit: 4, status: 'AVAILABLE' }),
          notificationService.getAll({ limit: 5 }),
        ]);
        setPolls(pollsRes.data.data);
        const mySlots = parkingRes.data.data.filter((s) =>
          s.assignments?.some((a) => a.userId === user?.id && a.isActive)
        );
        setParkingSlots(mySlots);
        setMarketItems(marketRes.data.data);
        setNotifications(notifRes.data.data);
        setUnreadCount(notifRes.data.unreadCount);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card p-5 sm:p-6 border-primary-500/20 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 right-8 h-36 w-36 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-slate-400 mt-1">Flat {user?.flatNumber || '—'} · SocioSphere Resident</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Vote} label="Active Polls" value={polls.length} sub="awaiting your vote" color="blue" />
        <StatCard icon={Car} label="Parking Slots" value={parkingSlots.length} sub="assigned to you" color="green" />
        <StatCard icon={ShoppingBag} label="Marketplace" value={marketItems.length} sub="items available" color="purple" />
        <StatCard icon={Bell} label="Notifications" value={unreadCount} sub="unread messages" color={unreadCount > 0 ? 'orange' : 'blue'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Polls */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Vote size={16} className="text-primary-400" /> Active Polls
            </h2>
            <Link to="/polls" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {polls.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No active polls</p>
          ) : (
            <div className="space-y-3">
              {polls.map((poll) => {
                const totalVotes = poll._count?.votes || 0;
                return (
                  <Link to="/polls" key={poll.id} className="block bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white font-medium line-clamp-2">{poll.title}</p>
                      <Badge status={poll.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
                    {poll.userVotedOptionId && <p className="text-xs text-cyan-300 mt-1">✓ You voted</p>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Bell size={16} className="text-yellow-400" /> Notifications
              {unreadCount > 0 && <span className="badge-yellow">{unreadCount}</span>}
            </h2>
            <Link to="/notifications" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl ${!n.isRead ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-white/5'}`}>
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marketplace Preview */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <ShoppingBag size={16} className="text-cyan-300" /> Marketplace Highlights
          </h2>
          <Link to="/marketplace" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            Browse all <ArrowRight size={12} />
          </Link>
        </div>
        {marketItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No items listed yet</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {marketItems.map((item) => (
              <Link to="/marketplace" key={item.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors block">
                <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
                <p className="text-lg font-bold text-primary-400 mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-400">{item.seller?.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
