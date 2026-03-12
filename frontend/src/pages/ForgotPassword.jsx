import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070810] text-white flex items-center justify-center px-6 font-['Inter']">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] backdrop-blur-3xl p-12 md:p-16 rounded-[40px] max-w-md w-full space-y-6"
            >
                {sent ? (
                    <div className="text-center space-y-6">
                        <CheckCircle2 className="mx-auto text-green-400" size={48} />
                        <h2 className="text-2xl font-bold">Check Your Email</h2>
                        <p className="text-text-muted text-sm">
                            If an account exists for <span className="text-white font-semibold">{email}</span>, we've sent a password reset link.
                        </p>
                        <Link
                            to="/"
                            className="inline-block mt-4 px-8 py-3 bg-primary hover:bg-primary-light text-xs font-black uppercase tracking-[0.3em] rounded-full transition-all"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter">Forgot Password</h2>
                            <p className="text-text-muted text-sm mt-2 opacity-60">
                                Enter your email and we'll send you a reset link.
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-error text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4"
                            >
                                <span className="w-8 h-px bg-error/40" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group/input">
                                <input
                                    type="email"
                                    required
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 pl-0 h-16 text-lg font-medium transition-all w-full placeholder:text-text-muted/20"
                                />
                                <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-700 group-focus-within/input:w-full" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 text-xs font-black tracking-[0.4em] uppercase bg-primary hover:bg-primary-light transition-all rounded-full flex items-center justify-center gap-4 border-none shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)]"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>

                        <Link
                            to="/"
                            className="flex items-center gap-2 text-xs text-text-muted/50 hover:text-primary transition-colors font-bold uppercase tracking-[0.2em]"
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
