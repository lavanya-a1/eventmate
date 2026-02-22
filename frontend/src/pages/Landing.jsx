import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Zap, ShieldCheck, Users, Globe, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Landing = () => {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Use effect for redirection and path sync
    useEffect(() => {
        if (user) {
            navigate('/events');
        }
    }, [user, navigate]);

    useEffect(() => {
        setIsLogin(location.pathname !== '/register');
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate('/events');
            } else {
                await api.post('/auth/register', formData);
                // After registration, automatically log in
                await login(formData.email, formData.password);
                navigate('/events');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const features = [
        { icon: <Zap size={18} className="text-primary" />, text: "Real-time ticket booking" },
        { icon: <ShieldCheck size={18} className="text-secondary" />, text: "Secure transactions" },
        { icon: <Globe size={18} className="text-accent" />, text: "Global event reach" }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row animate-fade-in">
            {/* LEFT SIDE: About EventMate */}
            <div className="hidden md:flex flex-1 bg-surface/50 relative overflow-hidden flex-col justify-center px-12 lg:px-20">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full" />

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 space-y-8"
                >
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Users size={32} className="text-white" />
                    </div>

                    <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none">
                        Manage events with <br />
                        <span className="gradient-text">Absolute Ease.</span>
                    </h1>

                    <p className="text-xl text-text-muted max-w-lg font-medium leading-relaxed">
                        The all-in-one platform for creating, discovering, and booking events.
                        Join thousands of organizers and attendees today.
                    </p>

                    <div className="space-y-4 pt-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm font-bold tracking-wide">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                    {f.icon}
                                </div>
                                {f.text}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute bottom-20 left-20 w-32 h-32 border border-white/5 rounded-full" />
                <div className="absolute top-20 right-20 w-64 h-64 border border-white/5 rounded-full" />
            </div>

            {/* RIGHT SIDE: Auth Forms */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                <div className="md:hidden absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full -z-10" />

                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[420px]"
                >
                    <div className="glass-card p-8 md:p-10 shadow-2xl relative overflow-hidden">
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-black mb-3">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-text-muted font-medium">
                                {isLogin
                                    ? 'Log in to access your personalized dashboard'
                                    : 'Join our community of event enthusiasts'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3 text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted px-1 flex items-center gap-2">
                                        <User size={14} className="text-primary" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Alex Johnson"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="bg-surface/50 border-white/5 focus:border-primary/50 transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted px-1 flex items-center gap-2">
                                    <Mail size={14} className="text-primary" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-surface/50 border-white/5 focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-bold text-text-muted flex items-center gap-2">
                                        <Lock size={14} className="text-primary" />
                                        Password
                                    </label>
                                    {isLogin && (
                                        <button type="button" className="text-xs font-bold text-primary hover:underline">
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="bg-surface/50 border-white/5 focus:border-primary/50 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                            >
                                {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {isLogin ? 'Sign In Now' : 'Create Free Account'}
                                {!loading && <ChevronRight size={20} />}
                            </button>
                        </form>

                        <div className="relative my-10 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <span className="relative bg-surface px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                                OR CONTINUE WITH
                            </span>
                        </div>

                        <button className="w-full google-btn mb-10 border border-white/5 hover:bg-white/5 transition-all">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            Continue with Google
                        </button>

                        <p className="text-center text-sm text-text-muted font-medium">
                            {isLogin
                                ? "Don't have an account? "
                                : "Already have an account? "}
                            <Link
                                to={isLogin ? '/register' : '/login'}
                                className="text-primary font-black hover:underline transition-colors"
                            >
                                {isLogin ? 'Create Account' : 'Sign In'}
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Landing;
