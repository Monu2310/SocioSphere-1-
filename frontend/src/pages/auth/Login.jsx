import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Building2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Spinner } from '../../components/common';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@sociosphere.com');
      setValue('password', 'admin123');
    } else {
      setValue('email', 'rahul@example.com');
      setValue('password', 'resident123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_28px_rgba(56,189,248,0.35)]">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to SocioSphere</p>
        </div>

        {/* Demo credentials */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => fillDemo('admin')} className="flex-1 text-xs bg-primary-500/20 border border-primary-500/30 text-primary-300 py-2 rounded-xl hover:bg-primary-500/30 transition-colors">
            ⚡ Demo Admin
          </button>
          <button onClick={() => fillDemo('resident')} className="flex-1 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-200 py-2 rounded-xl hover:bg-amber-500/30 transition-colors">
            🏠 Demo Resident
          </button>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  {...register('email', { required: 'Email is required' })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  className="input-field pl-10 pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            New to SocioSphere?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
