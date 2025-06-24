import { useEffect, useState } from "react";
import { useAuth } from "@/lib/clerk";
import { useLocation } from "wouter";
import { ClerkRoleSelector } from "./ClerkRoleSelector";

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackComponent?: React.ComponentType;
}

export const AuthWrapper = ({ 
  children, 
  requiredRole,
  fallbackComponent: FallbackComponent 
}: AuthWrapperProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    // Check for temporary authentication first
    const storedAuth = localStorage.getItem('loansphere_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.user?.unsafeMetadata?.role) {
          const userRole = authData.user.unsafeMetadata.role;
          
          // If specific role required and user has it, allow access
          if (!requiredRole || userRole === requiredRole) {
            return;
          }
          
          // Redirect to correct dashboard if wrong role
          const dashboards = {
            borrower: "/borrower-dashboard",
            lender: "/lender-dashboard", 
            investor: "/investor-dashboard",
            distributor: "/distributor-dashboard",
            admin: "/admin/dashboard"
          };
          
          const correctDashboard = dashboards[userRole as keyof typeof dashboards];
          if (correctDashboard) {
            setLocation(correctDashboard);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse stored auth:", e);
        localStorage.removeItem('loansphere_auth');
      }
    }

    // Handle Clerk authentication
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation("/sign-in");
      return;
    }

    if (user) {
      const userRole = user.unsafeMetadata?.role as string;
      const onboardingComplete = user.unsafeMetadata?.onboardingComplete as boolean;

      // Show role selector if needed
      if (!userRole || !onboardingComplete) {
        setShowRoleSelector(true);
        return;
      }

      // Check role match
      if (requiredRole && userRole !== requiredRole) {
        const dashboards = {
          borrower: "/borrower-dashboard",
          lender: "/lender-dashboard", 
          investor: "/investor-dashboard",
          distributor: "/distributor-dashboard",
          admin: "/admin/dashboard"
        };
        
        const correctDashboard = dashboards[userRole as keyof typeof dashboards];
        if (correctDashboard) {
          setLocation(correctDashboard);
        } else {
          setShowRoleSelector(true);
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation, requiredRole]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-600">Loading LoanSphere...</p>
        </div>
      </div>
    );
  }

  // Show role selector if needed
  if (showRoleSelector) {
    return <ClerkRoleSelector />;
  }

  // Check temporary auth for immediate access
  const storedAuth = localStorage.getItem('loansphere_auth');
  if (storedAuth) {
    try {
      const authData = JSON.parse(storedAuth);
      if (authData.isAuthenticated) {
        const userRole = authData.user?.unsafeMetadata?.role;
        if (!requiredRole || userRole === requiredRole) {
          return <>{children}</>;
        }
      }
    } catch (e) {
      // Continue to normal auth flow
    }
  }

  // Normal Clerk authentication flow
  if (!isAuthenticated) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    return null;
  }

  if (user) {
    const userRole = user.unsafeMetadata?.role as string;
    const onboardingComplete = user.unsafeMetadata?.onboardingComplete as boolean;

    if (!userRole || !onboardingComplete) {
      return <ClerkRoleSelector />;
    }

    if (requiredRole && userRole !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need {requiredRole} access to view this page.</p>
            <p className="text-sm text-gray-500">Your current role: {userRole}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};