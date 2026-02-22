import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Zap, Headphones, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-4 animate-fade-in relative overflow-hidden">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[380px]"
            >
                <div className="glass-card p-8 shadow-2xl relative">
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <ArrowRight size={24} className="text-primary group-hover:-translate-x-1 transition-transform rotate-180" />
                            <span className="text-sm font-bold text-text-muted">Back to gallery</span>
                        </Link>
                        <h1 className="text-4xl font-black gradient-text mb-3">Create account</h1>
                        <p className="text-text-muted font-medium">Start your journey with EventMate today.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1 flex items-center gap-2">
                                <User size={14} className="text-primary" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Alex Johnson"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1 flex items-center gap-2">
                                <Mail size={14} className="text-primary" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1 flex items-center gap-2">
                                <Lock size={14} className="text-primary" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 mt-4"
                        >
                            {loading ? "Creating..." : "Create Free Account"}
                            <ArrowRight size={20} className="ml-2" />
                        </button>
                    </form>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <span className="relative bg-[#161b2c] px-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            OR CONTINUE WITH
                        </span>
                    </div>

                    <button className="w-full google-btn mb-8">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        Sign up with Google
                    </button>

                    <p className="text-center text-sm text-text-muted">
                        Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </motion.div>

            {/* Footer Features */}
            <div className="max-w-4xl mx-auto w-full px-4 pt-16 flex justify-around opacity-40">
                <div className="flex flex-col items-center gap-2">
                    <Shield size={20} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Data</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Zap size={20} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fast Setup</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Headphones size={20} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">24/7 Priority Support</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
