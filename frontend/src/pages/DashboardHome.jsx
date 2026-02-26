import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar, Ticket, CheckCircle, Bell, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getDashboardSummary } from '../api/user';
import { getMyBookings } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

// -- Skeleton for stat cards --------------------------------------------
const StatSkeleton = () => (
    <div className="bg-theme-card border border-theme rounded-xl p-4 animate-pulse">
        <div className="h-3 w-24 bg-white/5 rounded mb-3" />
        <div className="h-8 w-12 bg-white/5 rounded mb-2" />
        <div className="h-2 w-20 bg-white/5 rounded" />
    </div>
);

// -- Main Component ----------------------------------------------------
export default function DashboardHome() {
    const { setShowSearchModal } = useOutletContext() || {};
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: summaryData, loading: summaryLoading } = useApi(getDashboardSummary);
    const { data: bookingsData, loading: bookingsLoading } = useApi(getMyBookings);

    const summary = summaryData?.summary;
    const allBookings = bookingsData?.data || [];

    const registeredEvents = allBookings
        .filter((b) => b.event)
        .slice(0, 8);

    const statusStyle = (booking) => {
        if (booking.status === 'cancelled') return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelled' };
        if (booking.status === 'pending')   return { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending' };
        const past = new Date(booking.event?.date) < new Date();
        if (past) return { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Completed' };
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Confirmed' };
    };

    const stats = [
        {
            label: 'Upcoming Events',
            value: summaryLoading ? '�' : String(summary?.upcomingEvents ?? 0),
            change: 'Your confirmed events',
            icon: Calendar,
            accent: '#8b5cf6',
            route: '/bookings',
        },
        {
            label: 'Total Tickets',
            value: summaryLoading ? '�' : String(summary?.totalBookings ?? 0),
            change: 'All time bookings',
            icon: Ticket,
            accent: '#6366f1',
            route: '/tickets',
        },
        {
            label: 'Completed',
            value: summaryLoading ? '�' : String(summary?.completedEvents ?? 0),
            change: 'Past events attended',
            icon: CheckCircle,
            accent: '#22c55e',
            route: '/bookings',
        },
        {
            label: 'Notifications',
            value: summaryLoading ? '�' : String(summary?.notificationsCount ?? 0),
            change: 'Unread alerts',
            icon: Bell,
            accent: '#f59e0b',
            route: '/notifications',
        },
    ];

    return (
        <div className="py-6 space-y-8">

            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-theme tracking-tight">
                        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} ??
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Here's what's happening with your events</p>
                </div>
                <button onClick={() => navigate('/browse')}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg
                               bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium
                               transition-colors shadow-md shadow-primary-900/30">
                    Browse Events
                    <ArrowRight size={15} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {summaryLoading
                    ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                    : stats.map(({ label, value, change, icon: Icon, accent, route }) => (
                        <button key={label} onClick={() => navigate(route)} className="text-left">
                            <div className="bg-theme-card border border-theme rounded-xl p-4
                                           hover:border-theme-strong transition-colors h-full">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-slate-500 text-xs mb-2 truncate">{label}</p>
                                        <p className="text-2xl font-bold text-theme">{value}</p>
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <TrendingUp size={11} className="text-emerald-400 shrink-0" />
                                            <span className="text-[11px] text-slate-600">{change}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                         style={{ background: `${accent}18` }}>
                                        <Icon size={16} style={{ color: accent }} />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                }
            </div>

            {/* Registered Events */}
            <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
                    <div>
                        <h2 className="text-sm font-semibold text-theme">Registered Events</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {bookingsLoading ? 'Loading�' : `${registeredEvents.length} registration${registeredEvents.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <button onClick={() => navigate('/bookings')}
                        className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300
                                   font-medium transition-colors">
                        View all <ArrowRight size={13} />
                    </button>
                </div>

                {bookingsLoading ? (
                    <div className="flex items-center justify-center py-10 text-slate-500">
                        <Loader2 size={18} className="animate-spin mr-2" /> Loading�
                    </div>
                ) : registeredEvents.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-500 text-sm">You haven't registered for any events yet.</p>
                        <button onClick={() => navigate('/browse')}
                            className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">
                            Browse Events ?
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {registeredEvents.map((booking) => {
                            const ev = booking.event;
                            const dateStr = ev?.date
                                ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '�';
                            const parts = dateStr.split(' ');
                            const st = statusStyle(booking);
                            return (
                                <div key={booking._id}
                                    className="flex items-center justify-between gap-4 px-5 py-3.5
                                               hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-primary-900/30 flex flex-col items-center
                                                        justify-center shrink-0 text-center">
                                            <span className="text-[10px] font-semibold text-primary-400 uppercase leading-tight">
                                                {parts[0]}
                                            </span>
                                            <span className="text-sm font-bold text-theme leading-tight">
                                                {parts[1]?.replace(',', '')}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-theme truncate">{ev?.title || 'Event'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                {dateStr}{ev?.location ? ` � ${ev.location}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                                            {st.label}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/tickets?bookingId=${booking._id}`)}
                                            className="text-xs text-slate-500 hover:text-white transition-colors px-2 py-1
                                                       rounded hover:bg-white/5">
                                            Ticket
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}