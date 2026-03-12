import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';
import api from '../api/axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('form'); // form | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No reset token provided.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            setStatus('success');
            setMessage(res.data.message);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Password reset failed.');
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
                className="bg-white/[0.02] backdrop-blur-3xl p-12 md:p-16 rounded-[40px] max-w-md w-full text-center space-y-6"
            >
                {status === 'success' && (
                    <>
                        <CheckCircle2 className="mx-auto text-green-400" size={48} />
                        <h2 className="text-2xl font-bold">Password Reset!</h2>
                        <p className="text-text-muted text-sm">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-8 py-3 bg-primary hover:bg-primary-light text-xs font-black uppercase tracking-[0.3em] rounded-full transition-all"
                        >
                            Sign In
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="mx-auto text-red-400" size={48} />
                        <h2 className="text-2xl font-bold">Reset Failed</h2>
                        <p className="text-text-muted text-sm">{message}</p>
                        <Link
                            to="/forgot-password"
                            className="inline-block mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-[0.3em] rounded-full transition-all"
                        >
                            Try Again
                        </Link>
                    </>
                )}

                {status === 'form' && (
                    <>
                        <div>
                            <Lock className="mx-auto text-primary mb-4" size={40} />
                            <h2 className="text-3xl font-black tracking-tighter">New Password</h2>
                            <p className="text-text-muted text-sm mt-2 opacity-60">
                                Enter your new password below.
                            </p>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-error text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4"
                            >
                                <span className="w-8 h-px bg-error/40" />
                                {message}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="relative group/input">
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 pl-0 h-16 text-lg font-medium transition-all w-full placeholder:text-text-muted/20"
                                />
                                <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-700 group-focus-within/input:w-full" />
                            </div>

                            <div className="relative group/input">
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
