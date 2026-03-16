import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  const homePath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'organizer'
      ? '/organizer'
      : user
        ? '/dashboard'
        : '/';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 text-center">
        <div className="inline-flex items-center justify-center rounded-2xl bg-red-500/10 text-red-400 p-3 mb-5">
          <AlertCircle size={28} />
        </div>

        <p className="text-xs tracking-[0.2em] uppercase text-slate-400 font-semibold">Error 404</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">Page not found</h1>
        <p className="text-sm md:text-base text-slate-300 mt-3">
          The page you requested does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={homePath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <Compass size={16} />
            Go to home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] transition-colors"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
