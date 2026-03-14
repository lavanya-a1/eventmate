import { useState, useEffect } from 'react';
import { UserCheck, UserX, Trash2, ShieldCheck, BookOpen, Crown, User as UserIcon } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import AdminButton from '../components/ui/AdminButton';
import { toast } from '../components/ui/Toast';
import { getAdminUsers, updateUserRole, toggleUserBlock, deleteUser, getUserBookings } from '../api/adminApi';

const roleIcon = { admin: Crown, organizer: ShieldCheck, user: UserIcon };
const roleVariant = { admin: 'error', organizer: 'info', user: 'gray' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewUser, setViewUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminUsers();
        setUsers(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (_) {
        setUsers([]);
        toast.error('Failed to load users');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleViewBookings = async (user) => {
    setViewUser(user);
    setUserBookings([]);
    setBookingsLoading(true);
    try {
      const res = await getUserBookings(user._id);
      setUserBookings(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (_) {
      setUserBookings([]);
      toast.error('Failed to load booking history');
    }
    setBookingsLoading(false);
  };

  const handleRoleChange = async (user, role) => {
    try {
      await updateUserRole(user._id, role);
      setUsers(us => us.map(u => u._id === user._id ? { ...u, role } : u));
      toast.success(`Role updated to ${role}`);
    } catch (_) { toast.error('Failed to update role'); }
  };

  const handleBlock = async (user) => {
    try {
      await toggleUserBlock(user._id);
      setUsers(us => us.map(u => u._id === user._id ? { ...u, blocked: !u.blocked } : u));
      toast.success(user.blocked ? 'User unblocked' : 'User blocked');
    } catch (_) { toast.error('Operation failed'); }
  };

  const handleDelete = async (user) => {
    try {
      await deleteUser(user._id);
      setUsers(us => us.filter(u => u._id !== user._id));
      toast.success('User deleted');
    } catch (_) { toast.error('Failed to delete user'); }
    setDeleteTarget(null);
  };

  const displayed = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);
  const roleCounts = { all: users.length, admin: users.filter(u => u.role === 'admin').length, organizer: users.filter(u => u.role === 'organizer').length, user: users.filter(u => u.role === 'user').length };

  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-600/30 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0 border border-purple-500/20">
            {row.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white text-sm">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role', accessor: 'role',
      render: (row) => {
        const Icon = roleIcon[row.role] || UserIcon;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={roleVariant[row.role] || 'gray'}>
              <Icon size={10} />
              {row.role}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'status', label: 'Status', accessor: 'blocked',
      render: (row) => <Badge variant={row.blocked ? 'error' : 'success'}>{row.blocked ? 'Blocked' : 'Active'}</Badge>,
    },
    { key: 'bookings', label: 'Bookings', accessor: 'bookings', render: (row) => <span className="text-sm font-semibold text-white">{row.bookings}</span> },
    { key: 'joined', label: 'Joined', accessor: 'createdAt', render: (row) => <span className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <p className="text-sm text-slate-400 mt-0.5">{users.length} registered users</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'admin', 'organizer', 'user'].map(r => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
              filterRole === r
                ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/40'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)} ({roleCounts[r]})
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
        <DataTable
          columns={columns}
          data={displayed}
          loading={loading}
          searchPlaceholder="Search users..."
          emptyMessage="No users found"
          actions={(row) => (
            <>
              {/* Role change */}
              <select
                value={row.role}
                onChange={e => handleRoleChange(row, e.target.value)}
                onClick={e => e.stopPropagation()}
                className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500/50 cursor-pointer"
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={() => handleViewBookings(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                title="View bookings"
              >
                <BookOpen size={14} />
              </button>

              <button
                onClick={() => handleBlock(row)}
                title={row.blocked ? 'Unblock' : 'Block'}
                className={`p-1.5 rounded-lg transition-colors ${row.blocked ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}
              >
                {row.blocked ? <UserCheck size={14} /> : <UserX size={14} />}
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

      {/* Booking History Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title={`${viewUser?.name}'s Booking History`} size="md">
        {bookingsLoading ? (
          <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}</div>
        ) : userBookings.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No bookings found</p>
        ) : (
          <div className="space-y-3">
            {userBookings.map(b => (
              <div key={b._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{b.event}</p>
                  <p className="text-xs text-slate-400">{new Date(b.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">${b.amount}</p>
                  <Badge variant={b.status === 'confirmed' ? 'success' : 'error'} className="mt-1">{b.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Permanently delete <span className="font-semibold text-white">{deleteTarget?.name}</span>? All their data will be removed.
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
