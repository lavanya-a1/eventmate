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
        <div className="pt-6 pb-2 px-4 sticky top-0 z-50 w-full flex justify-center">
            <nav className="glass-card w-full max-w-[1200px] shadow-2xl border-white/5 relative">
                <div className="flex justify-between items-center w-full px-6 py-4">
                    {/* LEFT SIDE: Brand and Primary Nav */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center gap-2 group shrink-0">
                            <Calendar size={28} className="text-primary group-hover:scale-110 transition-all duration-300" />
                            <span className="text-xl font-bold gradient-text tracking-tight">EventMate</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-bold text-text-muted hover:text-white transition-colors">About</Link>
                            <Link to="/events" className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors">
                                <Compass size={18} />
                                Explore Events
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Auth and Profile */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-6">
                                <Link to="/my-bookings" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                                    <Ticket size={18} />
                                    My Bookings
                                </Link>
                                <div className="h-6 w-px bg-white/10 mx-2" />
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                            <User size={16} className="text-primary" />
                                        </div>
                                        <div className="flex flex-col items-start pr-1">
                                            <span className="text-sm font-bold leading-none">{user.name}</span>
                                            <span className="text-[10px] text-text-muted uppercase tracking-widest leading-none mt-1">{user.role}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-text-muted transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Profile Dropdown Menu */}
                                    <AnimatePresence>
                                        {showProfileMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full right-0 mt-3 w-56 glass-card border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50"
                                            >
                                                <div className="p-4 border-b border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                                            <User size={18} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{user.name}</p>
                                                            <p className="text-[10px] text-text-muted uppercase tracking-widest">{user.role}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="py-2">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors font-medium border-b border-white/5"
                                                        onClick={() => setShowProfileMenu(false)}
                                                    >
                                                        <User size={16} className="text-primary" />
                                                        View Profile
                                                    </Link>
                                                    <Link
                                                        to="/my-bookings"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors font-medium"
                                                        onClick={() => setShowProfileMenu(false)}
                                                    >
                                                        <Ticket size={16} className="text-secondary" />
                                                        My Bookings
                                                    </Link>
                                                    <div className="h-px bg-white/5 my-1" />
                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setShowProfileMenu(false);
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-error/10 hover:text-error transition-colors w-full text-left font-bold"
                                                    >
                                                        <LogOut size={16} />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-8">
                                <Link to="/login" className="text-sm font-bold text-text-muted hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm px-6 py-2.5">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
