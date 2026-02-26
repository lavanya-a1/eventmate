import { useState, useEffect } from 'react';
import { Bell, Send, Clock, Radio, Trash2, Plus } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import AdminButton from '../components/ui/AdminButton';
import { toast } from '../components/ui/Toast';
import { getAdminNotifications, broadcastNotification, scheduleReminder, deleteNotification } from '../api/adminApi';

const MOCK_NOTIFICATIONS = [
  { _id: 'n1', title: 'Event Reminder: Summer Music Fest', message: 'Don\'t forget! Your event starts in 24 hours.', type: 'reminder', audience: 'All attendees', sent: true, createdAt: '2026-02-24', readCount: 845, totalCount: 1200 },
  { _id: 'n2', title: 'New Event: AI Summit 2026', message: 'A new event has been added matching your interests.', type: 'broadcast', audience: 'Tech interest', sent: true, createdAt: '2026-02-22', readCount: 1100, totalCount: 2400 },
  { _id: 'n3', title: 'Payment Confirmation', message: 'Your booking for Tech Summit has been confirmed.', type: 'transactional', audience: 'Specified users', sent: true, createdAt: '2026-02-20', readCount: 250, totalCount: 250 },
  { _id: 'n4', title: 'Weekend Festival Reminder', message: 'This weekend\'s Jazz Night starts at 8PM.', type: 'reminder', audience: 'Jazz attendees', sent: false, createdAt: '2026-02-25', readCount: 0, totalCount: 145 },
];

const typeVariant = { broadcast: 'purple', reminder: 'amber', transactional: 'info' };

