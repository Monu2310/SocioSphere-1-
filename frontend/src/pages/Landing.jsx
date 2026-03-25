import { Link } from 'react-router-dom';
import { Building2, Users, Vote, Car, ShoppingBag, Sparkles, ArrowRight, Shield, Bell, BarChart3 } from 'lucide-react';

const features = [
  { icon: Users, title: 'Resident Management', desc: 'Manage flat owners, tenants, and their details from one place.' },
  { icon: Vote, title: 'Community Polls', desc: 'Run democratic polls for society decisions with real-time results.' },
  { icon: Car, title: 'Smart Parking', desc: 'Assign, track and manage parking slots for residents and visitors.' },
  { icon: ShoppingBag, title: 'Second-Hand Marketplace', desc: 'Buy and sell unused items within your society community.' },
  { icon: Sparkles, title: 'AI Insights', desc: 'Get intelligent summaries and analytics powered by AI.' },
  { icon: Bell, title: 'Notifications', desc: 'Broadcast announcements and stay updated on society events.' },
];

export default function Landing() {
  return (
    <div className="ambient-stage min-h-screen bg-app-gradient">
      <div className="ambient-lights" aria-hidden="true" />
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-dark-900/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 shadow-[0_0_28px_rgba(34,197,94,0.35)] flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">SocioSphere</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 sm:px-6 pt-20 pb-16 sm:pb-24 max-w-4xl mx-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-60 w-60 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-1.5 text-sm text-primary-400 mb-6">
          <Sparkles size={14} /> Smart Society Management Platform
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Manage Your Society{' '}
          <span className="text-primary-400">
            Smarter
          </span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          SocioSphere brings residents, admins, and community activities into one powerful platform — polls, parking, marketplace, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-8 py-4 rounded-2xl justify-center">
            Start Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-4 rounded-2xl justify-center">
            View Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-14 sm:mt-16 max-w-lg mx-auto">
          {[['500+', 'Societies'], ['50K+', 'Residents'], ['99.9%', 'Uptime']].map(([val, label]) => (
            <div key={label} className="glass-card motion-surface p-4">
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything Your Society Needs</h2>
          <p className="text-slate-400">A complete toolkit for modern residential communities</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card-hover motion-surface p-6 group">
              <div className="w-11 h-11 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Icon size={20} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 py-20 text-center">
        <div className="glass-card motion-surface max-w-2xl mx-auto p-8 sm:p-12 border-primary-500/20 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />
          <Shield size={40} className="text-primary-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Modernize Your Society?</h2>
          <p className="text-slate-400 mb-8">Join hundreds of housing societies across India.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 rounded-2xl inline-flex">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/10 text-slate-500 text-sm">
        © 2026 SocioSphere. Smart Society Management System.
      </footer>
    </div>
  );
}
