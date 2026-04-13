import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Home, Lock, Camera } from 'lucide-react';
import { Spinner } from '../../components/common';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, flatNumber: user?.flatNumber },
  });

  const { register: reg2, handleSubmit: sub2, reset: reset2, formState: { errors: err2 } } = useForm();

  const updateProfile = async (data) => {
    setSaving(true);
    try {
      await authService.updateProfile(data);
      await refreshUser();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      reset2();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar + Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary-600 shadow-[0_0_28px_rgba(56,189,248,0.35)] flex items-center justify-center text-3xl font-bold text-white">
              {user?.name?.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center hover:bg-primary-500 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
            <p className="text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={user?.role === 'ADMIN' ? 'badge-purple' : 'badge-green'}>
                {user?.role}
              </span>
              {user?.flatNumber && <span className="badge-blue">{user.flatNumber}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
        {['profile', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {tab === 'profile' ? '👤 Profile Info' : '🔒 Security'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-5">Personal Information</h3>
          <form onSubmit={handleSubmit(updateProfile)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3.5 text-slate-400" />
                <input {...register('name', { required: true })} className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3.5 text-slate-400" />
                <input value={user?.email} disabled className="input-field pl-9 opacity-50 cursor-not-allowed" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Flat Number</label>
                <div className="relative">
                  <Home size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input {...register('flatNumber')} className="input-field pl-9" placeholder="B-101" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input {...register('phone')} className="input-field pl-9" placeholder="+91-9876543210" />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <><Spinner size="sm" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-5">Change Password</h3>
          <form onSubmit={sub2(changePassword)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Current Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3.5 text-slate-400" />
                <input {...reg2('currentPassword', { required: true })} type="password" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3.5 text-slate-400" />
                <input {...reg2('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field pl-9" />
              </div>
              {err2.newPassword && <p className="text-red-400 text-xs mt-1">{err2.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3.5 text-slate-400" />
                <input {...reg2('confirmPassword', { required: true })} type="password" className="input-field pl-9" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <><Spinner size="sm" /> Saving...</> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
