import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA]">
        <div className="w-12 h-12 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium">Verifying CVRGU credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect students away from admin or vice versa
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student/dashboard'} replace />;
  }

  return <Outlet />;
};

export const StudentRoute = () => <ProtectedRoute allowedRoles={['student']} />;
export const AdminRoute = () => <ProtectedRoute allowedRoles={['admin']} />;
