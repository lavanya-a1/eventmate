import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Ticket, Calendar, MapPin, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/me');
            setBookings(res.data.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        setCancellingId(bookingId);
        try {
            await api.delete(`/bookings/${bookingId}`);
            // Refresh list
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-extrabold flex items-center gap-3">
                    <Ticket className="text-primary" size={36} />
                    My <span className="gradient-text">Bookings</span>
                </h1>
                <div className="bg-surface/50 px-4 py-2 rounded-full border border-border text-sm font-medium">
                    {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {bookings.length > 0 ? (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 ${booking.status === 'confirmed' ? 'border-l-success' : 'border-l-text-muted opacity-60'
                                    }`}
                            >
                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${booking.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-surface-hover text-text-muted'
                                            }`}>
                                            {booking.status}
                                        </span>
                                        <span className="text-text-muted text-xs">Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold">{booking.event?.title || 'Unknown Event'}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {booking.event?.location || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            disabled={cancellingId === booking._id}
                                            className="flex items-center gap-2 text-error hover:bg-error/10 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                                        >
                                            {cancellingId === booking._id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                                            Cancel Booking
                                        </button>
                                    )}
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center min-w-[100px]">
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter">Seats</p>
                                        <p className="text-xl font-black">{booking.seats}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 glass-card">
                        <div className="bg-surface p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} className="text-text-muted" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
                        <p className="text-text-muted mb-8">You haven't reserved any seats for upcoming events.</p>
                        <button onClick={() => window.location.href = '/'} className="btn-primary">Explore Events</button>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;
