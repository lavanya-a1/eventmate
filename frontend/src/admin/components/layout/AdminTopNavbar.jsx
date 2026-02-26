import { useState } from 'react';
import { Menu, Sun, Moon, Bell, Search, ChevronDown, LogOut, Settings, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../../context/AdminThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_LABELS = {
  '/admin': 'Dashboard Overview',
  '/admin/events': 'Event Management',
  '/admin/users': 'User Management',
  '/admin/bookings': 'Booking Management',
  '/admin/payments': 'Payment Monitoring',
  '/admin/qr': 'QR Ticket Validation',
  '/admin/notifications': 'Notifications & Reminders',
  '/admin/feedback': 'Feedback Moderation',
  '/admin/logs': 'System Logs',
  '/admin/settings': 'Settings',
};

export default function AdminTopNavbar({ onMenuClick, sidebarCollapsed }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const pageTitle = ROUTE_LABELS[pathname] || 'Admin';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <header className={clsx(
      'fixed top-0 right-0 z-20 h-16',
      'flex items-center gap-4 px-4 lg:px-6',
      'bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10',
      'transition-all duration-300',
      sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-64',
      'left-0'
    )}>
      {/* EM Logo — always visible on left */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/30">
          <Zap size={16} className="text-white" />
        </div>
        <span className="hidden lg:block text-sm font-bold text-slate-900 dark:text-white tracking-tight">EventMate</span>
        <span className="text-xs text-purple-500 font-semibold hidden lg:block">Admin</span>
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
        <p className="text-xs text-slate-500">Admin Panel</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-400 text-sm hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer w-44">
          <Search size={14} />
          <span className="text-xs">Quick search...</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono">⌘K</kbd>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-slate-900" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'admin'}</p>
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
                <a href="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">
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
