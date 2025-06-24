import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const DashboardHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-loansphere rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LS</span>
          </div>
          <span className="text-xl font-bold text-loansphere-green">LoanSphere</span>
          <span className="text-sm text-muted-foreground ml-4">
            {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)} Dashboard
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.firstName || user?.email}
          </span>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};