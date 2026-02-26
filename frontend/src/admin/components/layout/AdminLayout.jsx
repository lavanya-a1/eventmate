import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';
import ToastContainer from '../ui/Toast';
import { ThemeProvider, useTheme } from '../../context/AdminThemeContext';

function AdminLayoutInner() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        {/* Background gradient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/4 blur-3xl" />
        </div>

        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content */}
        <div className={clsx(
          'flex flex-col min-h-screen transition-all duration-300',
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
        )}>
          {/* Top navbar */}
          <AdminTopNavbar
            onMenuClick={() => setMobileOpen(true)}
            sidebarCollapsed={collapsed}
          />

          {/* Page content */}
          <main className="flex-1 mt-16 p-4 lg:p-6 relative z-[1]">
            <Outlet />
          </main>
        </div>

        {/* Toast notifications */}
        <ToastContainer />
      </div>
  );
}

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutInner />
    </ThemeProvider>
  );
}
