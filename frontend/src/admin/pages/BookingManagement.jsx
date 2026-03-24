import { useState, useEffect } from 'react';
import { XCircle, Download, Calendar, User, MapPin, Hash } from 'lucide-react';
import { logError } from '../../utils/errorLogger';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import AdminButton from '../components/ui/AdminButton';
import { toast } from '../components/ui/Toast';
import { getAdminBookings, cancelBooking, exportBookings } from '../api/adminApi';

const MOCK_BOOKINGS = [
  { _id: 'b001', user: 'Alice Johnson', email: 'alice@example.com', event: 'Summer Music Fest', date: '2026-07-15', seats: 2, amount: 178, status: 'confirmed', paymentMode: 'Card', createdAt: '2026-02-10' },
  { _id: 'b002', user: 'Bob Smith', email: 'bob@example.com', event: 'Tech Summit 2026', date: '2026-08-20', seats: 1, amount: 299, status: 'confirmed', paymentMode: 'UPI', createdAt: '2026-02-12' },
  { _id: 'b003', user: 'Clara Davis', email: 'clara@example.com', event: 'Jazz Night Live', date: '2026-06-10', seats: 3, amount: 165, status: 'cancelled', paymentMode: 'Wallet', createdAt: '2026-02-14' },
  { _id: 'b004', user: 'Dan Miller', email: 'dan@example.com', event: 'Half Marathon', date: '2026-05-30', seats: 1, amount: 40, status: 'pending', paymentMode: 'Net Banking', createdAt: '2026-02-15' },
  { _id: 'b005', user: 'Eva Grant', email: 'eva@example.com', event: 'Summer Music Fest', date: '2026-07-15', seats: 4, amount: 356, status: 'confirmed', paymentMode: 'Card', createdAt: '2026-02-16' },
  { _id: 'b006', user: 'Frank Lee', email: 'frank@example.com', event: 'AI & Future Conf', date: '2026-09-05', seats: 1, amount: 450, status: 'refunded', paymentMode: 'Card', createdAt: '2026-02-17' },
];

const statusVariant = { confirmed: 'success', cancelled: 'error', pending: 'warning', refunded: 'info' };

export default function BookingManagement() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminBookings();
        if (res.data?.data?.length) setBookings(res.data.data);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (booking) => {
    try {
      await cancelBooking(booking._id);
      setBookings(bs => bs.map(b => b._id === booking._id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (_) { toast.error('Failed to cancel booking'); }
    setCancelTarget(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportBookings();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
      toast.success('Report exported');
    } catch (err) {
      logError('BookingManagement.exportBookings', err);
      // Fallback: generate CSV from current data
      const csv = ['ID,User,Email,Event,Date,Seats,Amount,Status,Payment',
        ...bookings.map(b => `${b._id},${b.user},${b.email},${b.event},${b.date},${b.seats},${b.amount},${b.status},${b.paymentMode}`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
      toast.success('Report exported (local)');
    }
    setExporting(false);
  };

  const displayed = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);
  const total = bookings.reduce((s, b) => s + (b.status === 'confirmed' ? b.amount : 0), 0);

  const columns = [
    {
      key: 'booking',
      label: 'Booking',
      sortable: false,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
            <Hash size={9} /><span className="font-mono">{row._id}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {row.user?.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{row.user}</p>
              <p className="text-xs text-slate-500">{row.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'event', label: 'Event', accessor: 'event',
      render: (row) => (
        <div>
          <p className="text-sm text-white">{row.event}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={10} />{new Date(row.date).toLocaleDateString()}</p>
        </div>
      ),
    },
    { key: 'seats', label: 'Seats', accessor: 'seats', render: (row) => <span className="text-center font-semibold text-white">{row.seats}</span> },
    { key: 'amount', label: 'Amount', accessor: 'amount', render: (row) => <span className="font-semibold text-emerald-400">${row.amount}</span> },
    { key: 'mode', label: 'Payment', accessor: 'paymentMode', render: (row) => <Badge variant="info">{row.paymentMode}</Badge> },
    { key: 'status', label: 'Status', accessor: 'status', render: (row) => <Badge variant={statusVariant[row.status] || 'gray'}>{row.status}</Badge> },
    { key: 'booked', label: 'Booked On', accessor: 'createdAt', render: (row) => <span className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Booking Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{bookings.length} total bookings · <span className="text-emerald-400 font-medium">${total.toLocaleString()} confirmed revenue</span></p>
        </div>
        <AdminButton icon={Download} variant="secondary" onClick={handleExport} loading={exporting}>
          Export CSV
        </AdminButton>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['confirmed', 'pending', 'cancelled', 'refunded'].map(s => {
          const count = bookings.filter(b => b.status === s).length;
          const rev = bookings.filter(b => b.status === s).reduce((a, b) => a + b.amount, 0);
          const colors = { confirmed: 'text-emerald-400', pending: 'text-amber-400', cancelled: 'text-red-400', refunded: 'text-blue-400' };
          return (
            <div key={s} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-400 capitalize mb-1">{s}</p>
              <p className={`text-2xl font-bold ${colors[s]}`}>{count}</p>
              <p className="text-xs text-slate-500">${rev.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'confirmed', 'pending', 'cancelled', 'refunded'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filterStatus === s ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/40' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
            {s === 'all' ? `All (${bookings.length})` : `${s} (${bookings.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
        <DataTable
          columns={columns}
          data={displayed}
          loading={loading}
          searchPlaceholder="Search bookings..."
          actions={(row) => (
            row.status === 'confirmed' ? (
              <button onClick={() => setCancelTarget(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Cancel booking">
                <XCircle size={14} />
              </button>
            ) : null
          )}
        />
      </div>

      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Booking" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Cancel booking <span className="font-mono text-white text-xs">{cancelTarget?._id}</span> for <span className="font-semibold text-white">{cancelTarget?.user}</span>?</p>
          <div className="flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setCancelTarget(null)}>No</AdminButton>
            <AdminButton variant="danger" icon={XCircle} onClick={() => handleCancel(cancelTarget)}>Cancel Booking</AdminButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
