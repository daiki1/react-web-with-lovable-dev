
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LoaderOverlay from './LoaderOverlay';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Auth guard component that redirects authenticated users away from auth pages
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/home' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoaderOverlay isVisible={true} message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
