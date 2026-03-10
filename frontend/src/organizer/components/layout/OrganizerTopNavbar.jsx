import { useState } from 'react';
import { Menu, Sun, Moon, ChevronDown, LogOut, Settings, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../../../admin/context/AdminThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_LABELS = {
  '/organizer': 'Dashboard Overview',
  '/organizer/events': 'My Events',
  '/organizer/bookings': 'Event Bookings',
  '/organizer/settings': 'Settings',
};

export default function OrganizerTopNavbar({ onMenuClick, sidebarCollapsed }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/');
  };

  const pageTitle = ROUTE_LABELS[pathname] || 'Organizer';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'OR';

  return (
    <header className={clsx(
      'fixed top-0 right-0 z-20 h-16',
      'flex items-center gap-4 px-4 lg:px-6',
      'bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10',
      'transition-all duration-300',
      sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-64',
      'left-0'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Zap size={16} className="text-white" />
        </div>
        <span className="hidden lg:block text-sm font-bold text-slate-900 dark:text-white tracking-tight">EventMate</span>
        <span className="text-xs text-indigo-500 font-semibold hidden lg:block">Organizer</span>
      </div>

      {/* Separator */}
      <div className="hidden lg:block h-5 w-px bg-gray-200 dark:bg-white/10" />

      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
        <p className="text-xs text-slate-500">Organizer Panel</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name || 'Organizer'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'organizer'}</p>
            </div>
            <ChevronDown size={14} className={clsx('text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 z-20 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-white/10 mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <a href="/organizer/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Settings size={14} />
                  Profile & Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
