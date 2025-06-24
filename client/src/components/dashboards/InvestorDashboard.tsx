
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const InvestorDashboard = () => {
  const investments = [
    {
      name: "ZamLend Financial",
      type: "Lender Investment",
      amount: "K100,000",
      returns: "K15,200",
      roi: "15.2%",
      performance: 85
    },
    {
      name: "LoanSphere Growth Fund",
      type: "Platform Investment",
      amount: "K250,000",
      returns: "K37,500",
      roi: "15.0%",
      performance: 92
    },
    {
      name: "Copper Capital Portfolio",
      type: "Lender Investment",
      amount: "K75,000",
      returns: "K9,750",
      roi: "13.0%",
      performance: 78
    }
  ];

  return (
    <div className="min-h-screen bg-loansphere-light">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-loansphere-dark">Investor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your investments and returns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-loansphere-green">K425,000</div>
              <p className="text-xs text-muted-foreground">Across 3 investments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-loansphere-yellow">K62,450</div>
              <p className="text-xs text-muted-foreground">+K5,200 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-loansphere-dark">14.7%</div>
              <p className="text-xs text-muted-foreground">Above target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Good</div>
              <p className="text-xs text-muted-foreground">All investments performing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Portfolio</CardTitle>
              <CardDescription>Your current investments and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {investments.map((investment, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{investment.name}</div>
                      <div className="text-sm text-muted-foreground">{investment.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-loansphere-green">{investment.roi}</div>
                      <div className="text-sm text-muted-foreground">{investment.returns}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>{investment.performance}%</span>
                    </div>
                    <Progress value={investment.performance} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Invested: {investment.amount}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Opportunities</CardTitle>
              <CardDescription>New opportunities to grow your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="font-semibold">Platform Expansion Fund</div>
                <div className="text-sm text-muted-foreground">
                  Invest in LoanSphere's growth across Southern Africa
                </div>
                <div className="text-sm">Expected ROI: 16-18%</div>
                <Button size="sm" className="w-full bg-loansphere-green hover:bg-loansphere-green/90">
                  Learn More
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg space-y-2">
                <div className="font-semibold">High-Performing Lenders</div>
                <div className="text-sm text-muted-foreground">
                  Invest in verified lenders with 95%+ repayment rates
                </div>
                <div className="text-sm">Expected ROI: 14-16%</div>
                <Button size="sm" variant="outline" className="w-full">
                  Browse Lenders
                </Button>
              </div>

              <Button className="w-full bg-loansphere-yellow hover:bg-loansphere-yellow/90 text-black">
                View All Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
