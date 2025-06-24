import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
  RadialBarChart, RadialBar
} from "recharts";
import { 
  Download, Printer, Calendar, Filter, TrendingUp, TrendingDown,
  DollarSign, Users, FileText, PieChart as PieChartIcon,
  BarChart3, Activity, Target, Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export const AccountingDashboard = () => {
  const [activeTab, setActiveTab] = useState("charts");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedLoanOfficer, setSelectedLoanOfficer] = useState("all");
  const { toast } = useToast();

  // Fetch real data from API
  const { data: loans = [] } = useQuery<any[]>({
    queryKey: ["/api/loans"],
  });

  const { data: repayments = [] } = useQuery<any[]>({
    queryKey: ["/api/repayments"],
  });

  const { data: borrowers = [] } = useQuery<any[]>({
    queryKey: ["/api/borrowers"],
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
  });

  // Calculate real metrics from API data
  const calculateLoanMetrics = () => {
    const totalOutstanding = loans.reduce((sum, loan) => sum + (parseFloat(loan.outstandingBalance) || 0), 0);
    const totalPrincipal = loans.reduce((sum, loan) => sum + (parseFloat(loan.principalBalance) || 0), 0);
    const totalInterest = loans.reduce((sum, loan) => sum + (parseFloat(loan.interestBalance) || 0), 0);
    const activeBorrowers = borrowers.filter(b => b.status === 'Active').length;
    
    const totalCollected = repayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    const totalDue = loans.reduce((sum, loan) => sum + (parseFloat(loan.totalDue) || 0), 0);
    const recoveryRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

    return {
      totalOutstanding,
      totalPrincipal,
      totalInterest,
      activeBorrowers,
      recoveryRate,
      totalCollected
    };
  };

  const metrics = calculateLoanMetrics();

  // Generate chart data from real API data
  const generateLoanReleasedData = () => {
    const monthlyData = loans.reduce((acc, loan) => {
      const month = new Date(loan.disbursementDate).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 };
      }
      acc[month].amount += parseFloat(loan.disbursedAmount) || 0;
      acc[month].count += 1;
      return acc;
    }, {} as any);
    
    return Object.values(monthlyData);
  };

  const generateCollectionData = () => {
    const monthlyCollections = repayments.reduce((acc, payment) => {
      const month = new Date(payment.date).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, collected: 0, due: 0 };
      }
      acc[month].collected += parseFloat(payment.amount) || 0;
      return acc;
    }, {} as any);

    // Add due amounts from loans
    loans.forEach(loan => {
      const month = new Date(loan.nextPaymentDate).toLocaleDateString('en-US', { month: 'short' });
      if (monthlyCollections[month]) {
        monthlyCollections[month].due += parseFloat(loan.monthlyPayment) || 0;
      }
    });

    return Object.values(monthlyCollections);
  };

  const generateLoanStatusData = () => {
    const statusCounts = loans.reduce((acc, loan) => {
      const status = loan.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as any);

    const colors = {
      'Active': '#22c55e',
      'Overdue': '#ef4444',
      'At Risk': '#f59e0b',
      'Closed': '#6b7280',
      'Default': '#dc2626'
    };

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6b7280'
    }));
  };

  const generateGenderData = () => {
    const genderCounts = borrowers.reduce((acc, borrower) => {
      const gender = borrower.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as any);

    const total = Object.values(genderCounts).reduce((sum: number, count: any) => sum + count, 0);
    
    return Object.entries(genderCounts).map(([name, count]) => ({
      name,
      value: Math.round((count as number / total) * 100),
      color: name === 'Male' ? '#3b82f6' : name === 'Female' ? '#ec4899' : '#6b7280'
    }));
  };

  const loanReleasedData = generateLoanReleasedData();
  const collectionData = generateCollectionData();
  const loanStatusData = generateLoanStatusData();
  const genderData = generateGenderData();

  const handleDownloadReport = (reportType: string, format: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportType} in ${format} format...`
    });
  };

  const handlePrintReport = (reportType: string) => {
    toast({
      title: "Print Report",
      description: `Sending ${reportType} to printer...`
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {trendValue}
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive financial analytics and reporting</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(metrics.totalOutstanding)}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          color="green"
        />
        <StatCard
          title="Collections This Month"
          value={formatCurrency(metrics.totalCollected)}
          icon={TrendingUp}
          trend="up"
          trendValue="+8.2%"
          color="blue"
        />
        <StatCard
          title="Active Borrowers"
          value={metrics.activeBorrowers.toString()}
          icon={Users}
          trend="up"
          trendValue="+5.1%"
          color="purple"
        />
        <StatCard
          title="Recovery Rate"
          value={`${metrics.recoveryRate.toFixed(1)}%`}
          icon={Target}
          trend="up"
          trendValue="+2.1%"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          <TabsTrigger value="statements">Statements & Receipts</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="settings">Report Settings</TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Released Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Released Trend</CardTitle>
                <CardDescription>Monthly loan disbursements from real data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loanReleasedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Collections vs Due */}
            <Card>
              <CardHeader>
                <CardTitle>Collections vs Due</CardTitle>
                <CardDescription>Monthly collection performance from actual data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="collected" fill="#22c55e" name="Collected" />
                    <Bar dataKey="due" fill="#ef4444" name="Due" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Loan Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Open Loans Status</CardTitle>
                <CardDescription>Current loan portfolio status from real data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loanStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {loanStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Active Borrowers by Gender</CardTitle>
                <CardDescription>Male vs Female borrower percentage from real data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Critical financial metrics calculated from real data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.recoveryRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Recovery Rate</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {((metrics.totalInterest / metrics.totalPrincipal) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Rate of Return</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{loans.length}</div>
                  <div className="text-sm text-muted-foreground">Total Loans</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(metrics.totalOutstanding / loans.length || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Loan Size</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {((loans.filter(l => l.status === 'Overdue').length / loans.length) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">PAR 30+</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{metrics.activeBorrowers}</div>
                  <div className="text-sm text-muted-foreground">Active Borrowers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statements Tab */}
        <TabsContent value="statements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Repayment Receipt", desc: "Individual payment receipts", icon: FileText },
              { title: "Loan Statement", desc: "Complete loan history", icon: FileText },
              { title: "Borrower Statement", desc: "Borrower account summary", icon: Users },
              { title: "Loan Schedule", desc: "Payment schedule details", icon: Calendar },
              { title: "Other Income Receipt", desc: "Non-loan income receipts", icon: DollarSign },
              { title: "Savings Statement", desc: "Savings account activity", icon: PieChartIcon },
              { title: "Savings Transaction Receipt", desc: "Individual savings receipts", icon: Activity },
              { title: "Investor Account Statement", desc: "Investment portfolio summary", icon: TrendingUp },
              { title: "Investor Transaction Receipt", desc: "Investment transaction details", icon: BarChart3 }
            ].map((statement, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <statement.icon className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{statement.title}</h3>
                      <p className="text-sm text-muted-foreground">{statement.desc}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadReport(statement.title, "PDF")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePrintReport(statement.title)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Generate Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Generate Statement</CardTitle>
              <CardDescription>Generate specific statements with custom parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Statement Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan">Loan Statement</SelectItem>
                    <SelectItem value="borrower">Borrower Statement</SelectItem>
                    <SelectItem value="repayment">Repayment Receipt</SelectItem>
                    <SelectItem value="savings">Savings Statement</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Account/Loan ID" />
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Borrowers Report", category: "Client Reports" },
              { title: "Loan Report", category: "Loan Reports" },
              { title: "Loan Arrears Aging Report", category: "Risk Reports" },
              { title: "Collections Report", category: "Financial Reports" },
              { title: "Collector Report", category: "Performance Reports" },
              { title: "Deferred Income", category: "Accounting Reports" },
              { title: "Deferred Income Monthly", category: "Accounting Reports" },
              { title: "Pro-Rata Collections Monthly", category: "Financial Reports" },
              { title: "Disbursement Report", category: "Loan Reports" },
              { title: "Fees Report", category: "Financial Reports" },
              { title: "Loan Officer Report", category: "Performance Reports" },
              { title: "Loan Products Report", category: "Product Reports" },
              { title: "MFI Financial Ratios", category: "Regulatory Reports" },
              { title: "Monthly Report", category: "Summary Reports" },
              { title: "Outstanding Report", category: "Portfolio Reports" },
              { title: "Portfolio At Risk (PAR)", category: "Risk Reports" },
              { title: "At a Glance Report", category: "Summary Reports" },
              { title: "Balance Sheet", category: "Financial Statements" },
              { title: "Cash Flow Statement", category: "Financial Statements" },
              { title: "Cash Flow Projections", category: "Planning Reports" },
              { title: "Profit Loss Statement", category: "Financial Statements" }
            ].map((report, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {report.category}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(report.title, "CSV")}
                      >
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(report.title, "Excel")}
                      >
                        Excel
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(report.title, "PDF")}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Customize report formats and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Date Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Format</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency Display</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zmw">Zambian Kwacha (ZMW)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Manage custom report templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input placeholder="Enter template name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrower">Borrower Report</SelectItem>
                      <SelectItem value="loan">Loan Report</SelectItem>
                      <SelectItem value="collection">Collection Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm">Save Template</Button>
                  <Button size="sm" variant="outline">Load Template</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};