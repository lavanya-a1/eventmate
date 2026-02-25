import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-4 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[380px]"
            >
                <div className="glass-card p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black gradient-text mb-3">Welcome Back</h1>
                        <p className="text-text-muted font-medium">Log in to manage your experiences.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1 flex items-center gap-2">
                                <Mail size={14} className="text-primary" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text ml-1 flex items-center gap-2">
                                <Lock size={14} className="text-primary" />
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In Now'}
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
                        Log in with Google
                    </button>

                    <p className="text-center text-sm text-text-muted">
                        Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
