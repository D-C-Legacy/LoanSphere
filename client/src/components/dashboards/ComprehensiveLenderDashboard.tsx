import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { LenderSidebar } from "./LenderSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { 
  Users, 
  FileText, 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  CreditCard,
  Settings,
  UserCheck,
  Shield,
  Bell,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Download,
  Upload,
  Filter,
  Eye,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  Building,
  Target,
  Database,
  Briefcase,
  MessageSquare,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { BorrowerManagement } from "../borrowers/BorrowerManagement";
import LoanManagement from "../loans/LoanManagement";
import RepaymentManagement from "../repayments/RepaymentManagement";
import { BranchManagement } from "../branches/BranchManagement";
import { CollateralManagement } from "../collateral/CollateralManagement";
import { SavingsManagement } from "../savings/SavingsManagement";
import { InvestorManagement } from "../investors/InvestorManagement";
import { PortfolioOverview } from "../portfolio/PortfolioOverview";
import { DisbursementManagement } from "../disbursement/DisbursementManagement";
import { CollectionsManagement } from "../collections/CollectionsManagement";
import { OfflineLendingManagement } from "../offline/OfflineLendingManagement";
import { ExpensesManagement } from "../expenses/ExpensesManagement";
import { AccountingDashboard } from "../accounting/AccountingDashboard";
import UserRolesManagement from "../staff/UserRolesManagement";
import { CommunicationsManagement } from "../communications/CommunicationsManagement";
import { LenderTourGuide } from "../onboarding/LenderTourGuide";
import { DocumentCenter } from "../documents/DocumentCenter";
import { AICashFlowUnderwriting } from "./AICashFlowUnderwriting";
import { FieldAgentToolkit } from "./FieldAgentToolkit";
import { VoiceBasedKYC } from "./VoiceBasedKYC";
import { CryptoInvestmentModule } from "./CryptoInvestmentModule";

export const ComprehensiveLenderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  // Fetch real data from API endpoints
  const { data: loanApplications = [], isLoading: loadingApplications } = useQuery({
    queryKey: ["/api/loan-applications"],
    enabled: false
  });

  const { data: borrowers = [], isLoading: loadingBorrowers } = useQuery({
    queryKey: ["/api/borrowers"],
    enabled: false
  });

  const { data: loanProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["/api/loan-products"],
    enabled: false
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["/api/payments"],
    enabled: false
  });

  const { data: dashboardStats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: false
  });

  const { data: portfolioAnalytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/portfolio/analytics"],
    enabled: false
  });

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">LMS Dashboard Overview</h1>
                <p className="text-gray-600 mt-1">Complete loan management system</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button size="sm" className="bg-loansphere-green hover:bg-loansphere-green/90 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Action</span>
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {loadingStats ? "Loading..." : "K0"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Outstanding balance</p>
                    </div>
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Loans</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {loadingStats ? "Loading..." : "0"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Currently servicing</p>
                    </div>
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delinquent Loans</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {loadingStats ? "Loading..." : "0"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
                    </div>
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {loadingStats ? "Loading..." : "0%"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                    </div>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Portfolio Health */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No recent activities</p>
                    <p className="text-sm text-gray-400">Loan activities will appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Portfolio Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No portfolio data</p>
                    <p className="text-sm text-gray-400">Health metrics will display with active loans</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "lms":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Full LMS Suite</h1>
                <p className="text-gray-600 mt-1">Complete loan management system with all features</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Loan Origination</h3>
                      <p className="text-gray-600 text-sm mb-3">Complete application processing pipeline</p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Loan Servicing</h3>
                      <p className="text-gray-600 text-sm mb-3">Payment processing and account management</p>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Collections</h3>
                      <p className="text-gray-600 text-sm mb-3">Automated collection workflows</p>
                      <Button variant="outline" size="sm">Setup</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "loan_applications":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Applications</h1>
                <p className="text-gray-600 mt-1">Manage and process loan applications</p>
              </div>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search applications..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {loadingApplications ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading applications...</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-500 mb-4">Applications will appear here when borrowers apply</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "borrowers":
        return <BorrowerManagement />;

      case "applications":
        return <LoanManagement />;

      case "payments":
        return <RepaymentManagement />;

      case "branches":
        return <BranchManagement />;

      case "collateral":
        return <CollateralManagement />;

      case "savings":
        return <SavingsManagement />;

      case "investors":
        return <InvestorManagement />;

      case "expenses":
        return <ExpensesManagement />;

      case "accounting":
        return <AccountingDashboard />;

      case "user-roles":
        return <UserRolesManagement />;

      case "communications":
        return <CommunicationsManagement />;

      case "documents":
        return <DocumentCenter />;

      case "portfolio":
        return <PortfolioOverview />;

      case "disbursement":
        return <DisbursementManagement />;

      case "collections":
        return <CollectionsManagement />;

      case "offline-lending":
        return <OfflineLendingManagement />;

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
                <p className="text-gray-600 mt-1">Advanced analytics and insights</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No analytics data</p>
                    <p className="text-sm text-gray-400">Analytics will generate with portfolio activity</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No risk data</p>
                    <p className="text-sm text-gray-400">Risk metrics will appear with active loans</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "ai-underwriting":
        return <AICashFlowUnderwriting />;

      case "field-agents":
        return <FieldAgentToolkit />;

      case "voice-kyc":
        return <VoiceBasedKYC />;

      case "crypto-investment":
        return <CryptoInvestmentModule />;

      case "settings":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure your lending business</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Business Configuration</CardTitle>
                  <CardDescription>Basic business settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" placeholder="Enter your business name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="ZMW">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZMW">ZMW - Zambian Kwacha</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Input id="timezone" defaultValue="Africa/Lusaka" />
                  </div>
                  <Button className="w-full bg-loansphere-green hover:bg-loansphere-green/90">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Products</CardTitle>
                  <CardDescription>Configure loan offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No loan products</p>
                    <p className="text-sm text-gray-400 mb-4">Create products to start accepting applications</p>
                    <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
            <p className="text-gray-500">This feature is being developed</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
        <LenderSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <LenderTourGuide />
        <SidebarInset className="flex-1 overflow-auto">
          <div className="min-h-full">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">LoanSphere</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Financial Management Platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};