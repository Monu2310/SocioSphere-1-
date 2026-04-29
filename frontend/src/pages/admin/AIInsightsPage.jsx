import { useEffect, useState } from 'react';
import { aiService, notificationService } from '../../services';
import { PageLoader, StatCard, ConfirmModal } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, TrendingUp, Users, Car, ShoppingBag, Vote, Activity, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#06b6d4', '#38bdf8', '#2dd4bf', '#f59e0b', '#ef4444', '#14b8a6', '#84cc16'];

export default function AIInsightsPage() {
  const { isLight } = useTheme();
  const [insights, setInsights] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorities, setPriorities] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeAudience, setNoticeAudience] = useState('Residents');
  const [noticePoints, setNoticePoints] = useState('');
  const [noticeDraft, setNoticeDraft] = useState(null);
  const [noticeSubject, setNoticeSubject] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [toolLoading, setToolLoading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [insightsRes, logsRes] = await Promise.all([
          aiService.getInsights(),
          aiService.getActivityLogs({ limit: 15 }),
        ]);
        setInsights(insightsRes.data.data);
        setLogs(logsRes.data.data);
      } catch {
        toast.error('Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const [priorityRes, followRes, forecastRes] = await Promise.all([
          aiService.getPriorityQueue(),
          aiService.getFollowups(),
          aiService.getMaintenanceForecast(),
        ]);
        setPriorities(priorityRes.data.data.priorities || []);
        setFollowups(followRes.data.data.pending || []);
        setForecast(forecastRes.data.data);
      } catch {
        toast.error('Failed to load AI tools');
      }
    };
    loadTools();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('sociosphere-notice-draft');
    if (!stored) return;
    try {
      const draft = JSON.parse(stored);
      setNoticeDraft({ subject: draft.subject, body: draft.body });
      setNoticeSubject(draft.subject || '');
      setNoticeBody(draft.body || '');
      setDraftSavedAt(draft.savedAt || null);
    } catch {
      localStorage.removeItem('sociosphere-notice-draft');
    }
  }, []);

  if (loading) return <PageLoader />;

  const marketplaceData = insights?.marketplaceTrends?.map((t, i) => ({
    name: t.category,
    count: t._count.category,
    fill: COLORS[i % COLORS.length],
  })) || [];

  const pollData = insights?.pollActivity?.map((p) => ({
    name: p.title.length > 25 ? p.title.slice(0, 25) + '...' : p.title,
    votes: p.votes,
  })) || [];

  const axisTick = isLight ? '#475569' : '#94a3b8';
  const axisNumber = isLight ? '#64748b' : '#64748b';
  const tooltipStyle = isLight
    ? { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a' }
    : { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 };
  const pollBarColor = isLight ? '#0284c7' : '#06b6d4';

  const handleGenerateNotice = async () => {
    if (!noticeTitle.trim()) {
      toast.error('Add a notice title');
      return;
    }
    setToolLoading(true);
    try {
      const points = noticePoints.split('\n').map((p) => p.trim()).filter(Boolean);
      const res = await aiService.generateNotice({ title: noticeTitle, points, audience: noticeAudience });
      setNoticeDraft(res.data.data);
      setNoticeSubject(res.data.data.subject || noticeTitle);
      setNoticeBody(res.data.data.body || '');
    } catch {
      toast.error('Failed to generate notice draft');
    } finally {
      setToolLoading(false);
    }
  };

  const handleBroadcastNotice = async () => {
    if (!noticeSubject.trim() || !noticeBody.trim()) {
      toast.error('Generate a draft and review the message');
      return;
    }
    setBroadcasting(true);
    try {
      await notificationService.broadcast({
        title: noticeSubject.trim(),
        message: noticeBody.trim(),
      });
      toast.success('Notice broadcasted');
      setShowBroadcastConfirm(false);
    } catch {
      toast.error('Failed to broadcast notice');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSaveDraft = () => {
    if (!noticeSubject.trim() && !noticeBody.trim()) {
      toast.error('Draft is empty');
      return;
    }
    const savedAt = new Date().toISOString();
    const payload = { subject: noticeSubject.trim(), body: noticeBody.trim(), savedAt };
    localStorage.setItem('sociosphere-notice-draft', JSON.stringify(payload));
    setDraftSavedAt(savedAt);
    toast.success('Draft saved');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Sparkles size={24} className="text-primary-400" /> AI Insights
        </h1>
        <p className="page-subtitle">Smart analytics and community intelligence</p>
      </div>

      {/* Summary Stats */}
      {insights?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Active Residents" value={insights.summary.totalResidents} color="blue" />
          <StatCard icon={Vote} label="Active Polls" value={insights.summary.activePolls} color="purple" />
          <StatCard icon={Car} label="Parking Used" value={insights.summary.parkingOccupancy} color="orange" />
          <StatCard icon={ShoppingBag} label="Listings" value={insights.summary.marketplaceListings} color="green" />
        </div>
      )}

      {/* AI Operations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h2 className="section-title mb-3">Priority Queue</h2>
          {priorities.length === 0 ? (
            <p className="text-slate-400 text-sm">No urgent items detected.</p>
          ) : (
            <div className="space-y-3">
              {priorities.map((item, i) => (
                <div key={`${item.title}-${i}`} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.level} priority</p>
                  <p className="text-sm text-white font-medium mt-1">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="section-title mb-3">Smart Follow-ups</h2>
          {followups.length === 0 ? (
            <p className="text-slate-400 text-sm">No follow-ups needed right now.</p>
          ) : (
            <div className="space-y-3">
              {followups.map((poll) => (
                <div key={poll.pollId} className="bg-white/5 rounded-xl p-3">
                  <p className="text-sm text-white font-medium">{poll.pollTitle}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pending: {poll.pendingResidents.length} residents
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {poll.pendingResidents.map((r) => r.name).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="section-title mb-3">Maintenance Forecast</h2>
          {forecast ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Risk Score</p>
                <p className="text-lg font-semibold text-white">{forecast.riskScore}</p>
              </div>
              {forecast.signals?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Signals</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {forecast.signals.map((s) => <li key={s}>• {s}</li>)}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-1">Suggested actions</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {forecast.actions?.map((a) => <li key={a}>• {a}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No forecast available.</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Notice Generator</h2>
          <span className="badge-purple text-xs">AI Draft</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notice title</label>
              <input
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="input-field"
                placeholder="Water supply maintenance"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Audience</label>
              <input
                value={noticeAudience}
                onChange={(e) => setNoticeAudience(e.target.value)}
                className="input-field"
                placeholder="Residents"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Key points (one per line)</label>
              <textarea
                value={noticePoints}
                onChange={(e) => setNoticePoints(e.target.value)}
                className="input-field resize-none"
                rows={6}
                placeholder="Work window: 10am-1pm\nPlease store water in advance\nContact office for urgent needs"
              />
            </div>
            <button type="button" onClick={handleGenerateNotice} className="btn-primary" disabled={toolLoading}>
              {toolLoading ? 'Generating...' : 'Generate Draft'}
            </button>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            {noticeDraft ? (
              <>
                <label className="block text-xs text-slate-400 mb-1">Subject</label>
                <input
                  value={noticeSubject}
                  onChange={(e) => setNoticeSubject(e.target.value)}
                  className="input-field mb-3"
                />
                <label className="block text-xs text-slate-400 mb-1">Message</label>
                <textarea
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  className="input-field resize-none"
                  rows={10}
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-400">
                    {draftSavedAt ? `Draft saved ${new Date(draftSavedAt).toLocaleString('en-IN')}` : 'Draft not saved'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="btn-secondary"
                    >
                      Save Draft
                    </button>
                  <button
                    type="button"
                    onClick={() => setShowBroadcastConfirm(true)}
                    className="btn-primary"
                    disabled={broadcasting}
                  >
                    {broadcasting ? 'Broadcasting...' : 'Broadcast Notice'}
                  </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Generate a draft to preview the notice copy.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      {insights?.insights?.length > 0 && (
        <div className="glass-card p-4 sm:p-6 border-primary-500/20 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-primary-500/15 blur-3xl" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-primary-400" />
            </div>
            <h2 className="font-semibold text-white">AI-Generated Insights</h2>
            <span className="badge-purple text-xs ml-auto">Auto-analyzed</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.insights.map((insight, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-primary-300">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Marketplace Trends */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-cyan-300" />
            <h2 className="font-semibold text-white">Marketplace by Category</h2>
          </div>
          {marketplaceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={marketplaceData} layout="vertical">
                <XAxis type="number" tick={{ fill: axisNumber, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: axisTick, fontSize: 11 }} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {marketplaceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-12">No marketplace data yet</p>}
        </div>

        {/* Poll Votes */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Vote size={18} className="text-primary-300" />
            <h2 className="font-semibold text-white">Poll Engagement</h2>
          </div>
          {pollData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pollData} layout="vertical">
                <XAxis type="number" tick={{ fill: axisNumber, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: axisTick, fontSize: 11 }} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="votes" fill={pollBarColor} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-12">No poll data yet</p>}
        </div>
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-300" />
            <h2 className="font-semibold text-white">Recent Activity Log</h2>
          </div>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start sm:items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white">
                  {log.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    <span className="font-medium">{log.user?.name}</span>
                    <span className="text-slate-400"> {log.action} </span>
                    <span className="text-slate-300">{log.entity}</span>
                  </p>
                  {log.details && <p className="text-xs text-slate-500 truncate">{log.details}</p>}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0 pt-0.5 sm:pt-0">
                  <Clock size={11} />
                  {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showBroadcastConfirm}
        title="Broadcast Notice"
        message="This will send the notice to all residents. Do you want to continue?"
        onConfirm={handleBroadcastNotice}
        onCancel={() => setShowBroadcastConfirm(false)}
        loading={broadcasting}
        danger={false}
      />
    </div>
  );
}
