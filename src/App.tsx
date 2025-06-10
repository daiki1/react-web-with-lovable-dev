
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import ForgotPassword from './pages/forgot/ForgotPassword';
import ResetPassword from './pages/reset/ResetPassword';

// Protected Pages
import Home from './pages/home/Home';
import RoleTest from './pages/test/RoleTest';
import Localization from './pages/localization/Localization';
import UserManagement from './pages/users/UserManagement';
import AuditLogs from './pages/audit/AuditLogs';

// i18n setup
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main App component with routing and providers
 * Handles authentication, internationalization, and navigation
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/role-test"
                  element={
                    <ProtectedRoute>
                      <RoleTest />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/localization"
                  element={
                    <ProtectedRoute>
                      <Localization />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Only Routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRoles={['ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin and Auditor Routes */}
                <Route
                  path="/audit"
                  element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'AUDITOR']}>
                      <AuditLogs />
                    </ProtectedRoute>
                  }
                />

                {/* Default Redirects */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>
            
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
