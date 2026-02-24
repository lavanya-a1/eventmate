import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, MapPin, Ticket, ArrowRight, Loader2,
    CheckCircle2, AlertCircle, Clock, PackageOpen, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'past'

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/me');
            setBookings(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleCancel = async (bookingId) => {
        setCancelling(bookingId);
        try {
            await api.delete(`/bookings/${bookingId}`);
            setMessage({ text: 'Booking cancelled successfully.', type: 'success' });
            fetchBookings();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Cancellation failed.', type: 'error' });
        } finally {
            setCancelling(null);
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        }
    };

    const now = new Date();
    const filtered = bookings.filter(b => {
        if (!b.event) return false;
        const eventDate = new Date(b.event.date);
        if (filter === 'upcoming') return eventDate > now && b.status === 'confirmed';
        if (filter === 'past') return eventDate <= now || b.status === 'cancelled';
        return true;
    });

    const tabs = ['all', 'upcoming', 'past'];

    return (
        <div className="animate-fade-in min-h-screen pb-20 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full -z-10" />

            <div className="container mx-auto px-4 pt-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-3">
                        My <span className="gradient-text">Bookings</span>
                    </h1>
                    <p className="text-text-muted font-medium text-lg">
                        {user ? `Hello, ${user.name.split(' ')[0]}! Here are all your registrations.` : 'All your event registrations in one place.'}
                    </p>
                </motion.div>

                {/* Message Banner */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mb-8 px-6 py-4 rounded-2xl flex items-center gap-3 font-bold border ${message.type === 'success'
                                    ? 'bg-success/10 text-success border-success/20'
                                    : 'bg-error/10 text-error border-error/20'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-10">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${filter === tab
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 size={48} className="animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card border-dashed text-center py-24 flex flex-col items-center gap-6"
                    >
                        <PackageOpen size={64} className="text-text-muted opacity-20" />
                        <h3 className="text-2xl font-bold">No bookings found</h3>
                        <p className="text-text-muted">
                            {filter === 'upcoming' ? 'No upcoming events.' : filter === 'past' ? 'No past events.' : "You haven't registered for any events yet."}
                        </p>
                        <Link to="/events" className="btn-primary px-8 py-3 mt-2">Browse Events</Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((booking, index) => {
                            const isPast = booking.event && new Date(booking.event.date) <= now;
                            const isCancelled = booking.status === 'cancelled';
                            return (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08, duration: 0.4 }}
                                    className="group relative"
                                >
                                    <div className={`absolute inset-0 blur-xl -z-10 rounded-3xl transition-all duration-500 ${isCancelled ? 'bg-error/5' : isPast ? 'bg-white/5' : 'bg-secondary/5 group-hover:bg-secondary/10'
                                        }`} />
                                    <div className={`glass-card p-8 h-full flex flex-col transition-all ${isCancelled ? 'opacity-60' : isPast ? 'border-white/5' : 'hover:border-secondary/30'
                                        }`}>
                                        {/* Status badge */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-widest border ${isCancelled
                                                    ? 'bg-error/10 text-error border-error/20'
                                                    : isPast
                                                        ? 'bg-white/5 text-text-muted border-white/10'
                                                        : 'bg-success/10 text-success border-success/20'
                                                }`}>
                                                {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Confirmed'}
                                            </span>
                                            {booking.event?.category && (
                                                <span className="text-[10px] text-primary font-black opacity-60 uppercase tracking-widest">
                                                    {booking.event.category}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold mb-4 line-clamp-2 leading-tight">
                                            {booking.event?.title || 'Event Unavailable'}
                                        </h3>

                                        <div className="space-y-3 mb-6">
                                            {booking.event?.date && (
                                                <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                                    <Calendar size={16} className="text-secondary shrink-0" />
                                                    {new Date(booking.event.date).toLocaleDateString('en-US', {
                                                        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                                                    })}
                                                </div>
                                            )}
                                            {booking.event?.location && (
                                                <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                                    <MapPin size={16} className="text-accent shrink-0" />
                                                    {booking.event.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                                <Clock size={16} className="text-primary shrink-0" />
                                                Booked {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
                                            {booking.event?._id && (
                                                <Link
                                                    to={`/event/${booking.event._id}`}
                                                    className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 font-bold text-sm transition-all"
                                                >
                                                    <Ticket size={16} /> View
                                                    <ArrowRight size={14} />
                                                </Link>
                                            )}
                                            {!isCancelled && !isPast && (
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={cancelling === booking._id}
                                                    className="px-4 py-3 rounded-2xl bg-error/10 hover:bg-error/20 text-error border border-error/20 flex items-center justify-center gap-2 font-bold text-sm transition-all"
                                                >
                                                    {cancelling === booking._id
                                                        ? <Loader2 size={16} className="animate-spin" />
                                                        : <XCircle size={16} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
