import { useEffect, useState } from 'react';
import { Users, Car, Vote, ShoppingBag, Sparkles, TrendingUp, Activity } from 'lucide-react';
import { residentService, aiService } from '../../services';
import { StatCard, PageLoader, Badge } from '../../components/common';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const COLORS = ['#06b6d4', '#38bdf8', '#2dd4bf', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, insightsRes] = await Promise.all([
          residentService.getDashboardStats(),
          aiService.getInsights(),
        ]);
        setStats(statsRes.data.data);
        setInsights(insightsRes.data.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const parkingChartData = insights?.marketplaceTrends?.map((t) => ({
    name: t.category,
    value: t._count.category,
  })) || [];

  const pollData = insights?.pollActivity?.map((p) => ({
    name: p.title.slice(0, 20) + '...',
    votes: p.votes,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Residents" value={stats?.residents?.total || 0} sub={`${stats?.residents?.active || 0} active`} color="blue" />
        <StatCard icon={Vote} label="Active Polls" value={stats?.polls?.active || 0} sub="community votes" color="purple" />
        <StatCard icon={Car} label="Parking Used" value={`${stats?.parking?.occupied || 0}/${stats?.parking?.total || 0}`} sub={`${stats?.parking?.available || 0} available`} color="orange" />
        <StatCard icon={ShoppingBag} label="Marketplace" value={stats?.marketplace?.activeListings || 0} sub="active listings" color="green" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Poll Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">Poll Activity</h2>
          </div>
          {pollData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={pollData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="votes" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">No poll data yet</p>
          )}
        </div>

        {/* Marketplace by Category */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-cyan-300" />
            <h2 className="font-semibold text-white">Marketplace Categories</h2>
          </div>
          {parkingChartData.length > 0 ? (
            <div className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={parkingChartData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                  {parkingChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="space-y-2 flex-1">
                {parkingChartData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-300 text-xs">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">No marketplace data yet</p>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights?.insights?.length > 0 && (
        <div className="glass-card p-6 border-primary-500/20 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-500/15 blur-3xl" />
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">AI Insights</h2>
            <span className="badge-purple text-xs">Powered by AI</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                <div className="w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary-400">✦</span>
                </div>
                <p className="text-sm text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">
                    {log.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{log.user?.name}</p>
                    <p className="text-xs text-slate-400">{log.action} · {log.entity}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
