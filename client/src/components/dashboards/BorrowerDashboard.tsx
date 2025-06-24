
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LoanBrowser } from "@/components/loans/LoanBrowser";
import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { CreditScoringService } from "@/services/creditScoringService";
import { useAuth } from "@/hooks/useAuth";
import { Search, TrendingUp, Clock, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

export const BorrowerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { user } = useAuth();

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/loan-applications/borrower', user?.id],
    enabled: !!user?.id,
  });

  const { data: availableLoans = [], isLoading: loansLoading } = useQuery({
    queryKey: ['/api/loan-products/active'],
  });

  // Mock credit data for demonstration
  const mockCreditData = {
    personalInfo: { age: 32, maritalStatus: 'married', dependents: 2 },
    employment: { status: 'employed_civil_servant', monthlyIncome: 12000, yearsEmployed: 5, employer: 'Ministry of Health' },
    financial: { existingDebts: 3000, bankBalance: 25000, monthlyExpenses: 8000 },
    loanHistory: { previousLoans: 2, repaymentHistory: 'good' as const, defaultHistory: false }
  };

  const creditScore = CreditScoringService.calculateCreditScore(mockCreditData);
  const riskCategory = CreditScoringService.getRiskCategory(creditScore);
  const recommendations = CreditScoringService.getRecommendations(mockCreditData, creditScore);

  const pendingApplications = Array.isArray(applications) ? applications.filter((app: any) => app.status === 'pending').length : 0;
  const approvedApplications = Array.isArray(applications) ? applications.filter((app: any) => app.status === 'approved').length : 0;
  const totalBorrowed = Array.isArray(applications) 
    ? applications.filter((app: any) => app.status === 'approved').reduce((sum: number, app: any) => sum + parseFloat(app.requestedAmount), 0)
    : 0;

  if (showApplicationForm) {
    return <LoanApplicationForm onSuccess={() => setShowApplicationForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Borrower Dashboard</h1>
            <p className="text-gray-600">Manage your loan applications and find new opportunities</p>
          </div>
          <Button onClick={() => setShowApplicationForm(true)}>
            <Search className="w-4 h-4 mr-2" />
            Browse Loans
          </Button>
        </div>

        {/* Credit Score Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Credit Score</h3>
                <div className="text-4xl font-bold">{creditScore}</div>
                <p className="text-blue-100">{riskCategory} Category</p>
              </div>
              <div className="text-right">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div className="text-sm font-medium">
                    {Math.round((creditScore / 850) * 100)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(creditScore / 850) * 100} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedApplications}</div>
              <p className="text-xs text-muted-foreground">Successfully approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">K{totalBorrowed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all loans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Array.isArray(availableLoans) ? availableLoans.length : 0}</div>
              <p className="text-xs text-muted-foreground">Ready to apply</p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-loansphere-dark">Borrower Dashboard</h1>
          <p className="text-muted-foreground mt-2">Find and manage your loan applications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="browse">Browse Loans</TabsTrigger>
            <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-loansphere-green">3</div>
                  <p className="text-xs text-muted-foreground">+1 from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-loansphere-yellow">K280,000</div>
                  <p className="text-xs text-muted-foreground">Across all applications</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-loansphere-dark">15%</div>
                  <p className="text-xs text-muted-foreground">Better than market average</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest loan applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(applications) && applications.length > 0 ? applications.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-semibold">{app.lender?.firstName} {app.lender?.lastName}</div>
                        <div className="text-sm text-muted-foreground">{app.loanProduct?.loanType}</div>
                        <div className="text-sm">K{parseFloat(app.requestedAmount).toLocaleString()} • {app.requestedTerm} months</div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={
                          app.status === 'pending' ? 'secondary' :
                          app.status === 'approved' ? 'default' : 
                          'destructive'
                        }>
                          {app.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No applications yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-loansphere-green hover:bg-loansphere-green/90"
                    onClick={() => setActiveTab("browse")}
                  >
                    Browse New Loans
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("apply")}
                  >
                    Apply for Loan
                  </Button>
                  <Button variant="outline" className="w-full">
                    Update Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Credit Score
                  </Button>
                  <Button variant="outline" className="w-full">
                    Upload Documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="browse">
            <LoanBrowser />
          </TabsContent>

          <TabsContent value="apply">
            <LoanApplicationForm onSuccess={() => setActiveTab("applications")} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Loan Applications</CardTitle>
                <CardDescription>Track all your loan applications and their status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(applications) && applications.length > 0 ? applications.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-lg">{app.lender?.firstName} {app.lender?.lastName}</div>
                        <Badge variant={
                          app.status === 'pending' ? 'secondary' :
                          app.status === 'approved' ? 'default' : 
                          'destructive'
                        }>{app.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{app.loanProduct?.loanType}</div>
                      <div className="text-sm">
                        <span className="font-medium">Amount:</span> K{parseFloat(app.requestedAmount).toLocaleString()} • 
                        <span className="font-medium"> Term:</span> {app.requestedTerm} months
                      </div>
                      <div className="text-xs text-muted-foreground">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {app.status === "pending" && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Application
                        </Button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                    <p className="mb-4">You haven't applied for any loans yet.</p>
                    <Button onClick={() => setActiveTab("browse")}>Browse Available Loans</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
