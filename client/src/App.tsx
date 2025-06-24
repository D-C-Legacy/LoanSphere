
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { ClerkProvider } from "@/providers/ClerkProvider";
import { useAuth } from "@/lib/clerk";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkSignIn } from "@/components/auth/ClerkSignIn";
import { ClerkSignUp } from "@/components/auth/ClerkSignUp";
import { ClerkRoleSelector } from "@/components/auth/ClerkRoleSelector";
import { AuthenticatedRoute } from "@/components/auth/AuthenticatedRoute";
import { TemporaryLogin } from "@/components/auth/TemporaryLogin";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoansPage } from "./pages/LoansPage";
import LoanMarketplace from "./pages/LoanMarketplace";
import LoanApplication from "./pages/LoanApplication";
import BorrowerDashboard from "./pages/BorrowerDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import { LenderSignup } from "./pages/LenderSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LenderDashboard from "./pages/LenderDashboard";

// Main routing component - landing page accessible without authentication
const AppRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="/sign-in" component={ClerkSignIn} />
        <Route path="/sign-up" component={ClerkSignUp} />
        <Route path="/login" component={TemporaryLogin} />
        <Route path="/role-selector" component={ClerkRoleSelector} />
        <Route path="/" component={Index} />
        <Route path="/loans" component={LoansPage} />
        <Route path="/marketplace" component={LoanMarketplace} />
        <Route path="/loan-application/:id" component={LoanApplication} />
        <Route path="/borrower-dashboard">
          {() => (
            <AuthenticatedRoute requiredRole="borrower">
              <BorrowerDashboard />
            </AuthenticatedRoute>
          )}
        </Route>
        <Route path="/investor-dashboard">
          {() => (
            <AuthenticatedRoute requiredRole="investor">
              <InvestorDashboard />
            </AuthenticatedRoute>
          )}
        </Route>
        <Route path="/distributor-dashboard">
          {() => (
            <AuthenticatedRoute requiredRole="distributor">
              <DistributorDashboard />
            </AuthenticatedRoute>
          )}
        </Route>
        <Route path="/lender-dashboard">
          {() => (
            <AuthenticatedRoute requiredRole="lender">
              <LenderDashboard />
            </AuthenticatedRoute>
          )}
        </Route>
        <Route path="/admin/dashboard">
          {() => (
            <AuthenticatedRoute requiredRole="admin">
              <AdminDashboard />
            </AuthenticatedRoute>
          )}
        </Route>
        <Route path="/admin/*">
          {() => (
            <AuthenticatedRoute requiredRole="admin">
              <AdminDashboard />
            </AuthenticatedRoute>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

const App = () => {

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRouter />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
