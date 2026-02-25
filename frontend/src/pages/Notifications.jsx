import React, { useState } from 'react';
import { Bell, CheckCircle2, Info, Ticket, Calendar, Zap, Loader2, AlertCircle, Check } from 'lucide-react';
import { useApi, useMutation } from '../hooks/useApi';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';

const iconFor = (type) => {
    if (type === 'booking')      return <Ticket size={18} className="text-primary-400" />;
    if (type === 'reminder')     return <Calendar size={18} className="text-yellow-400" />;
    if (type === 'cancellation') return <AlertCircle size={18} className="text-red-400" />;
    if (type === 'promotional')  return <Zap size={18} className="text-emerald-400" />;
    return <Info size={18} className="text-slate-400" />;
};

const relativeTime = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export default function Notifications() {
    const { data, loading, error, refetch } = useApi(getNotifications);
    const { execute: readAll, loading: readingAll } = useMutation(markAllAsRead);
    const [readingId, setReadingId] = useState(null);

    const notifications = data?.data || [];
    const unread = notifications.filter((n) => !n.isRead);

    const handleReadAll = async () => {
        await readAll();
        refetch();
    };

    const handleRead = async (id) => {
        if (readingId) return;
        setReadingId(id);
        try { await markAsRead(id); } catch {}
        setReadingId(null);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {unread.length ? `${unread.length} unread notification${unread.length !== 1 ? 's' : ''}` : 'All caught up'}
                    </p>
                </div>
                {unread.length > 0 && (
                    <button onClick={handleReadAll} disabled={readingAll}
                        className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300
                                   disabled:opacity-50 transition-colors font-medium">
                        {readingAll ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Mark all as read
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 text-slate-500">
                    <Loader2 size={20} className="animate-spin mr-2" /> Loading…
                </div>
            )}

            {error && (
                <div className="flex flex-col items-center gap-3 py-20">
                    <AlertCircle size={22} className="text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                    <button onClick={refetch} className="text-sm text-primary-400 hover:underline">Retry</button>
                </div>
            )}

            {!loading && !error && notifications.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
                    <Bell size={30} className="text-slate-700" />
                    <p className="text-slate-400 font-medium">No notifications yet</p>
                </div>
            )}

            {!loading && !error && notifications.length > 0 && (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <button key={n._id} onClick={() => !n.isRead && handleRead(n._id)}
                            className={`w-full text-left rounded-xl border px-5 py-4 flex items-start gap-4
                                        transition-all duration-200
                                        ${n.isRead
                                            ? 'bg-[#0d0e1a]/50 border-white/[0.04] opacity-60'
                                            : 'bg-[#0d0e1a] border-white/[0.08] hover:border-primary-500/30'}`}>
                            <div className={`mt-0.5 shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                                            ${n.isRead ? 'bg-white/[0.04]' : 'bg-white/[0.07]'}`}>
                                {readingId === n._id
                                    ? <Loader2 size={14} className="animate-spin text-slate-400" />
                                    : iconFor(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-sm font-semibold ${n.isRead ? 'text-slate-400' : 'text-white'}`}>
                                        {n.title}
                                    </span>
                                    {!n.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{n.message}</p>
                            </div>
                            <time className="shrink-0 text-[10px] text-slate-600 mt-0.5">
                                {relativeTime(n.createdAt)}
                            </time>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

