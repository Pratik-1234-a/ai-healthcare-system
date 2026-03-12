import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ 
  element, 
  isAuthenticated, 
  userRole, 
  requiredRole 
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== requiredRole) {
    return <Navigate to={userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return element;
}

export default ProtectedRoute;
