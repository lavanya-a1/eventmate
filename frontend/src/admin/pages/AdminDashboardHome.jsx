import { useState, useEffect, useCallback } from 'react';
import {
  Users, Calendar, BookOpen, Activity, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, UserPlus, Ticket, Star,
  Mail, ShieldCheck, Ban, CheckCircle2,
  XCircle, CreditCard, Loader2, X as XIcon,
} from 'lucide-react';
import { useTheme } from '../context/AdminThemeContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
import {
  getAdminStats, getRecentActivity,
  getAdminUsers, getAdminBookings, getAdminEvents, getPayments,
} from '../api/adminApi';

const CAT_COLORS = ['#7c3aed','#4f46e5','#0891b2','#059669','#d97706','#dc2626','#db2777','#0284c7'];

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800 ${className}`} />;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmt(date) {
  if (!date) return 'â€”';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Compact KPI Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function KPICard({ id, title, value, subtext, icon: Icon, accent, trend, loading, active, onClick }) {
  if (loading) {
    return (
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <Skeleton className="w-8 h-8 rounded-lg mb-3" />
        <Skeleton className="w-16 h-6 rounded mb-1" />
        <Skeleton className="w-24 h-3 rounded" />
      </div>
    );
  }

  const trendNum = parseFloat(trend);
  const trendUp = trendNum > 0;
  const trendFlat = trendNum === 0 || trend == null;

  return (
    <button
      onClick={() => onClick(id)}
      className={`flex-1 min-w-0 text-left bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm
                  transition-all duration-200 hover:shadow-md group
                  ${active
                    ? 'border-violet-400 dark:border-violet-500 ring-2 ring-violet-400/20'
                    : 'border-gray-200 dark:border-slate-800 hover:-translate-y-0.5'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={15} className="text-white" />
        </div>
        {!trendFlat && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trendNum)}%
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1">
        {value ?? 'â€”'}
      </p>
      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{title}</p>
      {subtext && <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{subtext}</p>}
      <div className="flex items-center gap-1 mt-3 text-[11px] font-medium text-violet-500 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
        View details →
      </div>
    </button>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Detail Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PAGE_SIZE = 100;

