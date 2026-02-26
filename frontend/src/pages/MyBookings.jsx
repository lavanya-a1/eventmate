import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Ticket, Calendar, Download, XCircle,
    Clock, ExternalLink, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { getMyBookings, cancelBooking } from '../api/bookings';

const statusDisplay = (booking) => {
    if (booking.status === 'cancelled') return { label: 'Cancelled', variant: 'danger' };
    if (booking.status === 'pending')   return { label: 'Pending',   variant: 'warning' };
    const now = new Date();
    const eventDate = booking.event?.date ? new Date(booking.event.date) : null;
    if (eventDate && eventDate <= now)  return { label: 'Completed', variant: 'success' };
    return { label: 'Upcoming', variant: 'primary' };
};

export default function MyBookings() {
    const navigate = useNavigate();
    const { data, loading, error, refetch } = useApi(getMyBookings);
    const [cancelling, setCancelling] = useState(null); // bookingId being cancelled
    const [cancelError, setCancelError] = useState(null);

    const bookings = data?.data || [];

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '�';
    const formatTime = (d) =>
        d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '�';

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancelling(bookingId);
        setCancelError(null);
        try {
            await cancelBooking(bookingId);
            refetch();
        } catch (err) {
            setCancelError(err?.message || 'Failed to cancel booking');
        } finally {
            setCancelling(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading bookings�
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={refetch}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10
                           text-white text-sm transition-colors">
                <RefreshCw size={14} /> Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-6 pb-16">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-theme tracking-tight">My Bookings</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <button onClick={() => navigate('/browse')}
                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm
                               font-medium transition-colors shadow-md shadow-primary-900/30">
                    Browse Events
                </button>
            </div>

            {cancelError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={14} /> {cancelError}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="py-20 text-center">
                    <Ticket size={32} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium">No bookings yet</p>
                    <p className="text-slate-500 text-sm mt-1">Browse events and book your first ticket</p>
                    <button onClick={() => navigate('/browse')}
                        className="mt-4 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
                        Browse Events ?
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const ev = booking.event || {};
                        const { label: statusLabel, variant: statusVariant } = statusDisplay(booking);
                        const isUpcoming  = statusLabel === 'Upcoming' || statusLabel === 'Pending';
                        const isCompleted = statusLabel === 'Completed';
                        const isCancelling = cancelling === booking._id;

                        return (
                            <Card key={booking._id}
                                className="p-0 border-theme hover:border-theme-strong transition-colors overflow-hidden">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Event Image */}
                                    <div className="flex flex-1 p-5 items-center gap-5">
                                        {ev.image ? (
                                            <img src={ev.image} alt={ev.title}
                                                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-theme-strong" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-primary-900/30 flex items-center
                                                            justify-center shrink-0 border border-theme-strong">
                                                <Ticket size={22} className="text-primary-500" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
                                                    #{booking._id?.slice(-8).toUpperCase()}
                                                </span>
                                                <Badge variant={statusVariant}>{statusLabel}</Badge>
                                            </div>
                                            <h3 className="text-base font-semibold text-theme truncate">
                                                {ev.title || 'Event'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Calendar size={12} className="text-primary-500" />
                                                    {formatDate(ev.date)}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Clock size={12} className="text-indigo-500" />
                                                    {formatTime(ev.date)}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Ticket size={12} className="text-emerald-500" />
                                                    {booking.seats} seat{booking.seats !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:w-64 bg-white/[0.02] border-t lg:border-t-0 lg:border-l
                                                    border-white/[0.05] p-5 flex flex-col justify-center gap-3">
                                        <div className="text-right lg:text-right">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Amount</p>
                                            <p className="text-lg font-bold text-theme">
                                                {ev.price != null ? `$${ev.price}.00` : '�'}
                                            </p>
                                        </div>
                                        <div className="flex flex-row lg:flex-col gap-2">
                                            <button
                                                onClick={() => navigate(`/tickets?bookingId=${booking._id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                                                           bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium
                                                           transition-colors">
                                                <Download size={14} /> E-Ticket
                                            </button>
                                            {isUpcoming && (
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={isCancelling}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                                                               border border-red-500/20 hover:bg-red-500/10 text-red-400
                                                               text-xs font-medium transition-colors disabled:opacity-50">
                                                    {isCancelling
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <XCircle size={14} />
                                                    }
                                                    Cancel
                                                </button>
                                            )}
                                            {isCompleted && (
                                                <button
                                                    onClick={() => navigate('/feedback')}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                                                               border border-theme hover:bg-white/5 text-slate-400
                                                               hover:text-white text-xs font-medium transition-colors">
                                                    <ExternalLink size={14} /> Feedback
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
