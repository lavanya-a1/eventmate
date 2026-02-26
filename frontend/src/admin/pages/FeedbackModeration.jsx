import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import AdminButton from '../components/ui/AdminButton';
import Modal from '../components/ui/Modal';
import { toast } from '../components/ui/Toast';
import { getAdminFeedback, moderateFeedback, deleteFeedback } from '../api/adminApi';

const MOCK_FEEDBACK = [
  { _id: 'f1', user: 'Alice Johnson', event: 'Summer Music Fest', rating: 5, comment: 'Absolutely amazing! Best event of the year. Highly recommend to everyone!', status: 'pending', createdAt: '2026-02-10' },
  { _id: 'f2', user: 'Bob Smith', event: 'Tech Summit 2026', rating: 4, comment: 'Great talks but venue was a bit crowded. Overall good experience.', status: 'approved', createdAt: '2026-02-12' },
  { _id: 'f3', user: 'Clara Davis', event: 'Jazz Night Live', rating: 5, comment: 'Perfect evening! The performers were world class. Will come back!', status: 'approved', createdAt: '2026-02-14' },
  { _id: 'f4', user: 'Dan Miller', event: 'Half Marathon', rating: 2, comment: 'Terrible organization. Long queues, no water stations. Very disappointed.', status: 'pending', createdAt: '2026-02-15' },
  { _id: 'f5', user: 'Eva Grant', event: 'Summer Music Fest', rating: 5, comment: 'Incredible experience from start to finish. Five stars all around!', status: 'approved', createdAt: '2026-02-16' },
  { _id: 'f6', user: 'Frank Lee', event: 'AI & Future Conf', rating: 1, comment: 'Spam content - buy products at [link]', status: 'rejected', createdAt: '2026-02-17' },
];

const RATING_DISTRIBUTION = [
  { rating: '5★', count: 18 },
  { rating: '4★', count: 12 },
  { rating: '3★', count: 6 },
  { rating: '2★', count: 3 },
  { rating: '1★', count: 2 },
];

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12} className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
      ))}
    </div>
  );
}

export default function FeedbackModeration() {
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewItem, setViewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminFeedback();
        if (res.data?.data?.length) setFeedback(res.data.data);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleModerate = async (item, status) => {
    try {
      await moderateFeedback(item._id, status);
      setFeedback(fs => fs.map(f => f._id === item._id ? { ...f, status } : f));
      toast.success(`Review ${status}`);
      if (viewItem?._id === item._id) setViewItem({ ...item, status });
    } catch (_) {
      toast.error('Failed to moderate review');
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteFeedback(item._id);
      setFeedback(fs => fs.filter(f => f._id !== item._id));
      toast.success('Review deleted');
    } catch (_) { toast.error('Failed to delete'); }
    setDeleteTarget(null);
  };

  const displayed = filterStatus === 'all' ? feedback : feedback.filter(f => f.status === filterStatus);
  const avgRating = (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1);
  const topEvents = ['Summer Music Fest', 'Jazz Night Live', 'Tech Summit 2026'];

  const columns = [
    {
      key: 'user', label: 'User / Event', sortable: false,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.user}</p>
          <p className="text-xs text-slate-500">{row.event}</p>
        </div>
      ),
    },
    {
      key: 'rating', label: 'Rating', accessor: 'rating',
      render: (row) => (
        <div className="flex items-center gap-2">
          <StarRating value={row.rating} />
          <span className="text-xs text-slate-400">{row.rating}/5</span>
        </div>
      ),
    },
    {
      key: 'comment', label: 'Comment', sortable: false,
      render: (row) => (
        <p className="text-xs text-slate-300 max-w-xs truncate">{row.comment}</p>
      ),
    },
    {
      key: 'status', label: 'Status', accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'error' : 'warning'} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    { key: 'date', label: 'Date', accessor: 'createdAt', render: (row) => <span className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Feedback Moderation</h2>
        <p className="text-sm text-slate-400 mt-0.5">Review, approve, and moderate user feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="space-y-4">
          {/* Avg rating */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <p className="text-xs text-slate-400 mb-2">Average Rating</p>
            <p className="text-4xl font-bold text-amber-400">{avgRating}</p>
            <div className="flex justify-center mt-2"><StarRating value={Math.round(parseFloat(avgRating))} /></div>
            <p className="text-xs text-slate-500 mt-2">{feedback.length} total reviews</p>
          </div>

          {/* Rating distribution */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Rating Distribution</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={RATING_DISTRIBUTION} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="rating" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #ffffff15', borderRadius: 10, fontSize: 11 }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top rated */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Top Rated Events</h4>
            <div className="space-y-2">
              {topEvents.map((e, i) => (
                <div key={e} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 w-4">#{i+1}</span>
                  <span className="text-xs text-slate-300 flex-1">{e}</span>
                  <StarRating value={5 - i * 0.5 >= 4 ? 5 : 4} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filterStatus === s ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/40' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                {s === 'all' ? `All (${feedback.length})` : `${s} (${feedback.filter(f => f.status === s).length})`}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
            <DataTable
              columns={columns}
              data={displayed}
              loading={loading}
              searchPlaceholder="Search feedback..."
              actions={(row) => (
                <>
                  <button onClick={() => setViewItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs px-2">View</button>
                  {row.status !== 'approved' && (
                    <button onClick={() => handleModerate(row, 'approved')} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {row.status !== 'rejected' && (
                    <button onClick={() => handleModerate(row, 'rejected')} className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors">
                      <XCircle size={14} />
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            />
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Review Details" size="sm">
        {viewItem && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">{viewItem.user}</p>
                <p className="text-xs text-slate-400">{viewItem.event}</p>
              </div>
              <Badge variant={viewItem.status === 'approved' ? 'success' : viewItem.status === 'rejected' ? 'error' : 'warning'}>
                {viewItem.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={viewItem.rating} />
              <span className="text-sm text-white font-semibold">{viewItem.rating}/5</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-slate-300 leading-relaxed">"{viewItem.comment}"</p>
            </div>
            <p className="text-xs text-slate-500">{new Date(viewItem.createdAt).toLocaleDateString()}</p>
            {viewItem.status === 'pending' && (
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <AdminButton variant="success" icon={CheckCircle} className="flex-1" onClick={() => handleModerate(viewItem, 'approved')}>Approve</AdminButton>
                <AdminButton variant="danger" icon={XCircle} className="flex-1" onClick={() => handleModerate(viewItem, 'rejected')}>Reject</AdminButton>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Review" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Permanently delete this review by <span className="font-semibold text-white">{deleteTarget?.user}</span>?</p>
          <div className="flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</AdminButton>
            <AdminButton variant="danger" icon={Trash2} onClick={() => handleDelete(deleteTarget)}>Delete</AdminButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
