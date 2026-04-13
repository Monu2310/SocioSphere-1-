import { createElement, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Vote,
  Car,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Shield,
  Bell,
  Lock,
  Zap,
  CheckCircle2,
  Smartphone,
  CircleDot,
  BrainCircuit,
  UserCog,
  ShieldCheck,
  Timer,
  Waves,
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Resident CRM', desc: 'Manage owners, tenants, and occupancy timelines from one command center.' },
  { icon: Vote, title: 'Digital Voting', desc: 'Run policy polls with transparent participation and instant result summaries.' },
  { icon: Car, title: 'Parking Intelligence', desc: 'Live slot maps, assignment workflows, and visitor parking controls.' },
  { icon: ShoppingBag, title: 'Community Marketplace', desc: 'Enable trusted buy/sell interactions between society residents.' },
  { icon: Bell, title: 'Broadcast + Alerts', desc: 'Push announcements, reminders, and urgent alerts in seconds.' },
  { icon: Sparkles, title: 'AI Operations', desc: 'Automated insight generation for engagement, maintenance, and trends.' },
];

const modules = [
  {
    icon: Lock,
    title: 'Secure-by-default infrastructure',
    desc: 'Role-based access, audit visibility, and reliable operation at scale.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first resident experience',
    desc: 'Designed for daily use on phones with fast flows and touch-friendly layouts.',
  },
  {
    icon: Zap,
    title: 'High-speed admin workflows',
    desc: 'Bulk actions, real-time updates, and smart defaults to reduce manual overhead.',
  },
];

const trustLine = ['ISO-Ready Security', '99.9% Platform Uptime', 'Role-based Access', 'Audit Activity Logs', 'Cloud Scale Ready'];

const demoViews = [
  {
    id: 'security',
    label: 'Security',
    title: 'Smart gate intelligence',
    metric: '42% faster entry clearance',
    bullets: ['Visitor pre-approval QR flows', 'Blacklist and watchlist detection', 'Gate event timeline with audit logs'],
  },
  {
    id: 'polls',
    label: 'Polls',
    title: 'Transparent community governance',
    metric: '3.1x higher participation',
    bullets: ['One-tap resident voting', 'Instant quorum and turnout view', 'AI summaries for committee decisions'],
  },
  {
    id: 'parking',
    label: 'Parking',
    title: 'Conflict-free parking allocation',
    metric: '68% fewer parking disputes',
    bullets: ['Slot assignment automation', 'Temporary visitor slot booking', 'Dispute resolution timeline'],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    title: 'Trusted internal commerce',
    metric: '2.7x listing conversion',
    bullets: ['Resident-verified listings only', 'In-app lead capture and follow-up', 'Admin moderation and policy guardrails'],
  },
];

const roleJourneys = [
  {
    id: 'resident',
    label: 'Resident',
    icon: Users,
    focus: 'Daily convenience and transparency',
    points: ['Approve visitors in 2 taps', 'Track complaints and SLAs live', 'Participate in voting with full clarity'],
  },
  {
    id: 'committee',
    label: 'Committee',
    icon: UserCog,
    focus: 'Governance with accountability',
    points: ['Broadcast and engagement analytics', 'Budget-aligned decision support', 'Action logs for every key operation'],
  },
  {
    id: 'security',
    label: 'Security Staff',
    icon: ShieldCheck,
    focus: 'Fast verification at the gate',
    points: ['Low-friction check-in workflow', 'Instant alerts for suspicious events', 'Shift-level performance tracking'],
  },
  {
    id: 'facility',
    label: 'Facility Manager',
    icon: Timer,
    focus: 'Operational speed and reliability',
    points: ['Maintenance queue prioritization', 'Vendor dispatch visibility', 'Recurring issue prediction with AI'],
  },
];

