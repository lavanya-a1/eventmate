import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, RefreshCw,
  Calendar, Filter
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import KPICard from '../components/ui/KPICard';
import { getPayments } from '../api/adminApi';

const MOCK_PAYMENTS = [
  { _id: 'p001', user: 'Alice Johnson', event: 'Summer Music Fest', amount: 178, mode: 'Card', status: 'success', txnId: 'TXN8821', date: '2026-02-10' },
  { _id: 'p002', user: 'Bob Smith', event: 'Tech Summit 2026', amount: 299, mode: 'UPI', status: 'success', txnId: 'TXN8822', date: '2026-02-12' },
  { _id: 'p003', user: 'Clara Davis', event: 'Jazz Night', amount: 165, mode: 'Wallet', status: 'refunded', txnId: 'TXN8823', date: '2026-02-14' },
  { _id: 'p004', user: 'Dan Miller', event: 'Half Marathon', amount: 40, mode: 'Net Banking', status: 'pending', txnId: 'TXN8824', date: '2026-02-15' },
  { _id: 'p005', user: 'Eva Grant', event: 'Summer Music Fest', amount: 356, mode: 'Card', status: 'success', txnId: 'TXN8825', date: '2026-02-16' },
  { _id: 'p006', user: 'Frank Lee', event: 'AI & Future Conf', amount: 450, mode: 'Card', status: 'failed', txnId: 'TXN8826', date: '2026-02-17' },
];

const REVENUE_TREND = [
  { month: 'Aug', revenue: 8400, transactions: 95 },
  { month: 'Sep', revenue: 11200, transactions: 126 },
  { month: 'Oct', revenue: 12800, transactions: 144 },
  { month: 'Nov', revenue: 9600, transactions: 108 },
  { month: 'Dec', revenue: 18200, transactions: 205 },
  { month: 'Jan', revenue: 15400, transactions: 173 },
  { month: 'Feb', revenue: 21800, transactions: 245 },
];

const MODE_BREAKDOWN = [
  { name: 'Card', value: 48, color: '#a855f7' },
  { name: 'UPI', value: 27, color: '#6366f1' },
  { name: 'Wallet', value: 15, color: '#06b6d4' },
  { name: 'Net Banking', value: 10, color: '#f59e0b' },
];

const statusVariant = { success: 'success', pending: 'warning', refunded: 'info', failed: 'error' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function PaymentMonitoring() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPayments();
        if (res.data?.data?.length) setPayments(res.data.data);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const avgTxn = payments.length ? Math.round(totalRevenue / payments.filter(p => p.status === 'success').length) : 0;

  const displayed = payments.filter(p => {
    if (filterMode !== 'all' && p.mode !== filterMode) return false;
    if (dateFrom && p.date < dateFrom) return false;
    if (dateTo && p.date > dateTo) return false;
    return true;
  });

  const inputCls = 'px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all';

  const columns = [
    { key: 'txn', label: 'Txn ID', accessor: 'txnId', render: (row) => <span className="font-mono text-xs text-purple-300">{row.txnId}</span> },
    {
      key: 'user', label: 'User / Event', sortable: false,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.user}</p>
          <p className="text-xs text-slate-500">{row.event}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Amount', accessor: 'amount', render: (row) => <span className="font-bold text-emerald-400">${row.amount}</span> },
    { key: 'mode', label: 'Mode', accessor: 'mode', render: (row) => <Badge variant="info">{row.mode}</Badge> },
    { key: 'status', label: 'Status', accessor: 'status', render: (row) => <Badge variant={statusVariant[row.status] || 'gray'}>{row.status}</Badge> },
    { key: 'date', label: 'Date', accessor: 'date', render: (row) => <span className="text-xs text-slate-400">{new Date(row.date).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Payment Monitoring</h2>
        <p className="text-sm text-slate-400 mt-0.5">Transaction overview and revenue analytics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" trendLabel="confirmed payments" />
        <KPICard title="Transactions" value={payments.length} icon={CreditCard} color="purple" trendLabel="all time" />
        <KPICard title="Avg Transaction" value={`$${avgTxn}`} icon={TrendingUp} color="blue" trendLabel="per booking" />
        <KPICard title="Refunds" value={payments.filter(p => p.status === 'refunded').length} icon={RefreshCw} color="amber" trendLabel="this period" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-white">Revenue Trend</h3>
            <p className="text-xs text-slate-400">Monthly revenue over last 7 months</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_TREND} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" name="revenue" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-white">Payment Modes</h3>
            <p className="text-xs text-slate-400">Distribution by method</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={MODE_BREAKDOWN} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid #ffffff15', borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {MODE_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {MODE_BREAKDOWN.map(m => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: m.color }} /><span className="text-slate-300">{m.name}</span></div>
                <span className="font-semibold text-white">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-slate-400"><Filter size={14} /><span className="font-medium">Filters</span></div>
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className={inputCls}>
            <option value="all">All Modes</option>
            {['Card', 'UPI', 'Wallet', 'Net Banking'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-slate-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} />
            <span className="text-slate-500 text-xs">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} />
          </div>
          {(filterMode !== 'all' || dateFrom || dateTo) && (
            <button onClick={() => { setFilterMode('all'); setDateFrom(''); setDateTo(''); }} className="text-xs text-slate-400 hover:text-white transition-colors">Clear</button>
          )}
        </div>
        <DataTable columns={columns} data={displayed} loading={loading} searchPlaceholder="Search transactions..." />
      </div>
    </div>
  );
}
