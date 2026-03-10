import { useState, useEffect } from 'react';
import {
  Calendar, BookOpen, DollarSign, Activity,
  Users, Star, TrendingUp, Loader2,
} from 'lucide-react';
import { getOrganizerDashboard } from '../api/organizerApi';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800 ${className}`} />;
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CLS = {
  confirmed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  cancelled: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrganizerDashboard();
        setData(res.data?.data);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpis = data ? [
    { title: 'Total Events', value: data.totalEvents, icon: Calendar, accent: 'bg-gradient-to-br from-indigo-500 to-indigo-600', sub: `${data.activeEvents} active` },
    { title: 'Upcoming Events', value: data.upcomingEvents, icon: Activity, accent: 'bg-gradient-to-br from-emerald-500 to-emerald-600', sub: `${data.pastEvents} past` },
    { title: 'Total Bookings', value: data.totalBookings, icon: BookOpen, accent: 'bg-gradient-to-br from-blue-500 to-blue-600', sub: `${data.confirmedBookings} confirmed` },
    { title: 'Total Revenue', value: `$${Number(data.totalRevenue).toLocaleString()}`, icon: DollarSign, accent: 'bg-gradient-to-br from-amber-500 to-amber-600', sub: 'All-time' },
    { title: 'Capacity', value: `${data.totalBooked} / ${data.totalCapacity}`, icon: Users, accent: 'bg-gradient-to-br from-rose-500 to-rose-600', sub: data.totalCapacity ? `${Math.round((data.totalBooked / data.totalCapacity) * 100)}% filled` : '—' },
    { title: 'Avg Rating', value: data.avgRating ?? '—', icon: Star, accent: 'bg-gradient-to-br from-purple-500 to-purple-600', sub: 'From feedback' },
  ] : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-2">
        <TrendingUp size={28} className="opacity-30" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Organizer Dashboard</h1>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Your events at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6">
                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                <Skeleton className="h-7 w-24 rounded mb-2" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            ))
          : kpis.map((kpi) => (
              <div
                key={kpi.title}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 ring-1 ring-gray-100 dark:ring-white/5 transition-all hover:shadow-md hover:scale-[1.01]"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${kpi.accent}`}>
                  <kpi.icon size={18} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{kpi.value ?? '—'}</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-300 mt-0.5">{kpi.title}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{kpi.sub}</p>
              </div>
            ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Latest 10 bookings across your events</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : !data?.recentBookings?.length ? (
          <div className="flex flex-col items-center justify-center py-14 text-gray-400 dark:text-slate-500 gap-2">
            <BookOpen size={24} className="opacity-30" />
            <p className="text-xs">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 text-left">
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Event</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Seats</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {data.recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                      {b.event?.title || '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400 truncate max-w-[140px]">
                      {b.user?.name || b.user?.email || '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400">{b.seats ?? 1}</td>
                    <td className="px-5 py-3 text-xs text-gray-400 dark:text-slate-500">{fmt(b.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${STATUS_CLS[b.status] || STATUS_CLS.pending}`}>
                        {b.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
