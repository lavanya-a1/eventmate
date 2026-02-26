import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bell, Search, User, Moon, Sun, Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAsRead } from '../../api/notifications';

const navItems = [
    { label: 'Dashboard',  path: '/dashboard' },
    { label: 'Browse',     path: '/browse' },
    { label: 'Bookings',   path: '/bookings' },
    { label: 'Tickets',    path: '/tickets' },
    { label: 'Alerts',     path: '/notifications' },
    { label: 'Feedback',   path: '/feedback' },
    { label: 'Profile',    path: '/profile' },
];

export default function TopNavbar({
    showSearchModal,
    setShowSearchModal,
    showNotifications,
    setShowNotifications,
    showProfileMenu,
    setShowProfileMenu,
    isDarkMode,
    setIsDarkMode,
}) {
    const { user, logout } = useAuth();
    const navigate              = useNavigate();
    const searchInputRef  = useRef(null);
    const profileMenuRef  = useRef(null);
    const notificationRef = useRef(null);
    const mobileMenuRef   = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery,    setSearchQuery]    = useState('');
    const [apiNotifications, setApiNotifications] = useState([]);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await getNotifications();
            const raw = Array.isArray(res?.data) ? res.data : [];
            setApiNotifications(raw);
        } catch { /* ignore – show empty */ }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // Refresh when dropdown opens
    useEffect(() => {
        if (showNotifications) fetchNotifications();
    }, [showNotifications, fetchNotifications]);

    const unreadCount = apiNotifications.filter((n) => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
                setShowProfileMenu(false);
            if (notificationRef.current && !notificationRef.current.contains(e.target))
                setShowNotifications(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target))
                setMobileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowProfileMenu, setShowNotifications]);

    useEffect(() => {
        if (showSearchModal && searchInputRef.current) searchInputRef.current.focus();
    }, [showSearchModal]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setShowSearchModal(false);
            setSearchQuery('');
            navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleThemeToggle = useCallback(() => {
        setIsDarkMode((prev) => !prev);
    }, [setIsDarkMode]);

    const notifications = apiNotifications.slice(0, 5);

    return (
        <>
        {/* ── Navbar ────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 shrink-0 bg-[#0a0b14] border-b border-white/[0.06]">

            {/* Top row: logo + right controls */}
            <div className="flex items-center justify-between px-6 h-14 gap-4">

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-600
                                    flex items-center justify-center shadow-md">
                        <span className="font-black text-white text-xs tracking-tight italic">EM</span>
                    </div>
                    <span className="font-bold text-base text-white hidden sm:block tracking-tight">EventMate</span>
                </Link>

                {/* Right controls */}
                <div className="flex items-center gap-1">

                    {/* Search */}
                    <button onClick={() => setShowSearchModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400
                                   hover:text-white hover:bg-white/5 transition-all text-sm"
                        aria-label="Search">
                        <Search size={15} />
                        <span className="hidden md:block text-sm">Search</span>
                    </button>

                    {/* Theme */}
                    <button onClick={handleThemeToggle}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        aria-label="Toggle theme">
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            aria-label="Notifications">
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-primary-500 rounded-full
                                                 text-[9px] font-bold text-white flex items-center justify-center px-[2px]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-1.5 w-80 bg-[#0f1120] border border-white/10
                                            rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">Notifications</span>
                                    <span className="text-[11px] text-primary-400 font-medium">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                                    </span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-slate-500 text-xs">No notifications yet</div>
                                    ) : notifications.map((n) => (
                                        <button key={n._id || n.id}
                                            onClick={async () => {
                                                if (!n.isRead) {
                                                    await markAsRead(n._id || n.id).catch(() => {});
                                                    setApiNotifications(prev =>
                                                        prev.map(x => (x._id || x.id) === (n._id || n.id) ? { ...x, isRead: true } : x)
                                                    );
                                                }
                                            }}
                                            className={cn(
                                                'w-full px-4 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-b-0',
                                                !n.isRead && 'bg-primary-600/[0.04]'
                                            )}>
                                            <div className="flex gap-3 items-start">
                                                <span className={cn(
                                                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                                                    !n.isRead ? 'bg-primary-500' : 'bg-transparent'
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">{n.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                                                    <p className="text-[11px] text-slate-600 mt-1">
                                                        {n.createdAt ? new Date(n.createdAt).toRelativeString?.() ||
                                                            new Date(n.createdAt).toLocaleDateString() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="px-4 py-2.5 border-t border-white/[0.06]">
                                    <Link to="/notifications" onClick={() => setShowNotifications(false)}
                                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">
                                        View all notifications →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-5 bg-white/[0.08] mx-1 hidden sm:block" />

                    {/* Profile */}
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-all group"
                            aria-label="Profile menu">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-600
                                            p-[1.5px] shadow-md">
                                <div className="w-full h-full rounded-[5px] bg-[#0a0b14] flex items-center
                                                justify-center overflow-hidden">
                                    {user?.avatar
                                        ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        : <User size={13} className="text-primary-400" />
                                    }
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors hidden md:block">
                                {user?.name?.split(' ')[0] || 'Account'}
                            </span>
                            <ChevronDown size={13} className="text-slate-500 hidden sm:block" />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0f1120] border border-white/10
                                            rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/[0.06]">
                                    <p className="text-sm font-semibold text-white">{user?.name || 'Guest User'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'guest@eventmate.com'}</p>
                                </div>
                                <nav className="py-1">
                                    <Link to="/profile" onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-400
                                                   hover:text-white hover:bg-white/[0.04] transition-colors text-sm">
                                        <User size={14} /> View Profile
                                    </Link>
                                    <button onClick={() => setShowProfileMenu(false)}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-400
                                                   hover:text-white hover:bg-white/[0.04] transition-colors text-sm text-left">
                                        <Settings size={14} /> Settings
                                    </button>
                                </nav>
                                <div className="h-px bg-white/[0.06]" />
                                <button onClick={() => { setShowProfileMenu(false); logout(); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400
                                               hover:bg-red-500/10 transition-colors text-sm font-medium">
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 md:hidden text-slate-400 hover:text-white hover:bg-white/5 rounded-lg
                                   transition-all ml-1"
                        aria-label="Toggle menu">
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Bottom row: nav tabs (desktop + tablet) */}
            <nav className="hidden md:flex items-center gap-0 px-6 border-t border-white/[0.04]">
                {navItems.map(({ label, path }) => (
                    <NavLink key={path} to={path}
                        className={({ isActive }) => cn(
                            'relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                            isActive
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-500 rounded-t-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </header>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
            <div ref={mobileMenuRef}
                className="md:hidden sticky top-14 z-30 bg-[#0a0b14] border-b border-white/[0.06]">
                <nav className="px-4 py-2 flex flex-col">
                    {navItems.map(({ label, path }) => (
                        <NavLink key={path} to={path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => cn(
                                'px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                isActive
                                    ? 'text-white bg-white/[0.06]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                            )}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        )}

        {/* Search modal */}
        {showSearchModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
                 onClick={() => setShowSearchModal(false)}>
                <div className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                     onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                        <Search size={16} className="text-slate-500 shrink-0" />
                        <input ref={searchInputRef} type="text"
                            placeholder="Search events, organizers…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="bg-transparent outline-none text-white text-sm w-full placeholder:text-slate-500"
                            autoFocus />
                        <button onClick={() => setShowSearchModal(false)}
                            className="text-slate-500 hover:text-white transition-colors p-1">
                            <X size={15} />
                        </button>
                    </div>
                    <div className="px-4 py-6 text-center text-slate-500 text-sm">
                        Start typing to search for events…
                    </div>
                </div>
            </div>
        )}
        </>
    );
}