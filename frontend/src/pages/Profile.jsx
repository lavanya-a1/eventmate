import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const Profile = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Update profile API call
            const res = await api.put('/auth/profile', {
                name: formData.name,
                email: formData.email
            });

            // If password is being changed
            if (formData.currentPassword && formData.newPassword) {
                await api.put('/auth/password', {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
            }

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            // Update context if needed (re-login or fetch user)
            // login(formData.email, ...) - would need password which we don't have here.
            // Better to have a 'refreshUser' in AuthContext.
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || 'Update failed. Check your data.',
                type: 'error'
            });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <header className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-2">Account Settings</h1>
                <p className="text-text-muted font-medium">Manage your profile information and security.</p>
            </header>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-bold border ${message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <Shield size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Quick Info */}
                <div className="space-y-8">
                    <div className="glass-card p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-8 -mt-8" />
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30 mx-auto">
                                <User size={48} className="text-primary" />
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-surface border border-white/10 rounded-full text-text-muted hover:text-white transition-all shadow-lg">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                        <p className="text-text-muted text-sm font-medium uppercase tracking-widest">{user?.role}</p>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Mail size={16} />
                            </div>
                            <div className="truncate">
                                <p className="text-xs text-text-muted uppercase tracking-tighter font-bold">Primary Email</p>
                                <p className="truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                <Shield size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-tighter font-bold">Member Status</p>
                                <p>Verified {user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleUpdateProfile} className="glass-card p-8 md:p-10 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User size={20} className="text-primary" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted px-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Alex Johnson"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted px-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Lock size={20} className="text-secondary" />
                                Change Password
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted px-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="bg-surface/50 border-white/5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted px-1">New Password</label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="Leave blank to keep current"
                                        className="bg-surface/50 border-white/5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary px-8 py-4 flex items-center gap-2 font-bold"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Save All Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
