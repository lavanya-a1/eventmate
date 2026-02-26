import { clsx } from 'clsx';

const variantMap = {
  success: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
  error: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30',
  gray: 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30',
};

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', variantMap[variant], className)}>
      {children}
    </span>
  );
}
