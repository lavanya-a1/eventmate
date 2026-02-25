import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Lock, CheckCircle2, AlertCircle,
    Loader2, LogOut, ShieldCheck, Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { name: form.name, email: form.email };
            if (form.newPassword) {
                payload.currentPassword = form.currentPassword;
                payload.newPassword = form.newPassword;
            }
            const res = await api.put('/auth/updatedetails', payload);
            setUser(res.data.data);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="animate-fade-in min-h-screen pb-20 relative overflow-hidden">
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10" />

            <div className="container mx-auto px-4 pt-52">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-12"
                    >
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter mb-2">
                                My <span className="gradient-text">Profile</span>
                            </h1>
                            <p className="text-text-muted font-medium">Manage your account details</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-error/10 hover:bg-error/20 text-error border border-error/20 font-bold transition-all text-sm"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </motion.div>

                    {/* Avatar Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-8 mb-6 flex items-center gap-6"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg shadow-primary/20">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{user.name}</h2>
                            <p className="text-text-muted font-medium">{user.email}</p>
                            {user.role && (
                                <span className="mt-2 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest">
                                    <ShieldCheck size={12} /> {user.role}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Message Banner */}
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 px-6 py-4 rounded-2xl flex items-center gap-3 font-bold border ${message.type === 'success'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-error/10 text-error border-error/20'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                            {message.text}
                        </motion.div>
                    )}

                    {/* Edit Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8"
                    >
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                            <Edit3 size={20} className="text-primary" /> Edit Details
                        </h3>

                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your full name"
                                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none rounded-2xl pl-12 pr-5 py-4 font-medium text-white placeholder:text-text-muted transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your@email.com"
                                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none rounded-2xl pl-12 pr-5 py-4 font-medium text-white placeholder:text-text-muted transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-6">
                                <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
                                    Change Password <span className="normal-case font-normal">(leave blank to keep current)</span>
                                </p>

                                {/* Current Password */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Current password"
                                            className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none rounded-2xl pl-12 pr-5 py-4 font-medium text-white placeholder:text-text-muted transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        placeholder="New password"
                                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none rounded-2xl pl-12 pr-5 py-4 font-medium text-white placeholder:text-text-muted transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 mt-2"
                            >
                                {saving ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={20} /> Save Changes</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
