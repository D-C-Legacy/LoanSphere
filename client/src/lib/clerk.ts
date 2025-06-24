import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

export { useClerk };

// Fallback authentication state
const fallbackAuthState = {
  isAuthenticated: false,
  user: null,
  userId: null,
  getToken: async () => null,
  isLoading: false,
};

// Custom hook for LoanSphere authentication with fallback
export const useAuth = () => {
  const [fallbackAuth, setFallbackAuth] = useState(fallbackAuthState);
  const [usesFallback, setUsesFallback] = useState(false);

  try {
    const { isSignedIn, userId, getToken, isLoaded } = useClerkAuth();
    const { user, isLoaded: userLoaded } = useUser();
    
    // If Clerk is working properly, use it
    if (isLoaded && userLoaded) {
      return {
        isAuthenticated: isSignedIn,
        user,
        userId,
        getToken,
        isLoading: false,
      };
    }
    
    return {
      isAuthenticated: isSignedIn || false,
      user,
      userId,
      getToken,
      isLoading: !isLoaded || !userLoaded,
    };
  } catch (error) {
    console.log("Switching to fallback authentication system");
    
    // Check for existing session in localStorage
    useEffect(() => {
      const storedAuth = localStorage.getItem('loansphere_auth');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          setFallbackAuth({
            isAuthenticated: true,
            user: authData.user,
            userId: authData.userId,
            getToken: async () => authData.token,
            isLoading: false,
          });
          setUsesFallback(true);
        } catch (e) {
          console.error("Failed to parse stored auth:", e);
        }
      }
    }, []);
    
    return fallbackAuth;
  }
};

// Helper functions for user management
export const getUserRole = (user: any) => {
  return user?.publicMetadata?.role || 'borrower';
};

export const getUserOrganization = (user: any) => {
  return user?.publicMetadata?.organizationId;
};

export const isLender = (user: any) => {
  return getUserRole(user) === 'lender';
};

export const isAdmin = (user: any) => {
  return getUserRole(user) === 'admin';
};

export const isBorrower = (user: any) => {
  return getUserRole(user) === 'borrower';
};