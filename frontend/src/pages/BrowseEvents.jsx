import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, MapPin, Calendar, Filter, CreditCard,
    X, Loader2, AlertCircle, CheckCircle,
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { getEvents } from '../api/events';
import { createBooking } from '../api/bookings';

const CATEGORIES = ['All', 'Technology', 'Education', 'Entertainment', 'Arts', 'Marketing', 'Sports', 'Health'];

export default function BrowseEvents() {
    const navigate        = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Controlled state from URL
    const [searchTerm,      setSearchTerm]      = useState(searchParams.get('q') || '');
    const [activeCategory,  setActiveCategory]  = useState(searchParams.get('category') || 'All');
    const [page,            setPage]            = useState(1);

    // Data state
    const [events,    setEvents]    = useState([]);
    const [total,     setTotal]     = useState(0);
    const [pages,     setPages]     = useState(1);
    const [loading,   setLoading]   = useState(true);  // initial skeleton
    const [fetching,  setFetching]  = useState(false); // subsequent quiet refetch
    const [error,     setError]     = useState(null);
    const isFirstFetch = useRef(true);

    // Modal / booking state
    const [selectedEvent,  setSelectedEvent]  = useState(null);
    const [booking,        setBooking]        = useState({ loading: false, error: null, success: false });

    const debounceRef = useRef(null);
    const setSearchParamsRef = useRef(setSearchParams);
    useEffect(() => { setSearchParamsRef.current = setSearchParams; }, [setSearchParams]);

    // -- Fetch events ------------------------------------------
    const fetchEvents = useCallback(async (term, category, pg) => {
        if (isFirstFetch.current) {
            setLoading(true);
        } else {
            setFetching(true);
        }
        setError(null);
        try {
            const params = { page: pg, limit: 9 };
            if (term)                           params.search   = term;
            if (category && category !== 'All') params.category = category;
            const res = await getEvents(params);
            setEvents(res.data || []);
            setTotal(res.total || 0);
            setPages(res.pages || 1);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load events');
        } finally {
            isFirstFetch.current = false;
            setLoading(false);
            setFetching(false);
        }
    }, []);

    // Category changes: fire immediately
    const handleCategoryChange = useCallback((cat) => {
        setActiveCategory(cat);
        setPage(1);
        const sp = {};
        if (searchTerm) sp.q = searchTerm;
        if (cat !== 'All') sp.category = cat;
        setSearchParamsRef.current(sp, { replace: true });
        fetchEvents(searchTerm, cat, 1);
    }, [fetchEvents, searchTerm]);

    // Search: debounce 400ms, don't re-fire if category already triggered
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchEvents(searchTerm, activeCategory, 1);
            const sp = {};
            if (searchTerm)               sp.q        = searchTerm;
            if (activeCategory !== 'All') sp.category = activeCategory;
            setSearchParamsRef.current(sp, { replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Re-fetch when page changes (page > 1 only; page=1 is handled by the debounce effect)
    useEffect(() => {
        if (page > 1) fetchEvents(searchTerm, activeCategory, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // -- Book event --------------------------------------------
    const handleBook = async (eventId) => {
        setBooking({ loading: true, error: null, success: false });
        try {
            await createBooking(eventId);
            setBooking({ loading: false, error: null, success: true });
            setTimeout(() => {
                setSelectedEvent(null);
                setBooking({ loading: false, error: null, success: false });
                navigate('/bookings');
            }, 1200);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Booking failed';
            setBooking({ loading: false, error: msg, success: false });
        }
    };

    const formatDate = (dateStr) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'ï¿½';

    return (
        <div className="space-y-8 pb-20">
            {/* Header & Search */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-theme tracking-tight">Explore Events</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {loading
                            ? 'Loadingï¿½'
                            : `${total} event${total !== 1 ? 's' : ''} available`
                        }
                        {fetching && !loading && (
                            <Loader2 size={12} className="inline ml-2 animate-spin text-slate-600" />
                        )}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, locationï¿½"
                            className="w-full bg-theme-card border border-theme rounded-lg pl-9 pr-4 py-2.5
                                       text-white text-sm focus:outline-none focus:border-primary-500/50 transition-colors
                                       placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => handleCategoryChange(cat)}
                        className={cn(
                            'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                            activeCategory === cat
                                ? 'bg-primary-600 border-primary-500 text-white'
                                : 'bg-transparent border-theme text-slate-500 hover:text-slate-300 hover:border-theme-strong'
                        )}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Events Grid */}
            <div className="relative">
                {/* Thin loading bar */}
                {fetching && (
                    <div className="absolute -top-2 left-0 right-0 h-0.5 rounded-full overflow-hidden z-10 bg-white/5">
                        <div className="h-full w-1/3 bg-primary-500 loading-bar" />
                    </div>
                )}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-theme-card border border-theme rounded-xl overflow-hidden animate-pulse">
                            <div className="h-48 bg-white/[0.04]" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                                <div className="h-8 bg-white/[0.04] rounded mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <p className="text-base font-medium text-slate-400 mb-1">No events found</p>
                    <p className="text-sm">Try a different search or category</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${fetching ? 'opacity-50' : 'opacity-100'}`}>
                    {events.map((event) => (
                        <Card key={event._id}
                            className="p-0 border-theme hover:border-primary-500/40 group transition-all
                                       duration-300 flex flex-col cursor-pointer"
                            onClick={() => { setSelectedEvent(event); setBooking({ loading: false, error: null, success: false }); }}>
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=60'}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-black/60
                                                     backdrop-blur text-white border border-theme-strong">
                                        {event.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 right-3">
                                    <span className="px-2 py-1 rounded-md text-sm font-bold bg-black/60 backdrop-blur
                                                     text-white border border-theme-strong">
                                        {event.price === 0 ? 'FREE' : `$${event.price}`}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-3 line-clamp-1
                                                   group-hover:text-primary-400 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Calendar size={13} className="text-primary-500 shrink-0" />
                                            {formatDate(event.date)}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <MapPin size={13} className="text-indigo-500 shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const isPast = new Date(event.date) < new Date();
                                        if (!isPast) handleBook(event._id);
                                        else { setSelectedEvent(event); setBooking({ loading: false, error: null, success: false }); }
                                    }}
                                    disabled={booking.loading || new Date(event.date) < new Date()}
                                    className={`mt-4 w-full py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 ${
                                        new Date(event.date) < new Date()
                                            ? 'bg-slate-600 cursor-not-allowed'
                                            : 'bg-primary-600 hover:bg-primary-500'
                                    }`}>
                                    {new Date(event.date) < new Date() ? 'Event Ended' : 'Book Now'}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            </div> {/* end relative wrapper */}
            {!loading && pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white
                                   bg-theme-card border border-theme disabled:opacity-40 disabled:cursor-not-allowed
                                   hover:border-theme-strong transition-colors">
                        Previous
                    </button>
                    <span className="text-slate-500 text-sm">Page {page} of {pages}</span>
                    <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white
                                   bg-theme-card border border-theme disabled:opacity-40 disabled:cursor-not-allowed
                                   hover:border-theme-strong transition-colors">
                        Next
                    </button>
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                         onClick={() => setSelectedEvent(null)} />
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
                                    bg-theme-card border border-theme-strong rounded-2xl shadow-2xl">
                        {/* Close */}
                        <button onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white
                                       flex items-center justify-center border border-theme-strong hover:bg-white/10 transition-all">
                            <X size={16} />
                        </button>

                        {/* Image */}
                        <div className="h-56 overflow-hidden rounded-t-2xl">
                            <img src={selectedEvent.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=60'}
                                alt={selectedEvent.title}
                                className="w-full h-full object-cover" />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-600/20 text-primary-400">
                                    {selectedEvent.category}
                                </span>
                                <span className="text-slate-500 text-xs ml-auto">
                                    By {selectedEvent.organizer?.name || 'Organizer'}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-theme mb-3">{selectedEvent.title}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">{selectedEvent.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/[0.03] rounded-xl p-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Date & Time</p>
                                    <div className="flex items-center gap-2 text-white text-sm">
                                        <Calendar size={14} className="text-primary-500 shrink-0" />
                                        {formatDate(selectedEvent.date)}
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] rounded-xl p-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</p>
                                    <div className="flex items-center gap-2 text-white text-sm">
                                        <MapPin size={14} className="text-indigo-500 shrink-0" />
                                        <span className="truncate">{selectedEvent.location}</span>
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] rounded-xl p-4 col-span-2">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Ticket Price</p>
                                    <div className="flex items-center gap-2 text-white">
                                        <CreditCard size={14} className="text-emerald-500 shrink-0" />
                                        <span className="text-lg font-bold">
                                            {selectedEvent.price === 0 ? 'Free Entry' : `$${selectedEvent.price}.00`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking error/success + action */}
                            {(() => {
                                const isPast = selectedEvent && new Date(selectedEvent.date) < new Date();
                                const isFull = selectedEvent && (selectedEvent.availableSeats <= 0);
                                return (
                                    <>
                                        {booking.error && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                                                <AlertCircle size={14} /> {booking.error}
                                            </div>
                                        )}
                                        {booking.success && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                                                <CheckCircle size={14} /> Booking successful! Redirecting...
                                            </div>
                                        )}
                                        {isPast ? (
                                            <div className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-semibold text-sm text-center border border-slate-700">
                                                This event has already ended
                                            </div>
                                        ) : isFull ? (
                                            <div className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold text-sm text-center border border-red-500/20">
                                                Sold Out
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleBook(selectedEvent._id)}
                                                disabled={booking.loading || booking.success}
                                                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold
                                                           text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                                {booking.loading && <Loader2 size={16} className="animate-spin" />}
                                                {booking.success ? 'Booked!' : 'Secure Your Ticket'}
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
