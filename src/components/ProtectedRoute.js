import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStoredUser, getStoredToken } from '../utils/authStorage';

const ProtectedRoute = ({ children, role, roles }) => {
  const { user: contextUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const user = contextUser || getStoredUser();
  const token = getStoredToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || (role ? [role] : null);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
