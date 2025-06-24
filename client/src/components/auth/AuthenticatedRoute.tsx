import { useAuth } from "@/lib/clerk";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ClerkRoleSelector } from "./ClerkRoleSelector";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireOnboarding?: boolean;
}

export const AuthenticatedRoute = ({ 
  children, 
  requiredRole,
  requireOnboarding = true 
}: AuthenticatedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check localStorage for temporary auth
    const storedAuth = localStorage.getItem('loansphere_auth');
    
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated) {
          // User is authenticated via temporary system
          const userRole = authData.user?.unsafeMetadata?.role;
          
          // If specific role required and user doesn't have it, redirect
          if (requiredRole && userRole !== requiredRole) {
            const roleDashboards = {
              borrower: "/borrower-dashboard",
              lender: "/lender-dashboard", 
              investor: "/investor-dashboard",
              distributor: "/distributor-dashboard",
              admin: "/admin/dashboard"
            };
            
            const userDashboard = roleDashboards[userRole as keyof typeof roleDashboards];
            if (userDashboard) {
              setLocation(userDashboard);
            }
          }
          return;
        }
      } catch (e) {
        console.error("Failed to parse stored auth:", e);
      }
    }

    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation("/sign-in");
      return;
    }

    if (user && requireOnboarding) {
      const userRole = user.unsafeMetadata?.role as string;
      const onboardingComplete = user.unsafeMetadata?.onboardingComplete as boolean;

      if (!userRole || !onboardingComplete) {
        setLocation("/role-selector");
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        const roleDashboards = {
          borrower: "/borrower-dashboard",
          lender: "/lender-dashboard", 
          investor: "/investor-dashboard",
          distributor: "/distributor-dashboard",
          admin: "/admin/dashboard"
        };
        
        const userDashboard = roleDashboards[userRole as keyof typeof roleDashboards];
        if (userDashboard) {
          setLocation(userDashboard);
        } else {
          setLocation("/role-selector");
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation, requiredRole, requireOnboarding]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireOnboarding && user) {
    const userRole = user.unsafeMetadata?.role as string;
    const onboardingComplete = user.unsafeMetadata?.onboardingComplete as boolean;

    if (!userRole || !onboardingComplete) {
      return <ClerkRoleSelector />;
    }
  }

  return <>{children}</>;
};