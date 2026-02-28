import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, MapPin, Users, Ticket, ArrowLeft,
    Loader2, CheckCircle2, AlertCircle, Clock, Tag
} from 'lucide-react';
import { motion } from 'framer-motion';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [seats, setSeats] = useState(1);
    const [isBooked, setIsBooked] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data.data);

                if (user) {
                    const bookingsRes = await api.get('/bookings/me');
                    const bookings = bookingsRes.data.data || [];
                    setIsBooked(bookings.some(b => b.event._id === id || b.event === id));
                }
            } catch (err) {
                console.error('Error fetching event:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, user]);

    const adjustSeats = (delta) => {
        if (!event) return;
        const maxSeats = Math.max(1, event.availableSeats ?? 1);
        setSeats((prev) => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (next > maxSeats) return maxSeats;
            return next;
        });
    };

    const handleBook = async () => {
        if (!user) { navigate('/'); return; }
        setBooking(true);
        try {
            await api.post(`/events/${id}/book`, { seats });
            setIsBooked(true);
            setMessage({ text: 'Successfully registered for this event!', type: 'success' });
            const res = await api.get(`/events/${id}`);
            setEvent(res.data.data);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Booking failed. Please try again.', type: 'error' });
        } finally {
            setBooking(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <AlertCircle size={64} className="text-error opacity-40" />
                <h2 className="text-2xl font-bold">Event not found</h2>
                <Link to="/events" className="btn-primary px-8 py-3">Browse Events</Link>
            </div>
        );
    }

    const isPast = new Date(event.date) < new Date();
    const isFull = event.availableSeats <= 0;

    return (
        <div className="animate-fade-in min-h-screen pb-20 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -z-10" />

            <div className="container mx-auto px-4 pt-52">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-10 font-bold group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </motion.button>

                <div className="max-w-4xl mx-auto">
                    {/* Message Banner */}
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-8 px-6 py-4 rounded-2xl flex items-center gap-3 font-bold border ${message.type === 'success'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-error/10 text-error border-error/20'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                            {message.text}
                        </motion.div>
                    )}

                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="glass-card p-8 md:p-12 mb-8"
                    >
                        <div className="flex flex-wrap gap-3 mb-6">
                            {event.category && (
                                <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                                    <Tag size={12} /> {event.category}
                                </span>
                            )}
                            {isPast && (
                                <span className="px-4 py-1.5 bg-white/5 border border-theme-strong text-text-muted text-xs font-black uppercase tracking-widest rounded-lg">
                                    Past Event
                                </span>
                            )}
                            {!isPast && isFull && (
                                <span className="px-4 py-1.5 bg-error/10 border border-error/20 text-error text-xs font-black uppercase tracking-widest rounded-lg">
                                    Sold Out
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                            {event.title}
                        </h1>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Calendar size={22} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Date</p>
                                    <p className="font-bold text-sm">
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                                    <MapPin size={22} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Location</p>
                                    <p className="font-bold text-sm">{event.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isFull ? 'bg-error/10' : 'bg-success/10'}`}>
                                    <Users size={22} className={isFull ? 'text-error' : 'text-success'} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Seats Left</p>
                                    <p className={`font-bold text-sm ${isFull ? 'text-error' : 'text-success'}`}>
                                        {event.availableSeats ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Seat selection + Book Button */}
                        {!isPast && !isFull && (
                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Seats</span>
                                    <div className="flex items-center bg-white/5 rounded-xl border border-theme-strong overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => adjustSeats(-1)}
                                            className="px-3 py-2 text-lg font-bold text-text-muted hover:bg-white/5 disabled:opacity-50"
                                            disabled={seats <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 text-sm font-bold text-white min-w-[2.5rem] text-center">
                                            {seats}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => adjustSeats(1)}
                                            className="px-3 py-2 text-lg font-bold text-text-muted hover:bg-white/5 disabled:opacity-50"
                                            disabled={event.availableSeats != null && seats >= event.availableSeats}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                {typeof event.price === 'number' && (
                                    <div className="text-sm text-text-muted">
                                        <span className="font-semibold text-white">
                                            Total:&nbsp;
                                            {event.price === 0 ? 'Free' : `$${(event.price * seats).toFixed(2)}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleBook}
                            disabled={booking || isBooked || isFull || isPast}
                            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg ${isBooked
                                ? 'bg-success/10 text-success border border-success/20 cursor-default'
                                : isFull || isPast
                                    ? 'bg-white/5 text-text-muted cursor-not-allowed border border-theme-strong'
                                    : 'btn-primary'
                                }`}
                        >
                            {booking ? (
                                <><Loader2 size={20} className="animate-spin" /> Booking...</>
                            ) : isBooked ? (
                                <><CheckCircle2 size={20} /> Registered</>
                            ) : isPast ? (
                                <><Clock size={20} /> Event Ended</>
                            ) : isFull ? (
                                <><AlertCircle size={20} /> Sold Out</>
                            ) : (
                                <><Ticket size={20} /> Register Now</>
                            )}
                        </button>
                    </motion.div>

                    {/* Description Card */}
                    {event.description && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="glass-card p-8 md:p-12"
                        >
                            <h2 className="text-2xl font-black mb-6 tracking-tight">About this Event</h2>
                            <p className="text-text-muted leading-relaxed text-base whitespace-pre-wrap font-medium">
                                {event.description}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
