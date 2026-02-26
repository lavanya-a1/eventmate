import { clsx } from 'clsx';

export default function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon: Icon,
  onClick,
  type = 'button',
  className,
}) {
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
    danger: 'bg-red-600/80 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    ghost: 'hover:bg-white/10 text-slate-400 hover:text-white',
    success: 'bg-emerald-600/80 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}
