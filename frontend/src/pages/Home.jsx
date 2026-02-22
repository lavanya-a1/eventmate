import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar as CalendarIcon, ArrowRight, Users, ChevronLeft, ChevronRight, Ticket, TrendingUp, Calendar, Star, Clock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, registeredEvents: 0, upcomingEvents: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [bookingId, setBookingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEventsCount, setTotalEventsCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const eventsRes = await api.get(`/events?limit=1000&search=${search}`);
            const allEvents = eventsRes.data.data || [];
            setTotalEventsCount(eventsRes.data.total || allEvents.length);

            const now = new Date();
            const upcoming = allEvents.filter(event => new Date(event.date) > now);

            setEvents(allEvents.slice(0, 9)); // Show more events on home

            if (user) {
                const bookingsRes = await api.get('/bookings/me');
                const bookings = bookingsRes.data.data || [];
                setMyBookings(bookings);

                setStats({
                    totalEvents: allEvents.length,
                    registeredEvents: bookings.length,
                    upcomingEvents: upcoming.length
                });
            } else {
                setStats({
                    totalEvents: allEvents.length,
                    registeredEvents: 0,
                    upcomingEvents: upcoming.length
                });
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [user, search]);

    const handleQuickBook = async (eventId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Check if already booked
        if (myBookings.some(b => b.event._id === eventId)) {
            setMessage({ text: 'You are already registered for this event!', type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            return;
        }

        setBookingId(eventId);
        try {
            await api.post(`/events/${eventId}/book`);
            setMessage({ text: 'Successfully registered!', type: 'success' });
            fetchData(); // Refresh stats and bookings
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || 'Booking failed',
                type: 'error'
            });
        } finally {
            setBookingId(null);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    // Helper to render event card
    const EventCard = ({ event, index }) => {
        const isBooked = myBookings.some(b => b.event._id === event._id);
        const isBooking = bookingId === event._id;

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative h-full flex flex-col"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl blur-xl -z-10" />
                <div className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                    <div className="p-6 md:p-8 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                                {event.category || 'Event'}
                            </span>
                            <div className="text-right">
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">Seats Left</p>
                                <div className={`flex items-center gap-1.5 justify-end text-sm font-bold ${event.availableSeats > 0 ? 'text-success' : 'text-error'}`}>
                                    <Users size={14} />
                                    {event.availableSeats || 0}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {event.title}
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                                    <CalendarIcon size={16} className="text-secondary" />
                                </div>
                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                    <MapPin size={16} className="text-accent" />
                                </div>
                                {event.location}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                            <button
                                onClick={() => handleQuickBook(event._id)}
                                disabled={isBooking || isBooked || event.availableSeats <= 0}
                                className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${isBooked
                                    ? 'bg-success/10 text-success border border-success/20 cursor-default'
                                    : event.availableSeats <= 0
                                        ? 'bg-white/5 text-text-muted cursor-not-allowed'
                                        : 'btn-primary'
                                    }`}
                            >
                                {isBooking ? <Loader2 size={18} className="animate-spin" /> : isBooked ? <CheckCircle2 size={18} /> : <Ticket size={18} />}
                                {isBooked ? 'Registered' : event.availableSeats <= 0 ? 'Sold Out' : 'Register Now'}
                            </button>
                            <Link
                                to={`/event/${event._id}`}
                                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"
                                title="View Details"
                            >
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="animate-fade-in pb-20 relative overflow-hidden min-h-screen">
            {/* Notification Toast */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border ${message.type === 'success' ? 'bg-success text-white border-success' : 'bg-error text-white border-error'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-[20%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -z-10" />

            {/* Hero Section */}
            <header className="container mx-auto px-4 pt-16 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    {user ? (
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                            Welcome Back, <br />
                            <span className="gradient-text">{user.name.split(' ')[0]}!</span>
                        </h1>
                    ) : (
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                            Discover the Best <br />
                            <span className="gradient-text">Experiences.</span>
                        </h1>
                    )}
                    <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto font-medium">
                        {user
                            ? "Stay updated with your registered events and explore new opportunities."
                            : "Join the community to book events, connect with organizers, and more."}
                    </p>

                    {/* Search Bar - Visible for everyone */}
                    <div className="max-w-2xl mx-auto relative group mb-16">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl group-focus-within:bg-primary/30 transition-all rounded-3xl" />
                        <div className="relative glass-card border-white/10 flex items-center p-2">
                            <Search className="ml-4 text-text-muted" size={24} />
                            <input
                                type="text"
                                placeholder="Search events, categories, or locations..."
                                className="bg-transparent border-none py-5 px-6 text-white focus:outline-none w-full text-lg font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="px-6 text-text-muted font-bold hidden md:block">
                                <Search size={24} className="opacity-20" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-20">
                    {[
                        { label: "Total Events", value: stats.totalEvents, icon: <TrendingUp size={32} />, color: "text-primary", bg: "bg-primary/10" },
                        { label: "Registered Events", value: user ? stats.registeredEvents : "-", icon: <Ticket size={32} />, color: "text-secondary", bg: "bg-secondary/10" },
                        { label: "Upcoming Events", value: stats.upcomingEvents, icon: <CalendarIcon size={32} />, color: "text-accent", bg: "bg-accent/10" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="glass-card group p-8 hover:bg-white/[0.03] transition-all duration-500 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
                            <div className="relative z-10">
                                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                    <div className={stat.color}>{stat.icon}</div>
                                </div>
                                <h3 className="text-4xl font-black mb-2 tracking-tight">{stat.value}</h3>
                                <p className="text-text-muted font-bold text-sm uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </header>

            <main className="container mx-auto px-4 space-y-24">
                {/* Upcoming Registered Events (User Only) */}
                {user && myBookings.length > 0 && (
                    <section>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-between mb-10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 rounded-2xl">
                                    <Clock className="text-secondary" size={28} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Your Upcoming Events</h2>
                            </div>
                            <Link to="/my-bookings" className="text-sm font-black text-secondary hover:text-white transition-colors flex items-center gap-2 group">
                                View All Bookings <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myBookings
                                .filter(booking => new Date(booking.event.date) > new Date())
                                .slice(0, 3)
                                .map((booking, index) => (
                                    <div key={booking._id} className="relative group">
                                        <div className="absolute inset-0 bg-secondary/5 blur-xl group-hover:bg-secondary/10 transition-all rounded-3xl -z-10" />
                                        <div className="glass-card p-8 hover:border-secondary/30 transition-all">
                                            <h3 className="text-2xl font-bold mb-4 line-clamp-1">{booking.event.title}</h3>
                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                                    <CalendarIcon size={18} className="text-secondary" />
                                                    {new Date(booking.event.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                                    <MapPin size={18} className="text-accent" />
                                                    {booking.event.location}
                                                </div>
                                            </div>
                                            <Link
                                                to={`/event/${booking.event._id}`}
                                                className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <Ticket size={18} />
                                                View Booking Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}

                {/* Featured/All Events */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Star className="text-primary" size={28} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                {search ? "Search Results" : "Featured Events"}
                            </h2>
                        </div>
                        <Link to="/events" className="text-sm font-black text-primary hover:text-white transition-colors flex items-center gap-2 group">
                            Explore All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading && events.length === 0 ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="glass-card h-[450px] animate-pulse bg-white/5 border-none rounded-3xl" />
                            ))
                        ) : events.length > 0 ? (
                            events.map((event, index) => (
                                <EventCard key={event._id} event={event} index={index} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 glass-card border-dashed">
                                <CalendarIcon className="mx-auto mb-6 text-text-muted opacity-20" size={64} />
                                <h3 className="text-2xl font-bold mb-2">No events found</h3>
                                <p className="text-text-muted">Stay tuned for upcoming experiences!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Call to Action for Guests */}
                {!user && (
                    <section className="relative py-20 overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -z-10" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2 font-black" />
                        <div className="max-w-3xl mx-auto text-center px-4">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                                Ready to join the <span className="gradient-text">Future</span> of events?
                            </h2>
                            <p className="text-lg text-text-muted mb-10 font-medium">
                                Create an account today to unlock full features, track your bookings, and get personalized recommendations.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register" className="btn-primary text-lg px-10 py-4">Create Account</Link>
                                <Link to="/login" className="btn-secondary text-lg px-10 py-4">Sign In</Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Home;
