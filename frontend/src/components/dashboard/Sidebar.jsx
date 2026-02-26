import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    CalendarCheck,
    Ticket,
    Bell,
    MessageSquare,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '../ui';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Browse Events', path: '/browse' },
    { icon: CalendarCheck, label: 'My Bookings', path: '/bookings' },
    { icon: Ticket, label: 'QR Tickets', path: '/tickets' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const { logout } = useAuth();

    // Close sidebar on mobile when route changes
    useEffect(() => {
        const handleRouteChange = () => {
            if (window.innerWidth < 1024) {
                setIsOpen(false);
            }
        };
        window.addEventListener('navigate', handleRouteChange);
        return () => window.removeEventListener('navigate', handleRouteChange);
    }, [setIsOpen]);

    return (
        <>
            {/* Desktop Sidebar - Fixed position with proper spacing */}
            <aside
                className={cn(
                    "h-screen glass border-r border-theme-strong transition-all duration-300 z-50 flex flex-col shrink-0 overflow-hidden",
                    // Desktop: Always visible with toggle
                    "hidden lg:flex lg:relative lg:translate-x-0",
                    // Responsive width based on isOpen state
                    isOpen ? "w-[280px] shadow-2xl" : "w-[80px]"
                )}
            >
                {/* Sidebar Header with Logo */}
                <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-white/5 bg-white/[0.02] group">
                    <div className={cn("flex items-center gap-3 transition-all duration-300", !isOpen && "justify-center w-full")}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/30">
                            <span className="font-black text-white text-sm tracking-tighter italic">EM</span>
                        </div>
                        {isOpen && (
                            <span className="font-black text-xl tracking-tight text-white whitespace-nowrap">
                                EventMate
                            </span>
                        )}
                    </div>

                    {/* Collapse Toggle Button - Positioned in header */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-full bg-slate-900 text-primary-400 shadow-xl border border-primary-500/30 hover:bg-primary-600 hover:text-white transition-all hover:scale-110 active:scale-95"
                        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary-600/20 text-primary-400 border border-primary-600/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-95"
                            )}
                        >
                            <item.icon size={22} className={cn("shrink-0 transition-transform group-hover:scale-110")} />
                            {isOpen && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}

                            {/* Tooltip when collapsed - only on desktop */}
                            {!isOpen && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-[100] border border-theme-strong whitespace-nowrap shadow-2xl">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Sign Out Button */}
                <div className="p-3 border-t border-theme-strong bg-white/[0.01]">
                    <button
                        onClick={logout}
                        className={cn(
                            "w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group relative font-bold text-sm",
                            !isOpen && "justify-center"
                        )}
                        title="Sign out"
                    >
                        <LogOut size={22} className="shrink-0 transition-transform group-hover:translate-x-1" />
                        {isOpen && <span>Sign Out</span>}

                        {!isOpen && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] shadow-xl whitespace-nowrap">
                                Sign Out
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar - Overlay on top */}
            {isOpen && (
                <aside className="fixed inset-y-0 left-0 w-[280px] z-50 glass border-r border-theme-strong flex flex-col overflow-hidden lg:hidden shadow-2xl">
                    {/* Mobile Sidebar Header */}
                    <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/30">
                                <span className="font-black text-white text-sm tracking-tighter italic">EM</span>
                            </div>
                            <span className="font-black text-xl tracking-tight text-white">EventMate</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-all"
                            aria-label="Close sidebar"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary-600/20 text-primary-400 border border-primary-600/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-95"
                                )}
                            >
                                <item.icon size={22} className="shrink-0" />
                                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Mobile Sign Out Button */}
                    <div className="p-3 border-t border-theme-strong bg-white/[0.01]">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
                        >
                            <LogOut size={22} className="shrink-0" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>
            )}
        </>
    );
}
