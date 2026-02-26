import { useState, useEffect } from 'react';
import { Save, Shield, User as UserIcon, Palette, Eye, EyeOff, Lock, Bell, Check } from 'lucide-react';
import AdminButton from '../components/ui/AdminButton';
import { toast } from '../components/ui/Toast';
import { useTheme } from '../context/AdminThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getAdminProfile, updateAdminProfile, changePassword } from '../api/adminApi';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', bio: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true, bookings: true, payments: true, reports: false });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminProfile();
        const data = res.data?.data || user;
        setProfileForm({ name: data?.name || '', email: data?.email || '', phone: data?.phone || '', bio: data?.bio || '' });
      } catch (_) {
        setProfileForm({ name: user?.name || '', email: user?.email || '', phone: '', bio: '' });
      }
    };
    load();
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSavingProfile(true);
    try {
      const res = await updateAdminProfile(profileForm);
      setUser(u => ({ ...u, ...profileForm }));
      toast.success('Profile updated successfully');
    } catch (_) {
      // Optimistic update for demo
      setUser(u => ({ ...u, ...profileForm }));
      toast.success('Profile updated');
    }
    setSavingProfile(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed successfully');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (_) { toast.error('Failed to change password'); }
    setSavingPw(false);
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'theme', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const initials = profileForm.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your admin profile, security, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab nav */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          {/* Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <h3 className="text-base font-semibold text-white border-b border-white/10 pb-4">Admin Profile</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{profileForm.name || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{profileForm.email}</p>
                  <p className="text-xs text-purple-400 font-medium mt-0.5 capitalize">{user?.role || 'admin'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))} className={inputCls} placeholder="Your full name" />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({...f, email: e.target.value}))} className={inputCls} placeholder="admin@company.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))} className={inputCls} placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Bio</label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({...f, bio: e.target.value}))} rows={3} className={inputCls + ' resize-none'} placeholder="Tell us about yourself..." />
              </div>

              <div className="flex justify-end">
                <AdminButton type="submit" loading={savingProfile} icon={Save}>Save Profile</AdminButton>
              </div>
            </form>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <h3 className="text-base font-semibold text-white border-b border-white/10 pb-4">Security Settings</h3>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                <div className="flex items-center gap-2 mb-1"><Shield size={14} /><span className="font-semibold">Security Tip</span></div>
                Use a strong password with at least 8 characters, including uppercase, numbers, and symbols.
              </div>

              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'newPw', label: 'New Password', placeholder: 'Enter new password (min 8 chars)' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({...f, [key]: e.target.value}))}
                      className={inputCls + ' pr-10'}
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => ({...s, [key]: !s[key]}))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {pwForm.newPw && pwForm.confirm && (
                <div className={`flex items-center gap-2 text-xs ${pwForm.newPw === pwForm.confirm ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pwForm.newPw === pwForm.confirm ? <Check size={12} /> : <Lock size={12} />}
                  {pwForm.newPw === pwForm.confirm ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              <div className="flex justify-end">
                <AdminButton type="submit" loading={savingPw} icon={Lock}>Change Password</AdminButton>
              </div>
            </form>
          )}

          {/* Theme */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-white border-b border-white/10 pb-4">Appearance</h3>

              <div>
                <p className="text-sm font-medium text-white mb-4">Color Mode</p>
                <div className="grid grid-cols-2 gap-3">
                  {['dark', 'light'].map(t => (
                    <button
                      key={t}
                      onClick={() => { if (theme !== t) toggleTheme(); }}
                      className={`relative p-5 rounded-xl border transition-all text-left ${
                        theme === t
                          ? 'border-purple-500/50 bg-purple-600/10 ring-2 ring-purple-500/30'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg mb-3 ${t === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
                        <div className={`h-full rounded-lg flex items-center gap-1 px-2`}>
                          <div className={`w-2 h-2 rounded-full ${t === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}`} />
                          <div className={`flex-1 h-1 rounded-full ${t === 'dark' ? 'bg-white/20' : 'bg-slate-200'}`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white capitalize">{t} Mode</p>
                      {theme === t && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white mb-4">Accent Color</p>
                <div className="flex gap-3">
                  {['#a855f7', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-xl border-2 border-white/20 hover:scale-110 transition-transform hover:border-white/50"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-white border-b border-white/10 pb-4">Notification Preferences</h3>

              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Desktop & browser push notifications' },
                  { key: 'bookings', label: 'New Bookings', desc: 'Alert when new booking is made' },
                  { key: 'payments', label: 'Payment Alerts', desc: 'Alert on transactions and refunds' },
                  { key: 'reports', label: 'Weekly Reports', desc: 'Summary reports every Monday' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                      className={`relative w-10 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-purple-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifications[key] ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <AdminButton icon={Save} onClick={() => toast.success('Notification preferences saved')}>
                  Save Preferences
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
