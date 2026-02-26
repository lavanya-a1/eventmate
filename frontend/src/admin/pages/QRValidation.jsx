import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, Search, RefreshCw, Camera, ScanLine } from 'lucide-react';
import Badge from '../components/ui/Badge';
import AdminButton from '../components/ui/AdminButton';
import { toast } from '../components/ui/Toast';
import { validateQR } from '../api/adminApi';

const MOCK_ATTENDANCE = [
  { id: 'TKT-2826-001', name: 'Alice Johnson', event: 'Summer Music Fest', seat: 'A14', status: 'checked-in', time: '18:32' },
  { id: 'TKT-2826-002', name: 'Bob Smith', event: 'Summer Music Fest', seat: 'B07', status: 'checked-in', time: '18:45' },
  { id: 'TKT-2826-003', name: 'Clara Davis', event: 'Summer Music Fest', seat: 'C22', status: 'pending', time: '-' },
  { id: 'TKT-2826-004', name: 'Dan Miller', event: 'Summer Music Fest', seat: 'A03', status: 'invalid', time: '-' },
  { id: 'TKT-2826-005', name: 'Eva Grant', event: 'Summer Music Fest', seat: 'D11', status: 'checked-in', time: '19:01' },
];

export default function QRValidation() {
  const [ticketId, setTicketId] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);

  const handleValidate = async (e) => {
    e?.preventDefault?.();
    if (!ticketId.trim()) return;
    setValidating(true);
    setResult(null);
    try {
      const res = await validateQR(ticketId);
      const data = res.data?.data;
      setResult({ success: true, ticket: data || { id: ticketId, name: 'John Doe', event: 'Summer Music Fest', seat: 'B12', status: 'valid' } });
      setAttendance(prev => prev.map(a => a.id === ticketId ? { ...a, status: 'checked-in', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : a));
      toast.success('Ticket validated successfully');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setResult({ success: false, message: 'Ticket not found' });
        toast.error('Invalid ticket ID');
      } else if (status === 409) {
        setResult({ success: false, message: 'Ticket already used' });
        toast.warning('Ticket already checked in');
      } else {
        // Simulate for demo
        const mockTicket = MOCK_ATTENDANCE.find(a => a.id === ticketId);
        if (mockTicket) {
          setResult({ success: mockTicket.status !== 'invalid', ticket: mockTicket, message: mockTicket.status === 'invalid' ? 'Ticket is invalid' : undefined });
          if (mockTicket.status !== 'invalid') toast.success('Ticket validated');
          else toast.error('Invalid ticket');
        } else {
          setResult({ success: false, message: 'Ticket not found in system' });
          toast.error('Ticket not found');
        }
      }
    }
    setValidating(false);
  };

  const checkedIn = attendance.filter(a => a.status === 'checked-in').length;
  const total = attendance.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">QR Ticket Validation</h2>
        <p className="text-sm text-slate-400 mt-0.5">Scan and verify event tickets in real time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Interface */}
        <div className="space-y-5">
          {/* Camera placeholder */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            <div className="relative h-64 bg-slate-800/50 flex items-center justify-center">
              {/* Scan animation */}
              <div className="absolute inset-6 border-2 border-purple-500/40 rounded-xl">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan" />
              </div>
              <div className="text-center z-10">
                <Camera size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Camera scanner</p>
                <p className="text-xs text-slate-600">Position QR code in frame</p>
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleValidate} className="flex gap-2">
                <div className="relative flex-1">
                  <ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={ticketId}
                    onChange={e => setTicketId(e.target.value)}
                    placeholder="Enter or scan ticket ID..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
                <AdminButton type="submit" loading={validating} icon={Search} size="md">
                  Validate
                </AdminButton>
              </form>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl border p-5 flex items-start gap-4 ${result.success ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
              {result.success ? (
                <CheckCircle size={36} className="text-emerald-400 flex-shrink-0 mt-1" />
              ) : (
                <XCircle size={36} className="text-red-400 flex-shrink-0 mt-1" />
              )}
              <div>
                <p className={`text-lg font-bold mb-1 ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.success ? '✓ Valid Ticket' : '✗ Invalid Ticket'}
                </p>
                {result.success && result.ticket ? (
                  <div className="space-y-0.5 text-sm text-slate-300">
                    <p><span className="text-slate-500">Name:</span> {result.ticket.name}</p>
                    <p><span className="text-slate-500">Event:</span> {result.ticket.event}</p>
                    <p><span className="text-slate-500">Seat:</span> {result.ticket.seat}</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-300">{result.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Attendance</h3>
              <p className="text-xs text-slate-400">Summer Music Fest · Today</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{checkedIn}<span className="text-slate-500 text-sm">/{total}</span></p>
              <p className="text-xs text-slate-400">checked in</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Attendance rate</span>
              <span className="font-semibold text-white">{Math.round((checkedIn / total) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(checkedIn / total) * 100}%` }} />
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-72 overflow-y-auto admin-scroll">
            {attendance.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === 'checked-in' ? 'bg-emerald-400' : a.status === 'invalid' ? 'bg-red-400' : 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{a.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{a.id} · Seat {a.seat}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={a.status === 'checked-in' ? 'success' : a.status === 'invalid' ? 'error' : 'gray'}>
                    {a.status}
                  </Badge>
                  {a.time !== '-' && <p className="text-[10px] text-slate-500 mt-0.5">{a.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
