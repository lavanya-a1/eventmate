import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, History, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApi, useMutation } from '../hooks/useApi';
import { getProfile, updateProfile, changePassword } from '../api/user';
import { getMyBookings } from '../api/bookings';

const InputField = ({ label, type = 'text', value, onChange, placeholder, disabled }) => (
    <div>
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-[#070713] border border-white/[0.07] rounded-xl text-sm text-white
                       placeholder-slate-600 focus:outline-none focus:border-primary-500/50 disabled:opacity-50" />
    </div>
);

const statusVariant = (booking) => {
    if (booking.status === 'cancelled') return 'text-red-400';
    if (booking.status === 'pending')   return 'text-yellow-400';
    const past = new Date(booking.event?.date) < new Date();
    return past ? 'text-emerald-400' : 'text-primary-400';
};

const statusLabel = (booking) => {
    if (booking.status === 'cancelled') return 'Cancelled';
    if (booking.status === 'pending')   return 'Pending';
    return new Date(booking.event?.date) < new Date() ? 'Completed' : 'Upcoming';
};

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('personal');
    const { data: profileData, loading: loadingProfile } = useApi(getProfile);
    const { data: bookingsData, loading: loadingBookings } = useApi(getMyBookings);

    const { execute: saveProfile, loading: savingProfile, error: saveError } = useMutation(updateProfile);
    const { execute: savePw,     loading: savingPw,      error: pwError    } = useMutation(changePassword);

    const [name,  setName]  = useState('');
    const [email, setEmail] = useState('');
    const [profileMsg, setProfileMsg] = useState(null); // {type: 'success'|'error', text}

    const [curPw,  setCurPw]  = useState('');
    const [newPw,  setNewPw]  = useState('');
    const [cnfPw,  setCnfPw]  = useState('');
    const [pwMsg,  setPwMsg]  = useState(null);

    useEffect(() => {
        if (profileData?.data) {
            setName(profileData.data.name || '');
            setEmail(profileData.data.email || '');
        }
    }, [profileData]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const res = await saveProfile({ name, email });
        if (res) {
            setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
            setTimeout(() => setProfileMsg(null), 3500);
        } else {
            setProfileMsg({ type: 'error', text: saveError || 'Failed to save changes' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPw !== cnfPw) {
            setPwMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (newPw.length < 6) {
            setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        const res = await savePw({ currentPassword: curPw, newPassword: newPw });
        if (res) {
            setPwMsg({ type: 'success', text: 'Password changed successfully' });
            setCurPw(''); setNewPw(''); setCnfPw('');
            setTimeout(() => setPwMsg(null), 3500);
        } else {
            setPwMsg({ type: 'error', text: pwError || 'Failed to change password' });
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security',      icon: Shield },
        { id: 'history',  label: 'Booking History', icon: History },
    ];

    const bookings = bookingsData?.data || [];

    const Msg = ({ msg }) => msg ? (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 border
            ${msg.type === 'success'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
            {msg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {msg.text}
        </div>
    ) : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account settings</p>
            </div>

            {/* Profile header */}
            <div className="bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600
                                flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {name ? name.charAt(0).toUpperCase() : <User size={24} />}
                </div>
                <div>
                    <p className="text-base font-semibold text-white">{name || '—'}</p>
                    <p className="text-slate-500 text-sm">{email || '—'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-1.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm
                                    font-medium transition-all
                                    ${activeTab === id
                                        ? 'bg-primary-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'personal' && (
                <div className="bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-6 space-y-5">
                    <Msg msg={profileMsg} />
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <InputField label="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="Your name" disabled={loadingProfile} />
                        <InputField label="Email Address" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com" disabled={loadingProfile} />
                        <button type="submit" disabled={savingProfile || loadingProfile}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600
                                       hover:bg-primary-500 text-white text-sm font-medium
                                       disabled:opacity-50 transition-colors">
                            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            Save Changes
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Lock size={16} className="text-primary-400" />
                        <h2 className="text-base font-semibold text-white">Change Password</h2>
                    </div>
                    <Msg msg={pwMsg} />
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <InputField label="Current Password" type="password" value={curPw}
                            onChange={(e) => setCurPw(e.target.value)} placeholder="••••••••" />
                        <InputField label="New Password" type="password" value={newPw}
                            onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
                        <InputField label="Confirm New Password" type="password" value={cnfPw}
                            onChange={(e) => setCnfPw(e.target.value)} placeholder="••••••••" />
                        <button type="submit" disabled={savingPw || !curPw || !newPw || !cnfPw}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600
                                       hover:bg-primary-500 text-white text-sm font-medium
                                       disabled:opacity-50 transition-colors">
                            {savingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                            Update Password
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-[#0d0e1a] border border-white/[0.07] rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-semibold text-white">Booking History</h2>
                    {loadingBookings && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
                            <Loader2 size={16} className="animate-spin" /> Loading…
                        </div>
                    )}
                    {!loadingBookings && bookings.length === 0 && (
                        <p className="text-slate-500 text-sm py-6 text-center">No bookings yet</p>
                    )}
                    <div className="space-y-2">
                        {bookings.map((b) => (
                            <div key={b._id}
                                className="flex items-center justify-between px-4 py-3 rounded-xl
                                           bg-white/[0.025] border border-white/[0.04] gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{b.event?.title || 'Event'}</p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">{formatDate(b.event?.date)}</p>
                                </div>
                                <span className={`text-xs font-semibold shrink-0 ${statusVariant(b)}`}>
                                    {statusLabel(b)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
