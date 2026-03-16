import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './admin/context/AdminThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import BrowseEvents from './pages/BrowseEvents';
import MyBookings from './pages/MyBookings';
import QRTickets from './pages/QRTickets';
import Notifications from './pages/Notifications';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

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
import OrganizerEventPreview from './organizer/pages/OrganizerEventPreview';
import OrganizerSettings from './organizer/pages/OrganizerSettings';

import './index.css';

function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
}

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

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RouteErrorBoundary><Landing /></RouteErrorBoundary>} />
      <Route path="/verify-email" element={<RouteErrorBoundary><VerifyEmail /></RouteErrorBoundary>} />
      <Route path="/forgot-password" element={<RouteErrorBoundary><ForgotPassword /></RouteErrorBoundary>} />
      <Route path="/reset-password" element={<RouteErrorBoundary><ResetPassword /></RouteErrorBoundary>} />

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute><RouteErrorBoundary><DashboardLayout /></RouteErrorBoundary></ProtectedRoute>}>
        <Route path="/dashboard" element={<RouteErrorBoundary><DashboardHome /></RouteErrorBoundary>} />
        <Route path="/browse" element={<RouteErrorBoundary><BrowseEvents /></RouteErrorBoundary>} />
        <Route path="/bookings" element={<RouteErrorBoundary><MyBookings /></RouteErrorBoundary>} />
        <Route path="/tickets" element={<RouteErrorBoundary><QRTickets /></RouteErrorBoundary>} />
        <Route path="/notifications" element={<RouteErrorBoundary><Notifications /></RouteErrorBoundary>} />
        <Route path="/feedback" element={<RouteErrorBoundary><Feedback /></RouteErrorBoundary>} />
        <Route path="/profile" element={<RouteErrorBoundary><Profile /></RouteErrorBoundary>} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Admin dashboard */}
      <Route element={<AdminRoute><RouteErrorBoundary><AdminLayout /></RouteErrorBoundary></AdminRoute>}>
        <Route path="/admin" element={<RouteErrorBoundary><AdminDashboardHome /></RouteErrorBoundary>} />
        <Route path="/admin/events" element={<RouteErrorBoundary><EventManagement /></RouteErrorBoundary>} />
        <Route path="/admin/users" element={<RouteErrorBoundary><UserManagement /></RouteErrorBoundary>} />
        <Route path="/admin/bookings" element={<RouteErrorBoundary><BookingManagement /></RouteErrorBoundary>} />
        <Route path="/admin/payments" element={<RouteErrorBoundary><PaymentMonitoring /></RouteErrorBoundary>} />
        <Route path="/admin/qr" element={<RouteErrorBoundary><QRValidation /></RouteErrorBoundary>} />
        <Route path="/admin/notifications" element={<RouteErrorBoundary><NotificationsReminders /></RouteErrorBoundary>} />
        <Route path="/admin/feedback" element={<RouteErrorBoundary><FeedbackModeration /></RouteErrorBoundary>} />
        <Route path="/admin/logs" element={<RouteErrorBoundary><SystemLogs /></RouteErrorBoundary>} />
        <Route path="/admin/settings" element={<RouteErrorBoundary><Settings /></RouteErrorBoundary>} />
      </Route>

      {/* Organizer dashboard */}
      <Route element={<OrganizerRoute><RouteErrorBoundary><OrganizerLayout /></RouteErrorBoundary></OrganizerRoute>}>
        <Route path="/organizer" element={<RouteErrorBoundary><OrganizerDashboard /></RouteErrorBoundary>} />
        <Route path="/organizer/events" element={<RouteErrorBoundary><OrganizerMyEvents /></RouteErrorBoundary>} />
        <Route path="/organizer/events/:id" element={<RouteErrorBoundary><OrganizerEventPreview /></RouteErrorBoundary>} />
        <Route path="/organizer/bookings" element={<RouteErrorBoundary><OrganizerEventBookings /></RouteErrorBoundary>} />
        <Route path="/organizer/settings" element={<RouteErrorBoundary><OrganizerSettings /></RouteErrorBoundary>} />
      </Route>

      <Route path="*" element={<RouteErrorBoundary><NotFound /></RouteErrorBoundary>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
