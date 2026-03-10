import { useState, useEffect } from 'react';
import { Save, Shield, User as UserIcon, Palette, Eye, EyeOff, Lock, Check, Sun, Moon, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../admin/components/ui/Toast';
import { useTheme } from '../../admin/context/AdminThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../api/user';

const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm';
const readonlyCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-sm cursor-not-allowed select-none';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

export default function OrganizerSettings() {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const load = async () => {
      setProfileLoading(true);
      try {
        const data = await getProfile();
        const d = data?.data || data;
        setProfileForm({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await updateProfile({ name: profileForm.name, phone: profileForm.phone });
      const updated = data?.data || data;
      if (updated) {
        setProfileForm(f => ({ ...f, name: updated.name || f.name, phone: updated.phone || '' }));
        setUser(u => ({ ...u, name: updated.name }));
      }
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = profileForm.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'OR';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="max-w-5xl space-y-1">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your profile, security, and appearance</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={15} className={activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : ''} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {/* Profile */}
          {activeTab === 'profile' && (
            profileLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 size={22} className="animate-spin mr-2" /> Loading profile…
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-5">
                <SectionCard title="Identity" description="Your account info. Email cannot be changed here.">
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shrink-0 select-none">
                      {initials}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileForm.name || '—'}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{profileForm.email}</p>
                      <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold capitalize">
                        {user?.role || 'organizer'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Your full name" required />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-500">(read-only)</span></label>
                      <input type="email" value={profileForm.email} readOnly className={readonlyCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </SectionCard>
                <div className="flex justify-end">
                  <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-colors">
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Changes
                  </button>
                </div>
              </form>
            )
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <SectionCard title="Change Password" description="Use a strong password with at least 8 characters.">
                <div className="flex items-start gap-3 mb-6 p-3.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <AlertCircle size={15} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">After changing your password, you may need to re-authenticate on other devices.</p>
                </div>
                <div className="space-y-5">
                  {[
                    { key: 'current', label: 'Current Password', placeholder: 'Enter your current password' },
                    { key: 'newPw', label: 'New Password', placeholder: 'At least 8 characters' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat your new password' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <div className="relative">
                        <input
                          type={showPw[key] ? 'text' : 'password'}
                          value={pwForm[key]}
                          onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                          className={inputCls + ' pr-10'}
                          placeholder={placeholder}
                          required
                        />
                        <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                          {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwForm.newPw && pwForm.confirm && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md ${
                      pwForm.newPw === pwForm.confirm
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {pwForm.newPw === pwForm.confirm ? <Check size={12} /> : <Lock size={12} />}
                      {pwForm.newPw === pwForm.confirm ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>
              </SectionCard>
              <div className="flex justify-end">
                <button type="submit" disabled={savingPw} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-colors">
                  {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <SectionCard title="Color Mode" description="Choose how the panel looks. Saved locally in your browser.">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: Sun, preview: 'bg-gray-50 border-gray-200' },
                  { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-slate-900 border-slate-700' },
                ].map(({ id, label, icon: Icon, preview }) => {
                  const active = theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { if (theme !== id) toggleTheme(); }}
                      className={`relative flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-600/10'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg border ${preview} flex items-center justify-center shrink-0`}>
                        <Icon size={16} className={id === 'dark' ? 'text-slate-300' : 'text-gray-600'} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-white'}`}>{label}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{id === 'light' ? 'Default' : 'Easy on the eyes'}</p>
                      </div>
                      {active && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
