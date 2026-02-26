import { clsx } from 'clsx';

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
      <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
    </div>
  );
}

export function CardSkeleton({ className }) {
  return (
    <div className={clsx('animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6', className)}>
      <div className="h-4 w-1/3 bg-white/10 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="h-3 bg-white/10 rounded w-4/6" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-white/5 rounded-xl" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="flex-1 h-8 bg-white/5 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default PageSkeleton;
