import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';

// Pages (lazy-loaded to keep initial bundle small)
import Home from './pages/Home';
import Login from './pages/Login';
import ClaimDetail from './pages/ClaimDetail';
import NewClaim from './pages/NewClaim';
import AdminDashboard from './pages/AdminDashboard';
import History from './pages/History';

/**
 * PrivateRoute
 * - Redirects to /login if not authenticated.
 * - Redirects to / if authenticated but role not in allowedRoles.
 *
 * @param {{ allowedRoles?: string[], children: React.ReactNode }} props
 */
function PrivateRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

/**
 * PublicOnlyRoute – redirects already-authenticated users away from /login.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Any authenticated user */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/claims/:claimId"
        element={
          <PrivateRoute>
            <ClaimDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/claims/new"
        element={
          <PrivateRoute allowedRoles={['member', 'admin']}>
            <NewClaim />
          </PrivateRoute>
        }
      />

      <Route
        path="/history"
        element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}