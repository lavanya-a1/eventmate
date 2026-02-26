import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Calendar, MapPin, Users, Upload, X, ImageIcon } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import AdminButton from '../components/ui/AdminButton';
import { toast } from '../components/ui/Toast';
import { getAdminEvents, createEvent, updateEvent, deleteEvent, toggleEventStatus } from '../api/adminApi';

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Art', 'Business', 'Food & Drink', 'Education', 'Networking'];

const EMPTY_FORM = { title: '', description: '', category: '', date: '', time: '', venue: '', price: '', capacity: '', imageUrl: '', status: 'active' };

function EventForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [imgPreview, setImgPreview] = useState(initial?.image || '');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, imageFile });
    } catch (_) { /* handled by parent */ }
    setSaving(false);
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <label className={labelCls}>Event Image</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative cursor-pointer rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/40 transition-colors overflow-hidden"
          style={{ minHeight: 120 }}
        >
          {imgPreview ? (
            <div className="relative">
              <img src={imgPreview} alt="preview" className="w-full h-40 object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); setImgPreview(''); }} className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-500">
              <ImageIcon size={28} />
              <span className="text-xs">Click to upload image</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Title */}
      <div>
        <label className={labelCls}>Event Title *</label>
        <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Summer Music Festival" className={inputCls} />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe the event..." className={inputCls + ' resize-none'} />
      </div>

      {/* Row: category, status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category *</label>
          <select required value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
            <option value="">Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Row: date, time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date *</label>
          <input required type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Venue */}
      <div>
        <label className={labelCls}>Venue *</label>
        <input required value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Central Park, New York" className={inputCls} />
      </div>

      {/* Row: price, capacity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Price ($) *</label>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Capacity *</label>
          <input required type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="500" className={inputCls} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
        <AdminButton variant="secondary" onClick={onClose} type="button">Cancel</AdminButton>
        <AdminButton type="submit" loading={saving} icon={Plus}>
          {initial ? 'Save Changes' : 'Create Event'}
        </AdminButton>
      </div>
    </form>
  );
}

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const mapEvent = (e) => ({
    _id: e._id,
    title: e.title,
    description: e.description,
    category: e.category,
    date: e.date,
    venue: e.location,
    price: e.price,
    capacity: e.capacity,
    booked: typeof e.bookedSeats === 'number' ? e.bookedSeats : 0,
    status: e.status,
    image: e.image,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminEvents();
        const list = res.data?.data || [];
        setEvents(list.map(mapEvent));
      } catch (_) {
        toast.error('Failed to load events');
      }
      setLoading(false);
    };
    load();
  }, []);

  const displayed = filterStatus === 'all' ? events : events.filter(e => e.status === filterStatus);

  const handleSave = async (formData) => {
    const { imageFile, venue, ...rest } = formData;
    const payload = new FormData();

    Object.entries({
      ...rest,
      location: venue,
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        payload.append(key, value);
      }
    });

    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      if (editTarget) {
        const res = await updateEvent(editTarget._id, payload);
        const updated = mapEvent(res.data?.data || {});
        setEvents(evs => evs.map(e => e._id === updated._id ? updated : e));
        toast.success(res.data?.message || 'Event updated successfully');
      } else {
        const res = await createEvent(payload);
        const created = mapEvent(res.data?.data || {});
        setEvents(evs => [created, ...evs]);
        toast.success(res.data?.message || 'Event created successfully');
      }
      setModalOpen(false); setEditTarget(null);
    } catch (_) {
      toast.error('Failed to save event');
    }
  };

  const handleToggle = async (event) => {
    try {
      await toggleEventStatus(event._id);
      setEvents(evs => evs.map(e => e._id === event._id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e));
      toast.success(`Event ${event.status === 'active' ? 'deactivated' : 'activated'}`);
    } catch (_) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (event) => {
    try {
      await deleteEvent(event._id);
      setEvents(evs => evs.filter(e => e._id !== event._id));
      toast.success('Event deleted');
    } catch (_) {
      toast.error('Failed to delete event');
    }
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'event',
      label: 'Event',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt="" className="w-12 h-8 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />
          ) : (
            <div className="w-12 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-slate-500" />
            </div>
          )}
          <div>
            <p className="font-medium text-white text-sm leading-tight">{row.title}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} />{row.venue}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', accessor: 'category', render: (row) => <Badge variant="purple">{row.category}</Badge> },
    { key: 'date', label: 'Date', accessor: 'date', render: (row) => <span className="text-xs">{new Date(row.date).toLocaleDateString()}</span> },
    { key: 'price', label: 'Price', accessor: 'price', render: (row) => <span className="font-semibold text-emerald-400">${row.price}</span> },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: false,
      render: (row) => {
        const pct = Math.min(100, Math.round((row.booked / row.capacity) * 100));
        return (
          <div className="w-28">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{row.booked}/{row.capacity}</span>
              <span className={pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-emerald-400'}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status', label: 'Status', accessor: 'status',
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'gray'}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{events.length} total events</p>
        </div>
        <AdminButton icon={Plus} onClick={() => { setEditTarget(null); setModalOpen(true); }}>
          Create Event
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'inactive'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
              filterStatus === s
                ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/40'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {s === 'all' ? `All (${events.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${events.filter(e => e.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
        <DataTable
          columns={columns}
          data={displayed}
          loading={loading}
          searchPlaceholder="Search events..."
          emptyMessage="No events found"
          actions={(row) => (
            <>
              <button
                onClick={() => handleToggle(row)}
                title={row.status === 'active' ? 'Deactivate' : 'Activate'}
                className={`p-1.5 rounded-lg transition-colors ${row.status === 'active' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/10'}`}
              >
                {row.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </button>
              <button
                onClick={() => { setEditTarget(row); setModalOpen(true); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteTarget(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} title={editTarget ? 'Edit Event' : 'Create New Event'} size="md">
        <EventForm initial={editTarget} onSave={handleSave} onClose={() => { setModalOpen(false); setEditTarget(null); }} />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Event" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-white">"{deleteTarget?.title}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</AdminButton>
            <AdminButton variant="danger" icon={Trash2} onClick={() => handleDelete(deleteTarget)}>Delete</AdminButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
