import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage            from './pages/LoginPage';
import PublicFeedbackPage   from './pages/PublicFeedbackPage';
import ChangePasswordPage   from './pages/ChangePasswordPage';
import DashboardPage        from './pages/DashboardPage';
import ProjectsPage         from './pages/ProjectsPage';
import ProjectDetailsPage   from './pages/ProjectDetailsPage';
import BookingsPage         from './pages/BookingsPage';
import BookingFormPage      from './pages/BookingFormPage';
import CommissionsPage      from './pages/CommissionsPage';
import TeamPage             from './pages/TeamPage';
import OffersPage           from './pages/OffersPage';
import PendingRequestsPage  from './pages/PendingRequestsPage';
import TravelPage           from './pages/TravelPage';
import SiteVisitsPage       from './pages/SiteVisitsPage';
import ReviewsPage          from './pages/ReviewsPage';
import NotificationsPage    from './pages/NotificationsPage';
import ProfilePage          from './pages/ProfilePage';
import ProfileEditPage      from './pages/ProfileEditPage';
import HelpPage             from './pages/HelpPage';
import FaqPage              from './pages/FaqPage';
import TutorialsPage        from './pages/TutorialsPage';
import ProjectFormPage      from './pages/ProjectFormPage';
// Admin pages
import ApprovalCenterPage       from './pages/ApprovalCenterPage';
import AssociateManagementPage  from './pages/AssociateManagementPage';
import AssociateFormPage        from './pages/AssociateFormPage';
import CarouselManagerPage      from './pages/CarouselManagerPage';
import PopupManagerPage         from './pages/PopupManagerPage';
import DashboardContentPage     from './pages/DashboardContentPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feedback/:id" element={<PublicFeedbackPage />} />

          {/* Protected — all authenticated users */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute roles={['MD','AM']}><ProjectFormPage /></ProtectedRoute>} />
          <Route path="/projects/:id/edit" element={<ProtectedRoute roles={['MD','AM']}><ProjectFormPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/bookings/new" element={<ProtectedRoute><BookingFormPage /></ProtectedRoute>} />
          <Route path="/commissions" element={<ProtectedRoute><CommissionsPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
          <Route path="/pending-requests" element={<ProtectedRoute><PendingRequestsPage /></ProtectedRoute>} />
          <Route path="/travel" element={<ProtectedRoute><TravelPage /></ProtectedRoute>} />
          <Route path="/site-visits" element={<ProtectedRoute><SiteVisitsPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/faq" element={<ProtectedRoute><FaqPage /></ProtectedRoute>} />
          <Route path="/tutorials" element={<ProtectedRoute><TutorialsPage /></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/approval-center" element={<ProtectedRoute roles={['MD','AM']}><ApprovalCenterPage /></ProtectedRoute>} />
          <Route path="/approvals" element={<Navigate to="/approval-center" replace />} />
          <Route path="/admin/associates" element={<ProtectedRoute roles={['MD','AM']}><AssociateManagementPage /></ProtectedRoute>} />
          <Route path="/associates/new" element={<ProtectedRoute roles={['MD','AM']}><AssociateFormPage /></ProtectedRoute>} />
          <Route path="/carousel-manager" element={<ProtectedRoute roles={['MD','AM']}><CarouselManagerPage /></ProtectedRoute>} />
          <Route path="/popup-manager" element={<ProtectedRoute roles={['MD','AM']}><PopupManagerPage /></ProtectedRoute>} />
          <Route path="/dashboard-content" element={<ProtectedRoute roles={['MD','AM']}><DashboardContentPage /></ProtectedRoute>} />

          {/* Catch-all → redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
