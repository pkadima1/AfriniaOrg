import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
  showAuthModal?: boolean;
}

/**
 * ProtectedRoute component that restricts access based on authentication and user roles
 * 
 * @param children - The component(s) to render if access is granted
 * @param requiredRole - The minimum role required to access this route
 * @param fallbackPath - Path to redirect to if access is denied
 * @param showAuthModal - Whether to show auth modal instead of redirecting
 */
export function ProtectedRoute({ 
  children, 
  requiredRole = 'viewer',
  fallbackPath = '/',
  showAuthModal = false
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasPermission, userProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent-blue" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (showAuthModal) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6 max-w-md mx-4">
            <div className="space-y-2">
              <Shield className="w-12 h-12 mx-auto text-accent-blue" />
              <h2 className="text-2xl font-bold">Authentication Required</h2>
              <p className="text-gray-400">
                You need to sign in to access this page.
              </p>
            </div>
            <Button onClick={() => setShowModal(true)} className="w-full">
              Sign In
            </Button>
            <AuthModal 
              isOpen={showModal} 
              onClose={() => setShowModal(false)}
              defaultTab="login"
            />
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Authenticated but insufficient permissions
  if (!hasPermission(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md mx-4">
          <div className="space-y-2">
            <ShieldAlert className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-gray-400">
              You don't have permission to access this page.
            </p>
            {userProfile && (
              <Alert className="text-left">
                <AlertDescription>
                  Your current role is <strong>{userProfile.role}</strong>. 
                  This page requires <strong>{requiredRole}</strong> level access or higher.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // User has permission, render the protected content
  return <>{children}</>;
}

/**
 * AdminRoute component - specifically for admin-only access
 */
export function AdminRoute({ children, fallbackPath = '/' }: { 
  children: React.ReactNode; 
  fallbackPath?: string;
}) {
  return (
    <ProtectedRoute 
      requiredRole="admin" 
      fallbackPath={fallbackPath}
      showAuthModal={true}
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * ContributorRoute component - for contributor-level access and above
 */
export function ContributorRoute({ children, fallbackPath = '/' }: { 
  children: React.ReactNode; 
  fallbackPath?: string;
}) {
  return (
    <ProtectedRoute 
      requiredRole="contributor" 
      fallbackPath={fallbackPath}
      showAuthModal={true}
    >
      {children}
    </ProtectedRoute>
  );
}