import { clsx } from 'clsx';

// All class strings are static so Tailwind JIT can detect them
const COLORS = {
  purple: {
    darkBg:  'dark:from-purple-500/20 dark:to-purple-600/10',
    icon:    'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    ring:    'ring-purple-200 dark:ring-purple-500/20',
    badge:   'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  },
  blue: {
    darkBg:  'dark:from-blue-500/20 dark:to-blue-600/10',
    icon:    'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    ring:    'ring-blue-200 dark:ring-blue-500/20',
    badge:   'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  },
  emerald: {
    darkBg:  'dark:from-emerald-500/20 dark:to-emerald-600/10',
    icon:    'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    ring:    'ring-emerald-200 dark:ring-emerald-500/20',
    badge:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  amber: {
    darkBg:  'dark:from-amber-500/20 dark:to-amber-600/10',
    icon:    'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    ring:    'ring-amber-200 dark:ring-amber-500/20',
    badge:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  rose: {
    darkBg:  'dark:from-rose-500/20 dark:to-rose-600/10',
    icon:    'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    ring:    'ring-rose-200 dark:ring-rose-500/20',
    badge:   'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
};

export default function KPICard({ title, value, icon: Icon, trend, trendLabel, color = 'purple', loading }) {
  const c = COLORS[color] || COLORS.purple;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 mb-4" />
        <div className="h-7 w-24 bg-gray-100 dark:bg-white/10 rounded mb-2" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div className={clsx(
      'relative overflow-hidden rounded-2xl border p-6 ring-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
      'bg-white border-gray-200 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/60',
      c.darkBg,
      c.ring,
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('p-3 rounded-xl', c.icon)}>
          <Icon size={20} />
        </div>
        {trend != null && (
          <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-lg', c.badge)}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value ?? '—'}</p>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{title}</p>
      {trendLabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{trendLabel}</p>}
    </div>
  );
}
