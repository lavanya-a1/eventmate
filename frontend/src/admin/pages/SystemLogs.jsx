import { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertCircle, Info, AlertTriangle, Terminal as TerminalIcon, Filter } from 'lucide-react';
import AdminButton from '../components/ui/AdminButton';
import { getSystemLogs } from '../api/adminApi';
import { toast } from '../components/ui/Toast';

const levelConfig = {
  info: { icon: Info, variant: 'info', text: 'text-blue-400' },
  warn: { icon: AlertTriangle, variant: 'warning', text: 'text-amber-400' },
  error: { icon: AlertCircle, variant: 'error', text: 'text-red-400' },
};

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const modules = ['all', ...new Set(logs.map(l => l.module).filter(Boolean))];

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getSystemLogs({ level: filterLevel !== 'all' ? filterLevel : undefined });
      setLogs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (_) {
      setLogs([]);
      toast.error('Failed to load system logs');
    }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleExport = () => {
    const txt = displayed.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.module}] ${l.message}`).join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'system-logs.txt'; a.click();
  };

  const displayed = logs.filter(l => {
    if (filterLevel !== 'all' && l.level !== filterLevel) return false;
    if (filterModule !== 'all' && l.module !== filterModule) return false;
    return true;
  });

  const counts = { all: logs.length, info: logs.filter(l => l.level === 'info').length, warn: logs.filter(l => l.level === 'warn').length, error: logs.filter(l => l.level === 'error').length };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">System Logs</h2>
          <p className="text-sm text-slate-400 mt-0.5">{logs.length} log entries — server activity monitor</p>
        </div>
        <div className="flex gap-2">
          <AdminButton icon={RefreshCw} variant="secondary" onClick={handleRefresh} loading={refreshing}>
            Refresh
          </AdminButton>
          <AdminButton icon={Download} variant="secondary" onClick={handleExport}>
            Export
          </AdminButton>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'Total', color: 'text-white' },
          { key: 'info', label: 'Info', color: 'text-blue-400' },
          { key: 'warn', label: 'Warnings', color: 'text-amber-400' },
          { key: 'error', label: 'Errors', color: 'text-red-400' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilterLevel(key)}
            className={`rounded-xl border p-3 text-center transition-all ${filterLevel === key ? 'border-purple-500/40 bg-purple-600/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'}`}
          >
            <p className={`text-xl font-bold ${color}`}>{counts[key]}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-slate-400"><Filter size={14} /></div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-purple-500/50 transition-all capitalize">
            {modules.map(m => <option key={m} value={m}>{m === 'all' ? 'All Modules' : m}</option>)}
        </select>
        {(filterLevel !== 'all' || filterModule !== 'all') && (
          <button onClick={() => { setFilterLevel('all'); setFilterModule('all'); }} className="text-xs text-slate-400 hover:text-white transition-colors">Clear filters</button>
        )}
      </div>

      {/* Log terminal */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 ml-2 text-xs text-slate-400">
            <TerminalIcon size={12} />
            <span>system.log — EventMate Admin</span>
          </div>
        </div>

        {/* Log entries */}
        <div className="p-4 space-y-1.5 max-h-[520px] overflow-y-auto admin-scroll font-mono text-xs">
          {loading ? (
            <div className="space-y-2 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-5 bg-white/5 rounded" />)}</div>
          ) : displayed.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No logs matching current filters</p>
          ) : (
            displayed.map(log => {
              const { icon: Icon, text } = levelConfig[log.level] || levelConfig.info;
              return (
                <div key={log._id || log.id || `${log.timestamp}-${log.message}`} className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors ${log.level === 'error' ? 'bg-red-500/5' : log.level === 'warn' ? 'bg-amber-500/5' : ''}`}>
                  <Icon size={13} className={`${text} flex-shrink-0 mt-px`} />
                  <span className="text-slate-500 flex-shrink-0 w-40 text-[10px]">
                    {new Date(log.timestamp).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={`flex-shrink-0 w-20 ${text} text-[10px] uppercase font-bold`}>[{log.module}]</span>
                  <span className={`flex-1 leading-relaxed ${log.level === 'error' ? 'text-red-300' : log.level === 'warn' ? 'text-amber-200/80' : 'text-slate-300'}`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
