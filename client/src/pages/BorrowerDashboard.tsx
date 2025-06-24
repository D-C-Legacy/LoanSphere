import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar,
  Search,
  Plus,
  Download,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

interface LoanApplication {
  id: number;
  loanProductId: number;
  productTitle: string;
  lenderName: string;
  requestedAmount: string;
  requestedTerm: number;
  status: "pending" | "under_review" | "approved" | "rejected" | "disbursed";
  submittedAt: string;
  updatedAt: string;
  interestRate: string;
  monthlyPayment?: string;
}

interface LoanSummary {
  totalApplications: number;
  activeLoans: number;
  totalBorrowed: string;
  monthlyPayments: string;
}

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: applications, isLoading: applicationsLoading } = useQuery<LoanApplication[]>({
    queryKey: [`/api/borrower/applications`],
    enabled: !!user,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<LoanSummary>({
    queryKey: [`/api/borrower/summary`],
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under_review":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "disbursed":
        return <CheckCircle className="h-4 w-4 text-loansphere-green" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "disbursed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isLoading = applicationsLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loansphere-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'Borrower'}</h1>
              <p className="text-muted-foreground mt-2">
                Manage your loan applications and track your borrowing journey
              </p>
            </div>
            <Button
              onClick={() => setLocation("/loans")}
              className="bg-loansphere-green hover:bg-loansphere-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-loansphere-green" />
                <div>
                  <p className="text-2xl font-bold">{summary?.totalApplications || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.activeLoans || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.totalBorrowed || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">Total Borrowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.monthlyPayments || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">Monthly Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="active-loans">Active Loans</TabsTrigger>
            <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest loan application status</CardDescription>
                </CardHeader>
                <CardContent>
                  {applications && applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <p className="font-medium">{app.productTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {app.lenderName} • {app.requestedAmount}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("applications")}
                        className="w-full"
                      >
                        View All Applications
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by browsing available loans and submit your first application.
                      </p>
                      <Button
                        onClick={() => setLocation("/loans")}
                        className="bg-loansphere-green hover:bg-loansphere-green/90"
                      >
                        Browse Loans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setLocation("/loans")}
                    className="w-full justify-start bg-loansphere-green hover:bg-loansphere-green/90"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find New Loans
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("applications")}
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Track Applications
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("payment-history")}
                    className="w-full justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>Track the status of all your loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <Card key={app.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(app.status)}
                            <div>
                              <h3 className="font-semibold">{app.productTitle}</h3>
                              <p className="text-sm text-muted-foreground">
                                {app.lenderName} • Applied {new Date(app.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(app.status)}>
                              {app.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {app.requestedAmount} • {app.requestedTerm} months
                            </p>
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Interest Rate: {app.interestRate}</span>
                            {app.monthlyPayment && (
                              <span>Monthly Payment: {app.monthlyPayment}</span>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Applications</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't submitted any loan applications yet. Browse our marketplace to get started.
                    </p>
                    <Button
                      onClick={() => setLocation("/loans")}
                      className="bg-loansphere-green hover:bg-loansphere-green/90"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse Available Loans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active-loans">
            <Card>
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
                <CardDescription>Manage your current loan obligations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Loans</h3>
                  <p className="text-muted-foreground">
                    Once your applications are approved and disbursed, they'll appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all your loan payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Payment History</h3>
                  <p className="text-muted-foreground">
                    Your payment history will appear here once you start making loan payments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}