import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import StudentDashboard from './pages/StudentDashboard'
import HiringDashboard from './pages/HiringDashboard'
import Onboarding from './pages/Onboarding'
import CompanyProfile from './pages/CompanyProfile'

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="jobs" element={<Jobs />} />

          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/:companyName"
            element={
              <CompanyProfile />
            }
          />
          <Route
            path="onboarding"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['HIRING_MANAGER']}>
                <HiringDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="unauthorized"
            element={
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl font-extrabold text-red-200 mb-4">403</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500">You don't have permission to view this page.</p>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl font-extrabold text-slate-200 mb-4">404</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
                <p className="text-slate-500">The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
