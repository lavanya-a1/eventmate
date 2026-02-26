import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

const toastQueue = [];
let listeners = [];

const notify = (message, type = 'info', duration = 4000) => {
  const id = Date.now() + Math.random();
  const toast = { id, message, type, duration };
  toastQueue.push(toast);
  listeners.forEach(fn => fn([...toastQueue]));
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
  return id;
};

const dismiss = (id) => {
  const idx = toastQueue.findIndex(t => t.id === id);
  if (idx !== -1) {
    toastQueue.splice(idx, 1);
    listeners.forEach(fn => fn([...toastQueue]));
  }
};

export const toast = {
  success: (msg, d) => notify(msg, 'success', d),
  error: (msg, d) => notify(msg, 'error', d),
  warning: (msg, d) => notify(msg, 'warning', d),
  info: (msg, d) => notify(msg, 'info', d),
  dismiss,
};

const iconMap = {
  success: { Icon: CheckCircle, cls: 'text-emerald-400' },
  error: { Icon: XCircle, cls: 'text-red-400' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-400' },
  info: { Icon: Info, cls: 'text-blue-400' },
};

const bgMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
};

function ToastItem({ toast: t }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const { Icon, cls } = iconMap[t.type] || iconMap.info;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[300px] max-w-sm',
        'transition-all duration-300 ease-out',
        bgMap[t.type],
        'bg-slate-900/90',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      )}
    >
      <Icon size={18} className={clsx('mt-0.5 flex-shrink-0', cls)} />
      <p className="flex-1 text-sm text-white/90 leading-relaxed">{t.message}</p>
      <button
        onClick={() => dismiss(t.id)}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fn = (list) => setToasts([...list]);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