function DetailPanel({ activeCard, onClose }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [panelLoading, setPanelLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (card) => {
    if (!card) return;
    setPanelLoading(true);
    setError(null);
    setData([]);
    setTotal(0);
    try {
      const fn = { users: getAdminUsers, revenue: getPayments, bookings: getAdminBookings, events: getAdminEvents }[card];
      const first = await fn({ limit: PAGE_SIZE, page: 1 });
      const d = first?.data;
      const firstRows = d?.data || [];
      const pages = d?.pages ?? 1;
      const totalCount = d?.total ?? firstRows.length;
      if (pages <= 1) {
        setData(firstRows);
        setTotal(totalCount);
      } else {
        setData(firstRows);
        setTotal(totalCount);
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            fn({ limit: PAGE_SIZE, page: i + 2 })
          )
        );
        setData(firstRows.concat(...rest.map(r => r?.data?.data || [])));
      }
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => { load(activeCard); }, [activeCard, load]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const TITLE = { users: 'Users', revenue: 'Transactions', bookings: 'Bookings', events: 'Events' };

  const STATUS_BADGE = (status) => {
    const map = {
      confirmed:  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      pending:    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      cancelled:  'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
      success:    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      failed:     'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
      active:     'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      inactive:   'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${map[status] || map.inactive}`}>
        {status || 'â€”'}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{TITLE[activeCard]}</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              {panelLoading ? 'Loading…' : `${data.length}${total > data.length ? ` of ${total}` : total > 0 ? ` of ${total}` : ''} records`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
        {panelLoading ? (
          <div className="flex items-center justify-center py-14 gap-2 text-gray-400 dark:text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loadingâ€¦</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-14 text-red-400 text-sm gap-2">
            <XCircle size={16} /> {error}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-gray-400 dark:text-slate-500 gap-2">
            <TrendingUp size={24} className="opacity-30" />
            <p className="text-xs">No records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left">
                {/* Users columns */}
                {activeCard === 'users' && (
                  <>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Name</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Joined</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  </>
                )}
                {/* Revenue columns */}
                {activeCard === 'revenue' && (
                  <>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Transaction ID</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Method</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  </>
                )}
                {/* Bookings columns */}
                {activeCard === 'bookings' && (
                  <>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Event</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Seats</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  </>
                )}
                {/* Events columns */}
                {activeCard === 'events' && (
                  <>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Title</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Category</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Capacity</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {data.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  {activeCard === 'users' && (
                    <>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-[11px] font-bold text-violet-700 dark:text-violet-300 shrink-0">
                            {row.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400 truncate max-w-[160px]">
                        <div className="flex items-center gap-1.5"><Mail size={11} className="shrink-0" />{row.email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize
                          ${row.role === 'admin'     ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300'
                          : row.role === 'organizer' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          :                           'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'}`}>
                          {row.role === 'admin' && <ShieldCheck size={10} />}
                          {row.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-slate-500">{fmt(row.createdAt)}</td>
                      <td className="px-5 py-3">
                        {row.isBlocked
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"><Ban size={10} />Blocked</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={10} />Active</span>
                        }
                      </td>
                    </>
                  )}
                  {activeCard === 'revenue' && (
                    <>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <CreditCard size={12} className="text-gray-400 shrink-0" />
                          <span className="text-xs font-mono text-gray-600 dark:text-slate-300 truncate max-w-[150px]">{row.transactionId || row._id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-gray-900 dark:text-white">
                        ${Number(row.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400 capitalize">{row.paymentMethod || 'â€”'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-slate-500">{fmt(row.createdAt)}</td>
                      <td className="px-5 py-3">{STATUS_BADGE(row.status)}</td>
                    </>
                  )}
                  {activeCard === 'bookings' && (
                    <>
                      <td className="px-5 py-3 text-xs font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                        {row.event?.title || 'â€”'}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px]">
                        {row.user?.name || row.user?.email || 'â€”'}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400">{row.seats ?? 1}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-gray-900 dark:text-white">
                        ${Number(row.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-slate-500">{fmt(row.createdAt)}</td>
                      <td className="px-5 py-3">{STATUS_BADGE(row.status)}</td>
                    </>
                  )}
                  {activeCard === 'events' && (
                    <>
                      <td className="px-5 py-3 text-xs font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                        {row.title}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400 capitalize">{row.category || 'â€”'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-slate-500">{fmt(row.date)}</td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400">
                        {row.bookedSeats ?? 0} / {row.capacity ?? 'â€”'}
                      </td>
                      <td className="px-5 py-3">{STATUS_BADGE(row.status)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_ICONS = {
  booking: { icon: Ticket,   bg: 'bg-violet-50 dark:bg-violet-500/10', color: 'text-violet-600 dark:text-violet-400' },
  user:    { icon: UserPlus, bg: 'bg-blue-50 dark:bg-blue-500/10',     color: 'text-blue-600 dark:text-blue-400' },
  feedback:{ icon: Star,     bg: 'bg-amber-50 dark:bg-amber-500/10',   color: 'text-amber-600 dark:text-amber-400' },
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AdminDashboardHome() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activity, setActivity]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actLoading, setActLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, actRes] = await Promise.all([getAdminStats(), getRecentActivity()]);
        const d = statsRes.data?.data;
        if (d) {
          setStats(d.kpis || {});
          setChartData(d.chartData || []);
          const raw = d.categoryBreakdown || [];
          const total = raw.reduce((s, c) => s + c.value, 0) || 1;
          setCategories(raw.map((c, i) => ({
            name: c.name, value: Math.round((c.value / total) * 100),
            raw: c.value, color: CAT_COLORS[i % CAT_COLORS.length],
          })));
        }
        setActivity(actRes?.data?.data || []);
      } catch (_) {}
      setLoading(false);
      setActLoading(false);
    };
    load();
  }, []);

  const handleCardClick = (id) => setActiveCard(id);
  const closeModal = () => setActiveCard(null);

  const kpis = [
    { id: 'users',    title: 'Total Users',    value: stats?.totalUsers?.toLocaleString(),
      subtext: `+${stats?.newUsersThisMonth ?? 0} this month`, icon: Users,
      accent: 'bg-gradient-to-br from-violet-500 to-violet-600', trend: null },
    { id: 'revenue',  title: 'Total Revenue',
      value: stats?.totalRevenue != null ? `$${Number(stats.totalRevenue).toLocaleString()}` : 'â€”',
      subtext: 'All-time payments', icon: DollarSign,
      accent: 'bg-gradient-to-br from-emerald-500 to-emerald-600', trend: stats?.revenueGrowth },
    { id: 'bookings', title: 'Total Bookings', value: stats?.totalBookings?.toLocaleString(),
      subtext: 'Non-cancelled', icon: BookOpen,
      accent: 'bg-gradient-to-br from-blue-500 to-blue-600', trend: null },
    { id: 'events',   title: 'Active Events',  value: stats?.activeEvents?.toLocaleString(),
      subtext: `${stats?.totalEvents ?? 0} total`, icon: Activity,
      accent: 'bg-gradient-to-br from-rose-500 to-rose-600', trend: null },
  ];

  const tooltipStyle = {
    background: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 12,
    color: isDark ? '#f1f5f9' : '#0f172a',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  };

  return (
    <div className="space-y-5">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Real-time metrics Â· click a card to explore</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* ── KPI Cards Row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {kpis.map(kpi => (
          <KPICard
            key={kpi.id}
            {...kpi}
            loading={loading}
            active={activeCard === kpi.id}
            onClick={handleCardClick}
          />
        ))}
      </div>

      {/* ── Detail Modal ── */}
      {activeCard && <DetailPanel activeCard={activeCard} onClose={closeModal} />}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">

        {/* Bookings Trend */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Booking Trends</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Monthly bookings Â· last 12 months</p>
            </div>
          </div>
          {loading ? <Skeleton className="w-full h-44" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={8} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="bookings" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Event Categories</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Distribution by type</p>
          {loading ? (
            <div className="flex gap-4">
              <Skeleton className="w-28 h-28 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-full h-3 rounded" />)}
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Calendar size={24} className="mb-2 opacity-30" />
              <p className="text-xs">No data yet</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Donut – left */}
              <div className="shrink-0">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => `${v}%`} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend – right */}
              <div className="space-y-2.5">
                {categories.slice(0, 6).map(cat => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-gray-600 dark:text-slate-300 truncate max-w-[90px]">{cat.name}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{cat.raw} events</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white shrink-0">({cat.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">

        {/* Revenue Area */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Over Time</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Monthly revenue trend</p>
            </div>
            {stats?.revenueGrowth != null && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                parseFloat(stats.revenueGrowth) >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {parseFloat(stats.revenueGrowth) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(parseFloat(stats.revenueGrowth))}% vs last month
              </span>
            )}
          </div>
          {loading ? <Skeleton className="w-full h-44" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${v}`, 'Revenue']} cursor={{ stroke: isDark ? '#334155' : '#e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#059669' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Recent Activity</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Latest events across the platform</p>
          <div className="flex-1 space-y-3 overflow-hidden">
            {actLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-full h-3 rounded" />
                    <Skeleton className="w-14 h-2 rounded" />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <TrendingUp size={22} className="mb-2 opacity-30" />
                <p className="text-xs">No activity yet</p>
              </div>
            ) : (
              activity.slice(0, 8).map((item, i) => {
                const cfg = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.booking;
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon size={12} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-slate-300 leading-4 line-clamp-2">{item.message}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{timeAgo(item.time)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
