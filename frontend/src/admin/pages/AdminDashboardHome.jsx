import { useState, useEffect } from 'react';
import { Users, Calendar, BookOpen, Activity } from 'lucide-react';
import { useTheme } from '../context/AdminThemeContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import KPICard from '../components/ui/KPICard';
import { getAdminStats } from '../api/adminApi';

// ── Fallback data (used only if API is unavailable) ───────────────────────────
const MOCK_STATS = {
  totalUsers: 0,
  totalEvents: 0,
  totalBookings: 0,
  activeEvents: 0,
};

const MOCK_CATEGORIES = [];
const CAT_COLORS = ['#a855f7','#6366f1','#06b6d4','#f59e0b','#10b981','#f43f5e','#3b82f6','#ec4899'];

export default function AdminDashboardHome() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(MOCK_STATS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const statsRes = await getAdminStats();
        const d = statsRes.data?.data;
        if (d) {
          setStats(d.kpis || MOCK_STATS);
          const raw = d.categoryBreakdown || [];
          const total = raw.reduce((s, c) => s + c.value, 0) || 1;
          setCategories(
            raw.map((c, i) => ({
              name: c.name,
              value: Math.round((c.value / total) * 100),
              color: CAT_COLORS[i % CAT_COLORS.length],
            }))
          );
        }
      } catch (_) { /* keep defaults */ }
      setLoading(false);
    };
    load();
  }, []);

  const kpis = [
    { title: 'Total Users', value: stats.totalUsers?.toLocaleString(), icon: Users, color: 'purple' },
    { title: 'Total Events', value: stats.totalEvents?.toLocaleString(), icon: Calendar, color: 'blue' },
    { title: 'Total Bookings', value: stats.totalBookings?.toLocaleString(), icon: BookOpen, color: 'emerald' },
    { title: 'Active Events', value: stats.activeEvents?.toLocaleString(), icon: Activity, color: 'rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time metrics from your event platform</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <KPICard key={kpi.title} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Popular Categories */}
        <div className="xl:col-span-1 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Event Categories</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Booking distribution by type</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categories.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#ffffff15' : '#e2e8f0'}`, borderRadius: 12, fontSize: 12, color: theme === 'dark' ? '#fff' : '#0f172a' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categories.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
