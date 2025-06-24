import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  MapPin,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  FileText
} from "lucide-react";

export const PortfolioOverview = () => {
  const [timeframe, setTimeframe] = useState("30d");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Fetch portfolio data from API
  const { data: portfolioStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/portfolio/stats", timeframe],
  });

  const { data: geographicData, isLoading: geoLoading } = useQuery({
    queryKey: ["/api/portfolio/geographic"],
  });

  const { data: loanProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/loan-products"],
  });

  // Use real API data or show empty state
  const displayStats = portfolioStats || {
    totalPortfolio: 0,
    activeLoan: 0,
    overdueLoans: 0,
    defaultRate: 0,
    avgLoanSize: 0,
    collectionRate: 0,
    regions: []
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Portfolio Overview</h1>
          <p className="text-gray-600 mt-1">Comprehensive portfolio analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Portfolio Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "Loading..." : `K${(displayStats.totalPortfolio / 1000000).toFixed(1)}M`}
                </p>
                <p className="text-xs text-gray-500 mt-1">Outstanding balance</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "Loading..." : displayStats.activeLoan}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {displayStats.avgLoanSize > 0 ? `Avg: K${displayStats.avgLoanSize.toLocaleString()}` : "No active loans"}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "Loading..." : `${displayStats.collectionRate}%`}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Default Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "Loading..." : `${displayStats.defaultRate}%`}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {displayStats.overdueLoans} overdue loans
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="geographic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geographic">Geographic Distribution</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="trends">Portfolio Trends</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="geographic" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Zambian Regions Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {geoLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading geographic data...</p>
                  </div>
                ) : displayStats.regions && displayStats.regions.length > 0 ? (
                  <div className="space-y-4">
                    {displayStats.regions.map((region) => (
                      <div key={region.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{region.name}</p>
                          <p className="text-sm text-gray-600">{region.loans} loans</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">K{(region.amount / 1000).toFixed(0)}K</p>
                          <p className="text-sm text-gray-600">
                            {((region.amount / displayStats.totalPortfolio) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No geographic data</p>
                    <p className="text-sm text-gray-400">Regional distribution will appear with active loans</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Regional Performance Chart</p>
                  <p className="text-sm text-gray-400">Visual analytics will display with portfolio data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading product data...</p>
                </div>
              ) : (loanProducts && loanProducts.length > 0) ? (
                <div className="space-y-4">
                  {loanProducts.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{product.title}</h3>
                        <Badge variant="secondary">
                          {product.loanType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Interest Rate</p>
                          <p className="font-medium">{product.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount Range</p>
                          <p className="font-medium">K{product.minAmount} - K{product.maxAmount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Term Range</p>
                          <p className="font-medium">{product.minTerm} - {product.maxTerm} months</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No loan products</p>
                  <p className="text-sm text-gray-400">Product performance will display with active products</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Portfolio Growth Trends</p>
                  <p className="text-sm text-gray-400">Time-series charts will display with portfolio activity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Seasonal Patterns</p>
                  <p className="text-sm text-gray-400">Monthly analysis will display with loan history</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Risk Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Risk Analysis</p>
                  <p className="text-sm text-gray-400">Risk metrics will calculate with portfolio data</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Risk Category Distribution</p>
                  <p className="text-sm text-gray-400">Risk analysis charts will display with loan data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};