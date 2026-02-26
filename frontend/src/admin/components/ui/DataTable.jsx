import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { clsx } from 'clsx';

export default function DataTable({
  columns,
  data,
  loading,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  emptyMessage = 'No data found',
  actions,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let rows = data || [];
    if (search) {
      const lower = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => {
          const val = col.accessor ? row[col.accessor] : null;
          return val != null && String(val).toLowerCase().includes(lower);
        })
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        if (av == null) return 1; if (bv == null) return -1;
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const Skeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        {columns.map((_, j) => (
          <td key={j} className="px-4 py-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </td>
        ))}
        {actions && <td className="px-4 py-4"><div className="h-4 bg-white/10 rounded w-16" /></td>}
      </tr>
    ))
  );

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {columns.map((col) => (
                <th
                  key={col.key || col.accessor}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider select-none',
                    col.sortable !== false && col.accessor && 'cursor-pointer hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.accessor && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <Skeleton />
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-white/[0.03] transition-colors group">
                  {columns.map(col => (
                    <td key={col.key || col.accessor} className="px-4 py-3.5 text-slate-300">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium text-white">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
