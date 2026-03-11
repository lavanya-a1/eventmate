import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import api from '../api/axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        api.get(`/auth/verify-email/${token}`)
            .then((res) => {
                setStatus('success');
                setMessage(res.data.message);
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed.');
            });
    }, [token]);

    return (
        <div className="min-h-screen bg-[#070810] text-white flex items-center justify-center px-6 font-['Inter']">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] backdrop-blur-3xl p-12 md:p-16 rounded-[40px] max-w-md w-full text-center space-y-6"
            >
                {status === 'verifying' && (
                    <>
                        <Loader2 className="mx-auto text-primary animate-spin" size={48} />
                        <h2 className="text-2xl font-bold">Verifying your email…</h2>
                        <p className="text-text-muted text-sm">Please wait a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="mx-auto text-green-400" size={48} />
                        <h2 className="text-2xl font-bold">Email Verified!</h2>
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
                        <h2 className="text-2xl font-bold">Verification Failed</h2>
                        <p className="text-text-muted text-sm">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-[0.3em] rounded-full transition-all"
                        >
                            Back to Home
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
