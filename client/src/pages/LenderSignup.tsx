import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { QuickLenderOnboarding } from "@/components/QuickLenderOnboarding";

export const LenderSignup = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user is already logged in as a lender, redirect to home page (which shows dashboard)
    if (user && user.role === 'lender') {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Don't render signup form if user is already logged in as lender
  if (user && user.role === 'lender') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <QuickLenderOnboarding />
      </div>
    </div>
  );
};