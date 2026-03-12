import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Users, Tag, Loader2, AlertCircle,
  Clock, Eye, DollarSign, BarChart3,
} from 'lucide-react';
import { getOrganizerEvents } from '../api/organizerApi';
import Badge from '../../admin/components/ui/Badge';

export default function OrganizerEventPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrganizerEvents({ limit: 200 });
        const list = res.data?.data || [];
        const found = list.find(e => e._id === id);
        setEvent(found || null);
      } catch {
        setEvent(null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={48} className="text-slate-500" />
        <p className="text-lg font-semibold text-slate-300">Event not found</p>
        <button onClick={() => navigate('/organizer/events')} className="text-sm text-indigo-400 hover:underline">
          Back to My Events
        </button>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const booked = typeof event.bookedSeats === 'number' ? event.bookedSeats : 0;
  const capacity = event.capacity || 0;
  const available = Math.max(0, capacity - booked);
  const pct = capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <button
        onClick={() => navigate('/organizer/events')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to My Events
      </button>

      {/* Preview banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
        <Eye size={16} className="text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-300">Organizer Preview — This is how attendees see your event</span>
      </div>

      {/* Hero image */}
      {event.image && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-white/10"
        >
          <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
        </motion.div>
      )}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8"
      >
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {event.category && <Badge variant="purple">{event.category}</Badge>}
          <Badge variant={event.status === 'active' ? 'success' : 'gray'}>{event.status}</Badge>
          {isPast && <Badge variant="gray">Past Event</Badge>}
          {!isPast && available <= 0 && <Badge variant="danger">Sold Out</Badge>}
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-6">{event.title}</h1>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <InfoTile
            icon={<Calendar size={20} className="text-indigo-400" />}
            label="Date & Time"
            value={new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
            color="indigo"
          />
          <InfoTile
            icon={<MapPin size={20} className="text-violet-400" />}
            label="Location"
            value={event.location || event.venue || '—'}
            color="violet"
          />
          <InfoTile
            icon={<DollarSign size={20} className="text-emerald-400" />}
            label="Price"
            value={event.price === 0 ? 'Free' : `$${Number(event.price).toFixed(2)}`}
            color="emerald"
          />
          <InfoTile
            icon={<Users size={20} className="text-amber-400" />}
            label="Seats Left"
            value={`${available} / ${capacity}`}
            color="amber"
          />
        </div>

        {/* Capacity bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <BarChart3 size={13} /> Booking Progress
            </span>
            <span className={`text-xs font-bold ${pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {booked} booked — {pct}%
            </span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3">About this Event</h2>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function InfoTile({ icon, label, value, color }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-${color}-500/5 border border-${color}-500/10`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
