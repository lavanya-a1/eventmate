import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar as CalendarIcon, ArrowRight, Users, ChevronLeft, ChevronRight, Ticket, TrendingUp, Star, Clock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, registeredEvents: 0, upcomingEvents: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [page, setPage] = useState(1);
    const [totalEventsCount, setTotalEventsCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const eventsRes = await api.get(`/events?limit=1000&search=${search}`);
            const allEvents = eventsRes.data.data || [];
            setTotalEventsCount(eventsRes.data.total || allEvents.length);

            const now = new Date();
            const upcoming = allEvents.filter(event => new Date(event.date) > now);
            const completed = allEvents.filter(event => new Date(event.date) <= now);

            setEvents(allEvents); // Keep all events in state

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
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [search, user]);

    // Helper to render event card
    const EventCard = ({ event, index, isCompleted }) => {
        const isBooked = myBookings.some(b => (b.event?._id || b.event) === event._id);

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className={`group relative h-full flex flex-col ${isCompleted ? 'opacity-70 grayscale-[0.5]' : ''}`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 rounded-3xl blur-xl -z-10 ${isCompleted ? 'from-white/5 to-white/5' : 'from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100'}`} />
                <div className={`glass-card overflow-hidden transition-all duration-300 h-full flex flex-col ${isCompleted ? 'border-white/5' : 'hover:border-primary/30'}`}>
                    <div className="p-6 md:p-8 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`px-3 py-1 border text-[10px] font-black uppercase tracking-widest rounded-lg ${isCompleted ? 'bg-white/5 border-theme-strong text-text-muted' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                {isCompleted ? 'Past Event' : (event.category || 'Event')}
                            </span>
                            <div className="text-right">
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1">{isCompleted ? 'Total Attendees' : 'Seats Left'}</p>
                                <div className={`flex items-center gap-1.5 justify-end text-sm font-bold ${isCompleted ? 'text-text-muted' : event.availableSeats > 0 ? 'text-success' : 'text-error'}`}>
                                    <Users size={14} />
                                    {isCompleted ? (event.bookedSeats || 0) : (event.availableSeats || 0)}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {event.title}
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <CalendarIcon size={16} className={isCompleted ? 'text-text-muted' : 'text-secondary'} />
                                </div>
                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-3 text-text-muted text-sm font-medium">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin size={16} className={isCompleted ? 'text-text-muted' : 'text-accent'} />
                                </div>
                                {event.location}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                            {!isCompleted ? (
                                <button
                                    onClick={() => navigate(`/event/${event._id}`)}
                                    disabled={isBooked || event.availableSeats <= 0}
                                    className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${isBooked
                                        ? 'bg-success/10 text-success border border-success/20 cursor-default'
                                        : event.availableSeats <= 0
                                            ? 'bg-white/5 text-text-muted cursor-not-allowed'
                                            : 'btn-primary'
                                        }`}
                                >
                                    {isBooked ? <CheckCircle2 size={18} /> : <Ticket size={18} />}
                                    {isBooked ? 'Registered' : event.availableSeats <= 0 ? 'Sold Out' : 'Register Now'}
                                </button>
                            ) : (
                                <div className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold bg-white/5 text-text-muted border border-theme-strong cursor-default">
                                    <CheckCircle2 size={18} />
                                    Event Completed
                                </div>
                            )}
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

    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) > now);
    const completedEvents = events.filter(e => new Date(e.date) <= now);

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
            <header className="container mx-auto px-4 pt-52 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                        Discover the Best <br />
                        <span className="gradient-text">Experiences.</span>
                    </h1>
                    <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto font-medium">
                        Explore upcoming opportunities and look back at our past successful events.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group mb-16">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl group-focus-within:bg-primary/30 transition-all rounded-3xl" />
                        <div className="relative glass-card border-theme-strong flex items-center p-2">
                            <Search className="ml-4 text-text-muted" size={24} />
                            <input
                                type="text"
                                placeholder="Search events, categories, or locations..."
                                className="bg-transparent border-none py-5 px-6 text-white focus:outline-none w-full text-lg font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Stats */}
                {!search && (
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
                )}
            </header>

            <main className="container mx-auto px-4 space-y-24">
                {/* Upcoming Events Section */}
                {(upcomingEvents.length > 0 || !search) && (
                    <section>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-10"
                        >
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Star className="text-primary" size={28} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                {search ? `Upcoming results for "${search}"` : "Upcoming Events"}
                            </h2>
                        </motion.div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="glass-card h-[400px] animate-pulse rounded-3xl" />
                                ))}
                            </div>
                        ) : upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {upcomingEvents.map((event, index) => (
                                    <EventCard key={event._id} event={event} index={index} isCompleted={false} />
                                ))}
                            </div>
                        ) : !search && (
                            <div className="text-center py-20 glass-card border-dashed">
                                <CalendarIcon className="mx-auto mb-6 text-text-muted opacity-20" size={64} />
                                <h3 className="text-2xl font-bold mb-2">No upcoming events found</h3>
                                <p className="text-text-muted">Stay tuned for new experiences!</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Completed Events Section */}
                {completedEvents.length > 0 && (
                    <section>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-10"
                        >
                            <div className="p-3 bg-secondary/10 rounded-2xl">
                                <CheckCircle2 className="text-secondary" size={28} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                {search ? `Past results for "${search}"` : "Completed Events"}
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {completedEvents.map((event, index) => (
                                <EventCard key={event._id} event={event} index={index} isCompleted={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Overall Empty State for Search */}
                {!loading && events.length === 0 && search && (
                    <div className="text-center py-20 glass-card">
                        <Search className="mx-auto mb-6 text-text-muted opacity-20" size={64} />
                        <h3 className="text-2xl font-bold mb-2">No matches for "{search}"</h3>
                        <p className="text-text-muted">Try adjusting your search terms.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
