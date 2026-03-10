import { useState, useEffect } from 'react';
import { BookOpen, Loader2, ChevronDown } from 'lucide-react';
import { getOrganizerEvents, getEventBookings } from '../api/organizerApi';
import { toast } from '../../admin/components/ui/Toast';

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CLS = {
  confirmed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  cancelled: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function OrganizerEventBookings() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Load organizer's events for the dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrganizerEvents({ limit: 200 });
        setEvents(res.data?.data || []);
      } catch {
        toast.error('Failed to load events');
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, []);

  // Load bookings when an event is selected
  useEffect(() => {
    if (!selectedEventId) { setBookings([]); return; }
    const load = async () => {
      setLoadingBookings(true);
      try {
        const res = await getEventBookings(selectedEventId);
        setBookings(res.data?.data || []);
      } catch {
        toast.error('Failed to load bookings');
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    load();
  }, [selectedEventId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Bookings</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">View bookings for each of your events</p>
      </div>

      {/* Event selector */}
      <div className="max-w-md">
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Select an event</label>
        <div className="relative">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={loadingEvents}
            className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          >
            <option value="">
              {loadingEvents ? 'Loading events…' : '— Choose an event —'}
            </option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} ({fmt(ev.date)})
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {!selectedEventId ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-500 gap-2">
            <BookOpen size={28} className="opacity-30" />
            <p className="text-sm">Select an event above to view its bookings</p>
          </div>
        ) : loadingBookings ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading bookings…</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-500 gap-2">
            <BookOpen size={28} className="opacity-30" />
            <p className="text-sm">No bookings for this event yet</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-left">
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Seats</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Booked At</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 text-xs font-medium text-gray-900 dark:text-white">{b.user?.name || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400 truncate max-w-[180px]">{b.user?.email || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-600 dark:text-slate-300">{b.seats ?? 1}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-gray-900 dark:text-white">${Number(b.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-slate-500">{fmt(b.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${STATUS_CLS[b.status] || STATUS_CLS.pending}`}>
                          {b.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