export default function NotificationsReminders() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sending, setSending] = useState(false);

  const [bForm, setBForm] = useState({ title: '', message: '', audience: 'all' });
  const [rForm, setRForm] = useState({ title: '', message: '', eventId: '', scheduledAt: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminNotifications();
        if (res.data?.data?.length) setNotifications(res.data.data);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      await broadcastNotification(bForm);
      setNotifications(ns => [{ _id: Date.now().toString(), ...bForm, type: 'broadcast', sent: true, createdAt: new Date().toISOString().split('T')[0], readCount: 0, totalCount: 0 }, ...ns]);
      toast.success('Broadcast sent successfully');
      setBroadcastModal(false); setBForm({ title: '', message: '', audience: 'all' });
    } catch (_) {
      toast.error('Failed to send broadcast');
    }
    setSending(false);
  };

  const handleScheduleReminder = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      await scheduleReminder(rForm);
      setNotifications(ns => [{ _id: Date.now().toString(), ...rForm, type: 'reminder', sent: false, createdAt: new Date().toISOString().split('T')[0], readCount: 0, totalCount: 0 }, ...ns]);
      toast.success('Reminder scheduled');
      setReminderModal(false); setRForm({ title: '', message: '', eventId: '', scheduledAt: '' });
    } catch (_) {
      toast.error('Failed to schedule reminder');
    }
    setSending(false);
  };

  const handleDelete = async (n) => {
    try {
      await deleteNotification(n._id);
      setNotifications(ns => ns.filter(x => x._id !== n._id));
      toast.success('Notification deleted');
    } catch (_) { toast.error('Failed to delete'); }
    setDeleteTarget(null);
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

  const columns = [
    {
      key: 'notification', label: 'Notification', sortable: false,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.title}</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{row.message}</p>
        </div>
      ),
    },
    { key: 'type', label: 'Type', accessor: 'type', render: (row) => <Badge variant={typeVariant[row.type] || 'gray'} className="capitalize">{row.type}</Badge> },
    { key: 'audience', label: 'Audience', accessor: 'audience', render: (row) => <span className="text-xs text-slate-300">{row.audience}</span> },
    {
      key: 'reach', label: 'Reach', sortable: false,
      render: (row) => {
        const pct = row.totalCount ? Math.round((row.readCount / row.totalCount) * 100) : 0;
        return (
          <div className="w-24">
            <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{row.readCount}/{row.totalCount}</span><span className="text-white">{pct}%</span></div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }} /></div>
          </div>
        );
      },
    },
    {
      key: 'status', label: 'Status', accessor: 'sent',
      render: (row) => <Badge variant={row.sent ? 'success' : 'warning'}>{row.sent ? 'Sent' : 'Scheduled'}</Badge>,
    },
    { key: 'date', label: 'Date', accessor: 'createdAt', render: (row) => <span className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  // Stats
  const sent = notifications.filter(n => n.sent).length;
  const scheduled = notifications.filter(n => !n.sent).length;
  const avgRead = notifications.filter(n => n.totalCount > 0).reduce((s, n) => s + (n.readCount / n.totalCount), 0) / (notifications.filter(n => n.totalCount > 0).length || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications & Reminders</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage broadcasts, reminders, and notification history</p>
        </div>
        <div className="flex gap-2">
          <AdminButton icon={Radio} variant="secondary" onClick={() => setBroadcastModal(true)}>Broadcast</AdminButton>
          <AdminButton icon={Clock} onClick={() => setReminderModal(true)}>Schedule Reminder</AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-2xl font-bold text-white">{sent}</p>
          <p className="text-xs text-slate-400 mt-1">Sent</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{scheduled}</p>
          <p className="text-xs text-slate-400 mt-1">Scheduled</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{(avgRead * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-400 mt-1">Avg Open Rate</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
        <DataTable
          columns={columns}
          data={notifications}
          loading={loading}
          searchPlaceholder="Search notifications..."
          actions={(row) => (
            <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      {/* Broadcast Modal */}
      <Modal isOpen={broadcastModal} onClose={() => setBroadcastModal(false)} title="Send Broadcast Notification" size="sm">
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div><label className={labelCls}>Title *</label><input required value={bForm.title} onChange={e => setBForm(f => ({...f, title: e.target.value}))} placeholder="Notification title" className={inputCls} /></div>
          <div><label className={labelCls}>Message *</label><textarea required rows={3} value={bForm.message} onChange={e => setBForm(f => ({...f, message: e.target.value}))} placeholder="Notification message..." className={inputCls + ' resize-none'} /></div>
          <div>
            <label className={labelCls}>Target Audience</label>
            <select value={bForm.audience} onChange={e => setBForm(f => ({...f, audience: e.target.value}))} className={inputCls}>
              <option value="all">All Users</option>
              <option value="attendees">Event Attendees</option>
              <option value="organizers">Organizers</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <AdminButton variant="secondary" onClick={() => setBroadcastModal(false)} type="button">Cancel</AdminButton>
            <AdminButton type="submit" loading={sending} icon={Send}>Send Broadcast</AdminButton>
          </div>
        </form>
      </Modal>

      {/* Reminder Modal */}
      <Modal isOpen={reminderModal} onClose={() => setReminderModal(false)} title="Schedule Event Reminder" size="sm">
        <form onSubmit={handleScheduleReminder} className="space-y-4">
          <div><label className={labelCls}>Reminder Title *</label><input required value={rForm.title} onChange={e => setRForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Event starts tomorrow!" className={inputCls} /></div>
          <div><label className={labelCls}>Message *</label><textarea required rows={3} value={rForm.message} onChange={e => setRForm(f => ({...f, message: e.target.value}))} placeholder="Reminder message..." className={inputCls + ' resize-none'} /></div>
          <div><label className={labelCls}>Schedule Date & Time *</label><input required type="datetime-local" value={rForm.scheduledAt} onChange={e => setRForm(f => ({...f, scheduledAt: e.target.value}))} className={inputCls} /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <AdminButton variant="secondary" onClick={() => setReminderModal(false)} type="button">Cancel</AdminButton>
            <AdminButton type="submit" loading={sending} icon={Clock}>Schedule</AdminButton>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Notification" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Delete notification <span className="font-semibold text-white">"{deleteTarget?.title}"</span>?</p>
          <div className="flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</AdminButton>
            <AdminButton variant="danger" icon={Trash2} onClick={() => handleDelete(deleteTarget)}>Delete</AdminButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
