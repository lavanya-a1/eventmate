import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import {
    Download, Printer, Share2, Calendar, MapPin, User,
    ChevronRight, ChevronLeft, Loader2, AlertCircle, Ticket,
} from 'lucide-react';
import { Badge } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { getMyBookings } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

export default function QRTickets() {
    const [searchParams] = useSearchParams();
    const navigate       = useNavigate();
    const { user }       = useAuth();
    const { data, loading, error } = useApi(getMyBookings);
    const ticketRef = useRef(null);

    const bookings = (data?.data || []).filter((b) => b.status === 'confirmed');

    // Default to bookingId from URL, otherwise first booking
    const initialId = searchParams.get('bookingId');
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        if (!initialId || bookings.length === 0) return;
        const idx = bookings.findIndex((b) => b._id === initialId);
        if (idx >= 0) setCurrentIdx(idx);
    }, [initialId, bookings.length]); // eslint-disable-line

    const booking = bookings[currentIdx];
    const ev      = booking?.event || {};

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '�';
    const formatTime = (d) =>
        d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '�';

    const qrValue = booking
        ? JSON.stringify({
            bookingId: booking._id,
            event: ev.title,
            attendee: user?.name || 'Attendee',
            seats: booking.seats,
            status: booking.status,
          })
        : 'EVENTMATE-TICKET';

    const handlePrint = () => window.print();

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: `EventMate Ticket � ${ev.title}`,
                text: `My ticket for ${ev.title} on ${formatDate(ev.date)}`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Ticket link copied to clipboard!');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading tickets�
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center gap-3 py-24">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
        </div>
    );

    if (bookings.length === 0) return (
        <div className="flex flex-col items-center gap-4 py-24 text-slate-500">
            <Ticket size={32} className="text-slate-600" />
            <p className="text-slate-400 font-medium">No active tickets</p>
            <p className="text-slate-500 text-sm">Book an event to get your digital tickets here</p>
            <button onClick={() => navigate('/browse')}
                className="mt-2 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
                Browse Events ?
            </button>
        </div>
    );

    return (
        <div className="space-y-8 flex flex-col items-center pb-16">
            <div className="w-full flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-theme tracking-tight">Digital Tickets</h1>
                    <p className="text-slate-500 text-sm mt-1">Present this QR code at the entry gates</p>
                </div>
                {bookings.length > 1 && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <button onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                            disabled={currentIdx === 0}
                            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <span>{currentIdx + 1} / {bookings.length}</span>
                        <button onClick={() => setCurrentIdx((i) => Math.min(bookings.length - 1, i + 1))}
                            disabled={currentIdx === bookings.length - 1}
                            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Ticket Card */}
            <div className="relative w-full max-w-sm">
                <div className="absolute -inset-4 bg-primary-600/15 blur-3xl rounded-full opacity-50 pointer-events-none" />

                <div ref={ticketRef}
                    className="relative z-10 bg-theme-card border border-theme-strong rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-700 to-indigo-700 px-6 py-4 flex justify-between items-center">
                        <span className="font-bold text-white text-sm tracking-widest uppercase">Entry Pass</span>
                        <span className="font-mono text-xs text-white/70">
                            #{booking._id?.slice(-8).toUpperCase()}
                        </span>
                    </div>

                    {/* QR Code */}
                    <div className="p-6 flex flex-col items-center gap-6">
                        <div className="p-4 bg-white rounded-2xl shadow-inner">
                            <QRCode value={qrValue} size={180} fgColor="#0f172a" />
                        </div>

                        <div className="w-full text-center">
                            <h2 className="text-lg font-bold text-theme mb-1 line-clamp-2">{ev.title || 'Event'}</h2>
                            <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'} className="mb-5">
                                {booking.status === 'confirmed' ? 'CONFIRMED' : booking.status?.toUpperCase()}
                            </Badge>

                            <div className="grid grid-cols-2 gap-3 text-left border-y border-theme py-5 mb-5">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Attendee</p>
                                    <p className="text-sm font-medium text-theme truncate">{user?.name || 'Guest'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Seats</p>
                                    <p className="text-sm font-medium text-white">{booking.seats}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-sm font-medium text-white">{formatDate(ev.date)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Time</p>
                                    <p className="text-sm font-medium text-white">{formatTime(ev.date)}</p>
                                </div>
                            </div>

                            {ev.location && (
                                <div className="flex items-center gap-2 text-slate-400 text-xs justify-center
                                                py-3 bg-white/[0.03] rounded-xl border border-theme">
                                    <MapPin size={13} className="text-primary-400" />
                                    {ev.location}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tear edge */}
                    <div className="h-4 w-full flex overflow-hidden border-t border-dashed border-theme-strong">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-base -mt-3 shrink-0 mx-auto" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3 w-full print:hidden">
                <button onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500
                               text-white text-sm font-medium transition-colors">
                    <Download size={16} /> Download / Print
                </button>
                <button onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-theme-card border border-theme
                               hover:border-theme-strong text-slate-300 hover:text-white text-sm font-medium transition-colors">
                    <Share2 size={16} /> Share
                </button>
                <button onClick={() => navigate('/bookings')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-theme-card border border-theme
                               hover:border-theme-strong text-slate-400 hover:text-white text-sm transition-colors">
                    All Bookings
                </button>
            </div>
        </div>
    );
}


const currentTickets = [
    {
        id: 'TKT-99210-C',
        event: 'Neon Nights Music Festival',
        date: 'Oct 24, 2026',
        time: '20:00',
        location: 'Cyber Arena, Tokyo, Japan',
        userName: 'John Doe',
        seat: 'VIP Section A | Row 12 | Seat 42',
        tier: 'VIP ACCESS',
        qrValue: 'EVENTMATE-VIP-99210-C-JOHNDOE-20261024'
    }
]