import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, CheckCircle2, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Landing = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { login, loginWithTokens, user } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
            return;
        }

        // Handle Google OAuth callback
        const oauthStatus = searchParams.get('oauth');
        const oauthError = searchParams.get('error');

        if (oauthError) {
            const oauthErrorMessages = {
                account_blocked: 'Your account has been blocked.',
                google_not_configured: 'Google sign-in is not configured on the server yet. Please contact support or try email/password login.',
                google_auth_failed: 'Google authentication failed. Please try again.'
            };

            setError(oauthErrorMessages[oauthError] || 'Google authentication failed. Please try again.');
            setSearchParams({}, { replace: true });
            return;
        }

        if (oauthStatus === 'success') {
            setSearchParams({}, { replace: true });
            loginWithTokens()
                .then(() => navigate('/dashboard'))
                .catch(() => setError('Failed to complete Google sign-in.'));
        }
    }, [user, navigate, searchParams, setSearchParams, loginWithTokens]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        setNeedsVerification(false);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                const res = await api.post('/auth/register', formData);
                setSuccessMessage(res.data.message || 'Account created! Please check your email to verify your account.');
                setIsLogin(true);
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.needsVerification) {
                setNeedsVerification(true);
                setError(data.message);
            } else {
                setError(data?.message || 'Authentication failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        try {
            const res = await api.post('/auth/resend-verification', { email: formData.email });
            setSuccessMessage(res.data.message);
            setError('');
            setNeedsVerification(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification email.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Implement Google Login logic here
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-[#070810] text-white flex flex-col font-['Inter'] selection:bg-primary/30 overflow-x-hidden">
            {/* Background Aesthetic Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] -z-10" />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-24 lg:gap-48 px-6 py-24 max-w-[1400px] mx-auto w-full relative z-10">

                {/* LEFT SIDE: Hero Content */}
                <div className="flex-1 space-y-12 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-10"
                    >
                        <h1 className="text-7xl lg:text-[130px] font-black leading-[0.8] tracking-tighter">
                            Events, <br />
                            <span className="text-primary glow-text">Evolved.</span>
                        </h1>
                        <p className="text-2xl text-text-muted font-medium max-w-lg leading-relaxed opacity-60">
                            Master every detail with surgical precision and effortless elegance.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-md pt-8"
                    >
                        <div className="space-y-3">
                            <Sparkles className="text-primary" size={28} />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Orchestration</h3>
                            <p className="text-xs text-text-muted leading-relaxed">Next-gen event management engine.</p>
                        </div>
                        <div className="space-y-3">
                            <CheckCircle2 className="text-primary" size={28} />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Precision</h3>
                            <p className="text-xs text-text-muted leading-relaxed">Surgical accuracy in every detail.</p>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT SIDE: Auth Card */}
                <div className="flex-1 flex justify-center w-full max-w-[540px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: 20, filter: 'blur(20px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(20px)' }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white/[0.02] backdrop-blur-3xl p-12 md:p-16 py-20 rounded-[60px] w-full relative group shadow-none border-none"
                        >
                            <div className="mb-2">
                                <h2 className="text-4xl font-black mb-2 tracking-tighter leading-none">
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-text-muted text-lg font-medium opacity-40 italic">
                                    {isLogin ? 'Sign in to your dashboard.' : 'Start your journey with us.'}
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6"
                                >
                                    <div className="text-error text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4">
                                        <span className="w-8 h-px bg-error/40" />
                                        {error}
                                    </div>
                                    {needsVerification && (
                                        <button
                                            type="button"
                                            onClick={handleResendVerification}
                                            disabled={resendLoading}
                                            className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-light transition-colors underline underline-offset-4 decoration-primary/30"
                                        >
                                            {resendLoading ? 'Sending…' : 'Resend verification email'}
                                        </button>
                                    )}
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 text-success text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4"
                                >
                                    <span className="w-8 h-px bg-success/40" />
                                    {successMessage}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {!isLogin && (
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="bg-transparent border-none focus:ring-0 pl-0 h-16 text-lg font-medium transition-all w-full placeholder:text-text-muted/20"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
                                        <div className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-700 group-focus-within/input:w-full" />
                                    </div>
                                )}

                                <div className="relative group/input">
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-transparent border-none focus:ring-0 pl-0 h-16 text-lg font-medium transition-all w-full placeholder:text-text-muted/20"
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-700 group-focus-within/input:w-full" />
                                </div>

                                <div className="relative group/input">
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="bg-transparent border-none focus:ring-0 pl-0 h-16 text-lg font-medium transition-all w-full placeholder:text-text-muted/20"
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-700 group-focus-within/input:w-full" />
                                    {isLogin && (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forgot-password')}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 hover:text-primary transition-all"
                                        >
                                            Forgot?
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 text-xs font-black tracking-[0.4em] uppercase bg-primary hover:bg-primary-light transition-all rounded-full mt-8 active:scale-[0.97] flex items-center justify-center gap-4 border-none shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)]"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        isLogin ? 'Sign In' : 'Join Now'
                                    )}
                                </button>
                            </form>

                            <div className="my-16 flex items-center justify-center">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="p-6 bg-white/[0.03] rounded-full hover:bg-white/[0.08] transition-all active:scale-[0.9] text-text-muted hover:text-white border-none"
                                >
                                    <Chrome size={24} />
                                </button>
                            </div>

                            <p className="mt-12 text-center text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-40">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="text-primary hover:text-primary-light transition-colors underline underline-offset-8 decoration-primary/20"
                                >
                                    Continue with google account
                                </button>
                            </p>

                            <p className="mt-8 text-center text-xs text-text-muted/50">
                                {isLogin ? "New here?" : "Already have an account?"}{' '}
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); setNeedsVerification(false); }}
                                    className="text-primary font-bold hover:text-primary-light transition-colors underline underline-offset-4 decoration-primary/30"
                                >
                                    {isLogin ? 'Create an account' : 'Sign in'}
                                </button>
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="py-24 opacity-20">
                <div className="container mx-auto px-6 flex flex-col items-center gap-12">
                    <p className="text-[10px] font-black uppercase tracking-[2em] text-white/40">
                        EventMate
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