const compareRows = [
  {
    item: 'Resident communication',
    legacy: 'Broadcasts scattered in chat groups',
    sociosphere: 'Targeted announcements with delivery and acknowledgment stats',
  },
  {
    item: 'Voting and governance',
    legacy: 'Manual counting and disputed records',
    sociosphere: 'Tamper-evident digital votes and instant result dashboards',
  },
  {
    item: 'Complaint handling',
    legacy: 'No clear SLA, no ownership trail',
    sociosphere: 'Ticket lifecycle with SLA timers and escalation rules',
  },
  {
    item: 'Security operations',
    legacy: 'Paper logs and delayed verification',
    sociosphere: 'Real-time gate events, watchlists, and audit history',
  },
];

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState('security');
  const [activeRole, setActiveRole] = useState('resident');

  const currentDemo = useMemo(
    () => demoViews.find((view) => view.id === activeDemo) ?? demoViews[0],
    [activeDemo],
  );

  const currentRole = useMemo(
    () => roleJourneys.find((role) => role.id === activeRole) ?? roleJourneys[0],
    [activeRole],
  );

  return (
    <div className="ambient-stage min-h-screen landing-bg landing-theme">
      <div className="ambient-lights" aria-hidden="true" />

      <aside className="sticky-rail hidden xl:flex" aria-label="Quick actions">
        <Link to="/register" className="sticky-rail-primary">Book Demo</Link>
        <a href="#journeys" className="sticky-rail-secondary">Role Journeys</a>
        <a href="#compare" className="sticky-rail-secondary">Why Switch</a>
      </aside>

      {/* Nav */}
      <nav className="landing-nav flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 shadow-[0_0_28px_rgba(16,185,129,0.45)] flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">SocioSphere</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#modules" className="hover:text-white transition-colors">Modules</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="product" className="relative z-10 px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20 max-w-6xl mx-auto">
        <div className="hero-orb hero-orb-green w-36 h-36 -top-2 left-[8%] hero-delay-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan w-44 h-44 top-24 right-[4%] hero-delay-4" aria-hidden="true" />
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="hero-enter-right hero-delay-1">
            <div className="prism-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6 hero-enter-up hero-delay-2">
              <Sparkles size={14} /> Built for modern gated communities
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 hero-enter-up hero-delay-3">
              The operating system for
              <span className="text-cyan-300"> smarter societies</span>
            </h1>

            <p className="text-slate-300 text-lg max-w-xl mb-8 leading-relaxed hero-enter-up hero-delay-4">
              SocioSphere unifies residents, committee members, and daily operations into one premium platform for communication, governance, and secure community living.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 hero-enter-up hero-delay-5">
              <Link to="/register" className="btn-primary text-base px-8 py-4 rounded-2xl justify-center">
                Book a Live Demo <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-4 rounded-2xl justify-center">
                Explore Product
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl hero-enter-up hero-delay-5">
              {[['800+', 'Societies'], ['120K+', 'Residents'], ['99.9%', 'Availability']].map(([val, label]) => (
                <div key={label} className="prism-card-alt motion-surface p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold prism-metric">{val}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 hero-enter-left hero-delay-2">
            <div className="prism-card motion-surface hero-glow-frame p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">Society Operations Pulse</p>
                <span className="badge-green">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="prism-card-alt p-3">
                  <p className="text-xs text-slate-400">Open Maintenance Tickets</p>
                  <p className="text-2xl font-bold text-white mt-1">26</p>
                </div>
                <div className="prism-card-alt p-3">
                  <p className="text-xs text-slate-400">Pending Poll Votes</p>
                  <p className="text-2xl font-bold text-white mt-1">148</p>
                </div>
                <div className="prism-card-alt p-3">
                  <p className="text-xs text-slate-400">Visitor Check-ins Today</p>
                  <p className="text-2xl font-bold text-white mt-1">73</p>
                </div>
                <div className="prism-card-alt p-3">
                  <p className="text-xs text-slate-400">Marketplace Leads</p>
                  <p className="text-2xl font-bold text-white mt-1">41</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="prism-card-alt motion-surface p-4">
                <p className="text-sm font-semibold text-white mb-2">Resident Happiness Score</p>
                <p className="text-3xl font-bold text-amber-300">4.8/5</p>
                <p className="text-xs text-slate-400 mt-1">Based on support, engagement and response time.</p>
              </div>
              <div className="prism-card-alt motion-surface p-4">
                <p className="text-sm font-semibold text-white mb-2">Response SLA</p>
                <p className="text-3xl font-bold text-cyan-300">2h 14m</p>
                <p className="text-xs text-slate-400 mt-1">Average issue acknowledgment across communities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="relative z-10 px-4 sm:px-6 pb-8 sm:pb-12 max-w-6xl mx-auto">
        <div className="prism-card p-4 sm:p-5 hero-enter-up hero-delay-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {trustLine.map((item) => (
              <div key={item} className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={14} className="text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Interactive product walkthrough</h2>
          <p className="text-cyan-100/75">Tap any module to preview real workflow outcomes in seconds.</p>
        </div>

        <div className="prism-card p-5 sm:p-7">
          <div className="flex flex-wrap gap-2 mb-5">
            {demoViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveDemo(view.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeDemo === view.id ? 'bg-cyan-300 text-slate-900 shadow-[0_8px_24px_rgba(56,189,248,0.45)]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="prism-card-alt p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70 mb-2">Live Module Preview</p>
              <h3 className="text-2xl font-semibold text-white mb-2">{currentDemo.title}</h3>
              <p className="text-amber-200 font-semibold mb-4">{currentDemo.metric}</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {currentDemo.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-300 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="prism-card-alt p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70 mb-2">Experience Layer</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="prism-card p-3">
                  <p className="text-xs text-slate-400">Task Completion</p>
                  <p className="text-2xl font-bold text-cyan-200">96%</p>
                </div>
                <div className="prism-card p-3">
                  <p className="text-xs text-slate-400">Avg Steps</p>
                  <p className="text-2xl font-bold text-cyan-200">2.4</p>
                </div>
                <div className="prism-card p-3">
                  <p className="text-xs text-slate-400">Response Time</p>
                  <p className="text-2xl font-bold text-cyan-200">1.8s</p>
                </div>
                <div className="prism-card p-3">
                  <p className="text-xs text-slate-400">Satisfaction</p>
                  <p className="text-2xl font-bold text-cyan-200">4.8/5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Switch Comparison */}
      <section id="compare" className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Why communities switch to SocioSphere</h2>
          <p className="text-cyan-100/75">A clean break from chat-group chaos and spreadsheet operations.</p>
        </div>
        <div className="prism-card overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-950/35 text-xs sm:text-sm font-semibold text-slate-300">
            <div className="col-span-4 p-4">Operation</div>
            <div className="col-span-4 p-4 border-l border-white/10">Legacy stack</div>
            <div className="col-span-4 p-4 border-l border-white/10 text-cyan-200">SocioSphere</div>
          </div>
          {compareRows.map((row) => (
            <div key={row.item} className="grid grid-cols-12 border-t border-white/10 text-sm">
              <div className="col-span-4 p-4 text-white font-medium">{row.item}</div>
              <div className="col-span-4 p-4 text-slate-400 border-l border-white/10">{row.legacy}</div>
              <div className="col-span-4 p-4 text-slate-200 border-l border-white/10">{row.sociosphere}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Feature Teaser */}
      <section id="ai-copilot" className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
        <div className="prism-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200/80 mb-2">
                <BrainCircuit size={16} /> Signature AI Layer
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Committee Copilot</h3>
              <p className="text-slate-300/90 max-w-2xl">
                Instantly drafts notices, summarizes unresolved complaints, predicts maintenance hotspots, and recommends priority actions for the next 7 days.
              </p>
            </div>
            <Link to="/register" className="btn-primary whitespace-nowrap">Enable AI Copilot</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <div className="prism-card-alt p-4">
              <p className="text-xs text-slate-400">Notice drafting time</p>
              <p className="text-2xl font-bold text-cyan-200">-82%</p>
            </div>
            <div className="prism-card-alt p-4">
              <p className="text-xs text-slate-400">Escalation prediction</p>
              <p className="text-2xl font-bold text-cyan-200">91% accuracy</p>
            </div>
            <div className="prism-card-alt p-4">
              <p className="text-xs text-slate-400">Committee review time</p>
              <p className="text-2xl font-bold text-cyan-200">-57%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Journeys */}
      <section id="journeys" className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Role-based experience journeys</h2>
          <p className="text-cyan-100/75">Every stakeholder gets a dedicated path, not a one-size-fits-all dashboard.</p>
        </div>

        <div className="prism-card p-5 sm:p-7">
          <div className="flex flex-wrap gap-2 mb-5">
            {roleJourneys.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeRole === role.id ? 'bg-amber-300 text-slate-900 shadow-[0_8px_24px_rgba(251,191,36,0.35)]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div className="prism-card-alt p-5">
            <div className="flex items-start gap-3 mb-3">
              {createElement(currentRole.icon, { size: 22, className: 'text-amber-200 mt-1' })}
              <div>
                <h3 className="text-xl font-semibold text-white">{currentRole.label} Journey</h3>
                <p className="text-cyan-100/80">{currentRole.focus}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {currentRole.points.map((point) => (
                <div key={point} className="prism-card p-3 text-sm text-slate-200">{point}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Signature */}
      <section className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
        <div className="prism-card p-6 sm:p-8">
          <div className="flex items-center gap-2 text-cyan-200 mb-3">
            <Waves size={16} />
            <span className="text-xs uppercase tracking-[0.2em]">Brand Signature Layer</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">Calm control for vibrant communities</h3>
          <div className="flex flex-wrap gap-2">
            {['Signal over noise', 'Design for trust', 'Speed with accountability', 'Community-first automation'].map((line) => (
              <span key={line} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm prism-chip">
                <Sparkles size={13} /> {line}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12 hero-enter-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Everything your committee needs, in one place</h2>
          <p className="text-cyan-100/75">Purpose-built modules that work together as one connected ecosystem</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="prism-card motion-surface p-6 group">
              <div className="w-11 h-11 rounded-xl bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center mb-4 group-hover:bg-cyan-300/20 transition-colors">
                {createElement(icon, { size: 20, className: 'text-cyan-200' })}
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-300/85 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Modules */}
      <section id="modules" className="relative z-10 px-4 sm:px-6 py-4 sm:py-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-5">
          {modules.map(({ icon, title, desc }, index) => (
            <div key={title} className={`prism-card-alt motion-surface p-6 hero-enter-up ${index === 0 ? 'hero-delay-2' : index === 1 ? 'hero-delay-3' : 'hero-delay-4'}`}>
              <div className="w-11 h-11 rounded-xl bg-amber-300/10 border border-amber-200/25 flex items-center justify-center mb-4">
                {createElement(icon, { size: 20, className: 'text-amber-200' })}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-300/85 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="security" className="relative z-10 px-4 sm:px-6 py-20 text-center">
        <div className="prism-card motion-surface hero-glow-frame hero-enter-up max-w-3xl mx-auto p-8 sm:p-12 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl" />
          <Shield size={42} className="text-cyan-200 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Launch a smarter community experience</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Bring security, communication, and society operations into one high-performance platform your residents actually enjoy using.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-10 py-4 rounded-2xl inline-flex">
              Start with SocioSphere <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-10 py-4 rounded-2xl inline-flex">
              View Dashboard Preview
            </Link>
          </div>

          <div id="pricing" className="mt-8 text-xs text-slate-400 flex items-center justify-center gap-2">
            <CircleDot size={12} className="text-amber-300" />
            Transparent pricing available for societies of every size
            <CircleDot size={12} className="text-amber-300" />
            Enterprise onboarding support
          </div>
        </div>
      </section>

      {/* Secondary Footer Nav */}
      <section className="relative z-10 px-4 sm:px-6 pb-10 max-w-6xl mx-auto">
        <div className="prism-card-alt p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-300">
          <div className="font-medium">SocioSphere for Apartments, Villas and Township Communities</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Security</span>
            <span>Operations</span>
            <span>Community</span>
            <span>Insights</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/10 text-slate-500 text-sm">
        © 2026 SocioSphere. Smart Society Management System.
      </footer>
    </div>
  );
}
