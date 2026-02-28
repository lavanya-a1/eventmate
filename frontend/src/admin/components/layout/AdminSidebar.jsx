import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Calendar, Users, BookOpen, CreditCard,
  QrCode, Bell, MessageSquare, Terminal, Settings, LogOut,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Events', icon: Calendar, to: '/admin/events' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Bookings', icon: BookOpen, to: '/admin/bookings' },
  { label: 'Payments', icon: CreditCard, to: '/admin/payments' },
  { label: 'QR Validation', icon: QrCode, to: '/admin/qr' },
  { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
  { label: 'Feedback', icon: MessageSquare, to: '/admin/feedback' },
  { label: 'System Logs', icon: Terminal, to: '/admin/logs' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      onClick={onMobileClose}
      className={({ isActive }) =>
        clsx(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30'
            : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={18}
            className={clsx(
              'flex-shrink-0 transition-colors',
              isActive ? 'text-purple-400' : 'group-hover:text-white'
            )}
          />
          <span
            className={clsx(
              'transition-all duration-200 overflow-hidden whitespace-nowrap',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            )}
          >
            {item.label}
          </span>
          {isActive && !collapsed && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
          )}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-3 py-5 border-b border-gray-200 dark:border-white/10',
        collapsed && 'justify-center'
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">EventMate</p>
            <p className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 admin-scroll">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 dark:border-white/10 space-y-1">
        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className={clsx('transition-all duration-200 overflow-hidden whitespace-nowrap', collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-30',
          'bg-white dark:bg-slate-900/80 border-r border-gray-200 dark:border-white/10 backdrop-blur-xl',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 h-screen z-50 w-64',
          'bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
