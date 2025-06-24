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
  TrendingUp, 
  DollarSign, 
  Percent, 
  Calendar,
  Eye,
  Plus,
  Target,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { useLocation } from "wouter";

interface InvestmentOpportunity {
  id: number;
  lenderId: number;
  lenderName: string;
  title: string;
  description: string;
  targetAmount: string;
  raisedAmount: string;
  expectedReturn: string;
  duration: string;
  riskLevel: "Low" | "Medium" | "High";
  minInvestment: string;
  loanCount: number;
  status: "Active" | "Funded" | "Completed";
  daysRemaining: number;
}

interface Portfolio {
  id: number;
  lenderName: string;
  investmentAmount: string;
  currentValue: string;
  returns: string;
  returnPercentage: number;
  duration: string;
  status: "Active" | "Matured" | "Pending";
  nextPayment: string;
}

interface InvestorSummary {
  totalInvested: string;
  activeInvestments: number;
  totalReturns: string;
  averageReturn: string;
  portfolioValue: string;
}

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<InvestmentOpportunity[]>({
    queryKey: ["/api/investor/opportunities"],
    enabled: !!user,
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/investor/portfolio"],
    enabled: !!user,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<InvestorSummary>({
    queryKey: ["/api/investor/summary"],
    enabled: !!user,
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Funded":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "Matured":
        return "bg-emerald-100 text-emerald-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isLoading = opportunitiesLoading || portfolioLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loansphere-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your investment dashboard...</p>
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
              <h1 className="text-3xl font-bold">Investment Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage your loan investments and track portfolio performance
              </p>
            </div>
            <Button
              onClick={() => setActiveTab("opportunities")}
              className="bg-loansphere-green hover:bg-loansphere-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Investment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-loansphere-green" />
                <div>
                  <p className="text-2xl font-bold">{summary?.totalInvested || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.activeInvestments || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Investments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.totalReturns || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Percent className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.averageReturn || "0%"}</p>
                  <p className="text-sm text-muted-foreground">Average Return</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <PieChart className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.portfolioValue || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Investment Opportunities</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="returns">Returns & Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Opportunities</CardTitle>
                  <CardDescription>High-performing lenders seeking investment</CardDescription>
                </CardHeader>
                <CardContent>
                  {opportunities && opportunities.length > 0 ? (
                    <div className="space-y-4">
                      {opportunities.slice(0, 3).map((opp) => (
                        <div key={opp.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{opp.title}</h3>
                              <p className="text-sm text-muted-foreground">{opp.lenderName}</p>
                            </div>
                            <Badge className={getRiskColor(opp.riskLevel)}>
                              {opp.riskLevel} Risk
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <p className="font-medium">{opp.expectedReturn}</p>
                              <p className="text-muted-foreground">Expected Return</p>
                            </div>
                            <div>
                              <p className="font-medium">{opp.minInvestment}</p>
                              <p className="text-muted-foreground">Min Investment</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{opp.raisedAmount} / {opp.targetAmount}</span>
                            </div>
                            <Progress 
                              value={
                                (parseFloat(opp.raisedAmount.replace(/[^\d.]/g, '')) / 
                                 parseFloat(opp.targetAmount.replace(/[^\d.]/g, ''))) * 100
                              } 
                              className="h-2" 
                            />
                          </div>
                          
                          <Button size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("opportunities")}
                        className="w-full"
                      >
                        View All Opportunities
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Opportunities Available</h3>
                      <p className="text-muted-foreground">
                        New investment opportunities will appear here when lenders join the platform.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Portfolio Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Your active investments overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolio && portfolio.length > 0 ? (
                    <div className="space-y-4">
                      {portfolio.slice(0, 3).map((investment) => (
                        <div key={investment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              investment.returnPercentage > 0 ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <p className="font-medium">{investment.lenderName}</p>
                              <p className="text-sm text-muted-foreground">
                                {investment.investmentAmount} invested
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">+{investment.returns}</p>
                            <p className="text-sm text-muted-foreground">
                              {investment.returnPercentage > 0 ? '+' : ''}{investment.returnPercentage}%
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("portfolio")}
                        className="w-full"
                      >
                        View Full Portfolio
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start investing to track your portfolio performance here.
                      </p>
                      <Button
                        onClick={() => setActiveTab("opportunities")}
                        className="bg-loansphere-green hover:bg-loansphere-green/90"
                      >
                        Browse Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>Discover vetted lenders seeking investment capital</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Investment opportunities will be available once we have active lenders on the platform.
                  </p>
                  <Button
                    onClick={() => setLocation("/")}
                    className="bg-loansphere-green hover:bg-loansphere-green/90"
                  >
                    Learn More About LoanSphere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>My Investment Portfolio</CardTitle>
                <CardDescription>Track performance of your active investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Investments</h3>
                  <p className="text-muted-foreground">
                    Your investment portfolio will appear here once you start investing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns">
            <Card>
              <CardHeader>
                <CardTitle>Returns & Payments</CardTitle>
                <CardDescription>Track your investment returns and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Payment History</h3>
                  <p className="text-muted-foreground">
                    Your investment returns and payment history will appear here.
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