import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar, Ticket, CheckCircle, Bell, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { getDashboardSummary } from '../api/user';
import { getMyBookings } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

// ── Static chart data (tracks real-time would need a separate API) ─────
const trendData = [
    { month: 'Jan', bookings: 4  },
    { month: 'Feb', bookings: 7  },
    { month: 'Mar', bookings: 5  },
    { month: 'Apr', bookings: 9  },
    { month: 'May', bookings: 12 },
    { month: 'Jun', bookings: 8  },
    { month: 'Jul', bookings: 14 },
];

const categoryData = [
    { name: 'Music',  value: 38, color: '#8b5cf6' },
    { name: 'Tech',   value: 27, color: '#6366f1' },
    { name: 'Sports', value: 20, color: '#3b82f6' },
    { name: 'Arts',   value: 15, color: '#06b6d4' },
];

// ── Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0f1120] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-slate-400 mb-1">{label}</p>
            <p className="text-white font-semibold">{payload[0].value} bookings</p>
        </div>
    );
};

// ── Skeleton for stat cards ────────────────────────────────────────────
const StatSkeleton = () => (
    <div className="bg-[#0d0e1a] border border-white/[0.06] rounded-xl p-4 animate-pulse">
        <div className="h-3 w-24 bg-white/5 rounded mb-3" />
        <div className="h-8 w-12 bg-white/5 rounded mb-2" />
        <div className="h-2 w-20 bg-white/5 rounded" />
    </div>
);

// ── Main Component ────────────────────────────────────────────────────
export default function DashboardHome() {
    const { setShowSearchModal } = useOutletContext() || {};
    const navigate = useNavigate();
    const { user } = useAuth();
    const [chartRange, setChartRange] = useState('7M');

    const { data: summaryData, loading: summaryLoading } = useApi(getDashboardSummary);
    const { data: bookingsData, loading: bookingsLoading } = useApi(getMyBookings);

    const summary = summaryData?.summary;
    const allBookings = bookingsData?.data || [];

    const now = new Date();
    const upcomingBookings = allBookings
        .filter((b) => b.event && new Date(b.event.date) > now && b.status !== 'cancelled')
        .slice(0, 5);

    const stats = [
        {
            label: 'Upcoming Events',
            value: summaryLoading ? '—' : String(summary?.upcomingEvents ?? 0),
            change: 'Your confirmed events',
            icon: Calendar,
            accent: '#8b5cf6',
            route: '/bookings',
        },
        {
            label: 'Total Tickets',
            value: summaryLoading ? '—' : String(summary?.totalBookings ?? 0),
            change: 'All time bookings',
            icon: Ticket,
            accent: '#6366f1',
            route: '/tickets',
        },
        {
            label: 'Completed',
            value: summaryLoading ? '—' : String(summary?.completedEvents ?? 0),
            change: 'Past events attended',
            icon: CheckCircle,
            accent: '#22c55e',
            route: '/bookings',
        },
        {
            label: 'Notifications',
            value: summaryLoading ? '—' : String(summary?.notificationsCount ?? 0),
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
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
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
                            <div className="bg-[#0d0e1a] border border-white/[0.06] rounded-xl p-4
                                           hover:border-white/10 transition-colors h-full">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-slate-500 text-xs mb-2 truncate">{label}</p>
                                        <p className="text-2xl font-bold text-white">{value}</p>
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Booking Trend */}
                <div className="lg:col-span-2 bg-[#0d0e1a] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-sm font-semibold text-white">Booking Trend</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Monthly booking activity</p>
                        </div>
                        <div className="flex gap-1">
                            {['3M', '7M', '1Y'].map((r) => (
                                <button key={r} onClick={() => setChartRange(r)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                        chartRange === r
                                            ? 'bg-primary-600/20 text-primary-400'
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={trendData} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#1e2035" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2}
                                  fill="url(#bookingGrad)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="bg-[#0d0e1a] border border-white/[0.06] rounded-xl p-5">
                    <div className="mb-5">
                        <h2 className="text-sm font-semibold text-white">Categories</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Events by type</p>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                                 paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {categoryData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) =>
                                    active && payload?.length ? (
                                        <div className="bg-[#0f1120] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                                            <p className="text-white font-semibold">{payload[0].name}</p>
                                            <p className="text-slate-400">{payload[0].value}%</p>
                                        </div>
                                    ) : null
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {categoryData.map(({ name, value, color }) => (
                            <button key={name}
                                onClick={() => navigate(`/browse?category=${name}`)}
                                className="w-full flex items-center justify-between hover:bg-white/[0.03] rounded px-1 py-0.5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                    <span className="text-xs text-slate-400">{name}</span>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{value}%</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-[#0d0e1a] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Upcoming Events</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {bookingsLoading ? 'Loading…' : `${upcomingBookings.length} events scheduled`}
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
                        <Loader2 size={18} className="animate-spin mr-2" /> Loading…
                    </div>
                ) : upcomingBookings.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-slate-500 text-sm">No upcoming events yet.</p>
                        <button onClick={() => navigate('/browse')}
                            className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">
                            Browse Events →
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {upcomingBookings.map((booking) => {
                            const ev = booking.event;
                            const dateStr = ev?.date
                                ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—';
                            const parts = dateStr.split(' ');
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
                                            <span className="text-sm font-bold text-white leading-tight">
                                                {parts[1]?.replace(',', '')}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{ev?.title || 'Event'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                {dateStr}{ev?.location ? ` · ${ev.location}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                            booking.status === 'confirmed'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                        </span>
                                        <button onClick={() => navigate('/tickets')}
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