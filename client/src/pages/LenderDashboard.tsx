import { useEffect } from "react";
import { useAuth } from "@/lib/clerk";
import { ComprehensiveLenderDashboard } from "@/components/dashboards/ComprehensiveLenderDashboard";
import { useLocation } from "wouter";

export default function LenderDashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lender dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ComprehensiveLenderDashboard />;
}