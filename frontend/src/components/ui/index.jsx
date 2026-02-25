import React from 'react';
import { Info, CheckCircle2, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PageWrapper from '../dashboard/PageWrapper';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20',
        secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10',
        ghost: 'bg-transparent text-white hover:bg-white/10',
        outline: 'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg font-semibold',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});

export const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'glass-card p-6 overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    'w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                    error && 'border-red-500 focus:ring-red-500/50',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
});



export const Badge = ({ children, variant = 'neutral', className }) => {
    const variants = {
        neutral: 'bg-slate-800 text-slate-300',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
        primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    };

    return (
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
            {children}
        </span>
    );
};

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/5", className)}
            {...props}
        />
    );
};

export const Toast = ({ message, type = 'info', onClose }) => {
    const icons = {
        info: <Info size={18} className="text-primary-400" />,
        success: <CheckCircle2 size={18} className="text-emerald-400" />,
        error: <XCircle size={18} className="text-red-400" />,
    };

    const colors = {
        info: 'border-primary-500/20 bg-primary-600/10',
        success: 'border-emerald-500/20 bg-emerald-600/10',
        error: 'border-red-500/20 bg-red-600/10',
    };

    return (
        <div className={cn(
            "fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl animate-slide-up shadow-2xl",
            colors[type]
        )}>
            {icons[type]}
            <span className="text-sm font-medium text-white">{message}</span>
            <button onClick={onClose} className="ml-4 text-slate-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export { PageWrapper };
