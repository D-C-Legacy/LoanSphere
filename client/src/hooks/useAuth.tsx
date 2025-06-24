import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  role: "borrower" | "lender" | "investor" | "distributor" | "admin";
  firstName?: string;
  lastName?: string;
  phone?: string;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string;
  billingCycle?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: User["role"], firstName?: string, lastName?: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateSubscription: (subscriptionPlan: string, billingCycle: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and get user data
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) {
        setIsLoading(false);
        return;
      }

      const userData = await apiRequest("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      localStorage.setItem("token", response.token);
      setUser(response.user);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: User["role"], firstName?: string, lastName?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ 
          email, 
          password, 
          role, 
          firstName, 
          lastName, 
          phone 
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      localStorage.setItem("token", response.token);
      setUser(response.user);
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (subscriptionPlan: string, billingCycle: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const response = await apiRequest("/api/auth/user/subscription", {
        method: "PUT",
        body: JSON.stringify({ subscriptionPlan, billingCycle }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUser(response);
    } catch (error) {
      throw new Error("Failed to update subscription");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateSubscription, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};