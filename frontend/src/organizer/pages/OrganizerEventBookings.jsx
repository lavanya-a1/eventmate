import { useState, useEffect } from 'react';
import { BookOpen, Loader2, ChevronDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getOrganizerEvents, getEventBookings, exportEventAttendees } from '../api/organizerApi';
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
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

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
    if (!selectedEventId) {
      setBookings([]);
      setTotalBookings(0);
      setTotalPages(1);
      return;
    }
    const load = async () => {
      setLoadingBookings(true);
      try {
        const res = await getEventBookings(selectedEventId, { page, limit });
        setBookings(res.data?.data || []);
        setTotalBookings(Number(res.data?.total) || 0);
        setTotalPages(Math.max(Number(res.data?.pages) || 1, 1));
      } catch {
        toast.error('Failed to load bookings');
        setBookings([]);
        setTotalBookings(0);
        setTotalPages(1);
      } finally {
        setLoadingBookings(false);
      }
    };
    load();
  }, [selectedEventId, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [selectedEventId]);

  const pageStart = totalBookings === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = totalBookings === 0 ? 0 : Math.min(page * limit, totalBookings);

  const handleExportAttendees = async () => {
    if (!selectedEventId) return;
    setExporting(true);
    try {
      const res = await exportEventAttendees(selectedEventId);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const selectedEvent = events.find((ev) => ev._id === selectedEventId);
      const slug = String(selectedEvent?.title || selectedEventId)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'event';

      const a = document.createElement('a');
      a.href = url;
      a.download = `attendees-${slug}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Attendee list exported');
    } catch {
      toast.error('Failed to export attendee list');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Bookings</h2>
        <button
          type="button"
          onClick={handleExportAttendees}
          disabled={!selectedEventId || exporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          Export Attendees CSV
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">View bookings for each of your events</p>
      </div>

      {/* Event selector */}
      <div className="max-w-md">
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Select an event</label>
        <div className="relative">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setPage(1);
            }}
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
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Showing {pageStart}-{pageEnd} of {totalBookings}
              </p>
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
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1 || loadingBookings}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages || loadingBookings}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
