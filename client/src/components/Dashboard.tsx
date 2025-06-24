
import { useAuth } from "@/hooks/useAuth";
import { BorrowerDashboard } from "./dashboards/BorrowerDashboard";
import { ComprehensiveLenderDashboard } from "./dashboards/ComprehensiveLenderDashboard";
import { InvestorDashboard } from "./dashboards/InvestorDashboard";
import { DistributorDashboard } from "./dashboards/DistributorDashboard";
import { SuperAdminDashboard } from "./dashboards/SuperAdminDashboard";

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-loansphere-light">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-loansphere-dark mb-4">
            Please log in to access your dashboard
          </h2>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case "borrower":
      return <BorrowerDashboard />;
    case "lender":
      return <ComprehensiveLenderDashboard />;
    case "investor":
      return <InvestorDashboard />;
    case "distributor":
      return <DistributorDashboard />;
    case "admin":
      return <SuperAdminDashboard />;
    default:
      return <BorrowerDashboard />;
  }
};
