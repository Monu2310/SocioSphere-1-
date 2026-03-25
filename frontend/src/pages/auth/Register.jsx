import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Building2, Eye, EyeOff, Mail, Lock, User, Phone, Home } from 'lucide-react';
import { Spinner } from '../../components/common';
import toast from 'react-hot-toast';

export default function Register() {
  const { register: signup, loading } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await signup(data);
      toast.success(`Welcome to SocioSphere, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join SocioSphere</h1>
          <p className="text-slate-400 mt-1 text-sm">Create your resident account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="input-field pl-10"
                  placeholder="Rahul Sharma"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  className="input-field pl-10"
                  placeholder="rahul@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Flat & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Flat No.</label>
                <div className="relative">
                  <Home size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input {...register('flatNumber')} className="input-field pl-10" placeholder="B-101" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input {...register('phone')} className="input-field pl-10" placeholder="+91-9876543210" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })}
                  className="input-field pl-10 pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
