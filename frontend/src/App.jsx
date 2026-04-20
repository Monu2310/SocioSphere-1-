import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentManagement from './pages/admin/ResidentManagement';
import AIInsightsPage from './pages/admin/AIInsightsPage';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import PollsPage from './pages/polls/PollsPage';
import ParkingPage from './pages/parking/ParkingPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';

function AppRouter() {
  const { isLight } = useTheme();

  return (
    <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: isLight
              ? { background: '#f8fafc', color: '#0f172a', border: '1px solid rgba(15,23,42,0.12)' }
              : { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#10b981', secondary: isLight ? '#f8fafc' : '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: isLight ? '#f8fafc' : '#1e293b' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<AppLayout requireAdmin={true} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/residents" element={<ResidentManagement />} />
            <Route path="/admin/polls" element={<PollsPage />} />
            <Route path="/admin/parking" element={<ParkingPage />} />
            <Route path="/admin/marketplace" element={<MarketplacePage />} />
            <Route path="/admin/insights" element={<AIInsightsPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Resident Routes */}
          <Route element={<AppLayout requireAdmin={false} />}>
            <Route path="/dashboard" element={<ResidentDashboard />} />
            <Route path="/polls" element={<PollsPage />} />
            <Route path="/parking" element={<ParkingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}


