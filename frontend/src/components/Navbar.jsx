import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, Ticket, Compass, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-bg/80 backdrop-blur-md">
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-all">
                        <Calendar size={22} className="text-primary" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">EventMate</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-10">
                    {user ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all"
                            >
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-primary" />
                                </div>
                                <span className="text-sm font-bold">{user?.name?.split(' ')[0] || 'User'}</span>
                                <ChevronDown size={14} className={`text-text-muted transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-48 bg-surface border border-theme-strong shadow-2xl rounded-2xl overflow-hidden"
                                    >
                                        <div className="py-2">
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-all">
                                                <User size={16} /> Profile
                                            </Link>
                                            <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-all">
                                                <Ticket size={16} /> Bookings
                                            </Link>
                                            <div className="h-px bg-white/5 my-1" />
                                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 w-full text-left font-bold transition-all">
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-10">
                            <Link to="/login" className="text-sm font-bold text-text-muted hover:text-white transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary py-2.5 px-6 rounded-xl hover:scale-105 transition-all active:scale-95">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle (Simplified for now) */}
                <button className="md:hidden p-2 text-text-muted hover:text-white">
                    <Compass size={24} />
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
