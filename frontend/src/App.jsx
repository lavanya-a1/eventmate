import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import BrowseEvents from './pages/BrowseEvents';
import MyBookings from './pages/MyBookings';
import QRTickets from './pages/QRTickets';
import Notifications from './pages/Notifications';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

// Admin
import AdminLayout from './admin/components/layout/AdminLayout';
import AdminDashboardHome from './admin/pages/AdminDashboardHome';
import EventManagement from './admin/pages/EventManagement';
import UserManagement from './admin/pages/UserManagement';
import BookingManagement from './admin/pages/BookingManagement';
import PaymentMonitoring from './admin/pages/PaymentMonitoring';
import QRValidation from './admin/pages/QRValidation';
import NotificationsReminders from './admin/pages/NotificationsReminders';
import FeedbackModeration from './admin/pages/FeedbackModeration';
import SystemLogs from './admin/pages/SystemLogs';
import Settings from './admin/pages/Settings';

// Organizer
import OrganizerLayout from './organizer/components/layout/OrganizerLayout';
import OrganizerDashboard from './organizer/pages/OrganizerDashboard';
import OrganizerMyEvents from './organizer/pages/OrganizerMyEvents';
import OrganizerEventBookings from './organizer/pages/OrganizerEventBookings';
import OrganizerSettings from './organizer/pages/OrganizerSettings';

import './index.css';

/** Redirect logged-in users away from auth pages */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'organizer') return <Navigate to="/organizer" replace />;
  return <Navigate to="/dashboard" replace />;
}

/** Redirect unauthenticated users to /; redirect admins and organizers to their panels */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'organizer') return <Navigate to="/organizer" replace />;
  return children;
}

/** Admin-only route — redirects non-admins to /dashboard */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

/** Organizer-only route */
function OrganizerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'organizer') return <Navigate to="/dashboard" replace />;
  return children;
}

/** Catch-all: send admins to /admin, organizers to /organizer, users to /dashboard, guests to / */
function DefaultRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'organizer') return <Navigate to="/organizer" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/browse" element={<BrowseEvents />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/tickets" element={<QRTickets />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Admin dashboard */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboardHome />} />
        <Route path="/admin/events" element={<EventManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/bookings" element={<BookingManagement />} />
        <Route path="/admin/payments" element={<PaymentMonitoring />} />
        <Route path="/admin/qr" element={<QRValidation />} />
        <Route path="/admin/notifications" element={<NotificationsReminders />} />
        <Route path="/admin/feedback" element={<FeedbackModeration />} />
        <Route path="/admin/logs" element={<SystemLogs />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* Organizer dashboard */}
      <Route element={<OrganizerRoute><OrganizerLayout /></OrganizerRoute>}>
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/events" element={<OrganizerMyEvents />} />
        <Route path="/organizer/bookings" element={<OrganizerEventBookings />} />
        <Route path="/organizer/settings" element={<OrganizerSettings />} />
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
