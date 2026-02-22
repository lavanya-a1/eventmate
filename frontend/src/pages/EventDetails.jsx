import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Users, ShieldCheck, Ticket, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data.data);
            } catch (err) {
                console.error('Error fetching event details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setBookingLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await api.post(`/events/${id}/book`);
            setMessage({ text: 'Booking successful! Your seat is reserved.', type: 'success' });
            // Refresh event data to update available seats
            const updatedEvent = await api.get(`/events/${id}`);
            setEvent(updatedEvent.data.data);
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || 'Something went wrong. Please try again.',
                type: 'error'
            });
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-20 px-4 glass-card">
                <h2 className="text-2xl font-bold mb-4">Event not found</h2>
                <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
            </div>
        );
    }

    const isFull = event.bookedSeats >= event.capacity;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="glass-card overflow-hidden">
                {/* Banner Area (Hero) */}
                <div className="h-64 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-center px-6 leading-tight">
                            {event.title}
                        </h1>
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="bg-glass text-text-muted px-4 py-1 rounded-full text-sm border border-border">
                            {event.category || 'Event'}
                        </span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                About the Event
                            </h2>
                            <p className="text-text-muted leading-relaxed whitespace-pre-line text-lg">
                                {event.description}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-surface/50 p-4 rounded-xl border border-border flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Date & Time</p>
                                    <p className="font-semibold">
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-surface/50 p-4 rounded-xl border border-border flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Location</p>
                                    <p className="font-semibold">{event.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-surface p-6 rounded-2xl border border-primary/20 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Available Seats</p>
                                    <p className="text-3xl font-black">
                                        {Math.max(0, event.capacity - event.bookedSeats)}
                                        <span className="text-text-muted text-lg font-normal"> / {event.capacity}</span>
                                    </p>
                                </div>
                                <Users size={32} className="text-primary/40" />
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence mode="wait">
                                    {message.text && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === 'success' ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'
                                                }`}
                                        >
                                            {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <ShieldCheck size={18} className="shrink-0" />}
                                            {message.text}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={handleBooking}
                                    disabled={bookingLoading || isFull}
                                    className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFull
                                            ? 'bg-surface-hover text-text-muted cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 active:scale-[0.98]'
                                        }`}
                                >
                                    {bookingLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : isFull ? (
                                        'Reserved (Full)'
                                    ) : (
                                        <>
                                            <Ticket size={20} />
                                            Book My Seat Now
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-text-muted text-center italic">
                                    * Instant confirmation. Digital ticket will be issued.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck size={20} className="text-success" />
                                <span>Verified Organizer</span>
                            </div>
                            <p className="text-sm font-medium pl-8">{event.organizer?.name || 'Anonymous Organizer'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
