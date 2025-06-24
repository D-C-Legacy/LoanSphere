
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export const DistributorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const referrals = [
    {
      lender: "FastCash Loans",
      joinDate: "2024-01-10",
      status: "Active",
      subscription: "Premium",
      commission: "K2,400",
      monthlyValue: "K12,000"
    },
    {
      lender: "MicroLend Zambia",
      joinDate: "2024-01-05",
      status: "Active",
      subscription: "Basic",
      commission: "K800",
      monthlyValue: "K4,000"
    },
    {
      lender: "Capital Trust",
      joinDate: "2023-12-28",
      status: "Pending",
      subscription: "Enterprise",
      commission: "K0",
      monthlyValue: "K25,000"
    }
  ];

  const commissionHistory = [
    { month: "January 2024", amount: "K8,200", lenders: 12, status: "Paid" },
    { month: "December 2023", amount: "K7,600", lenders: 11, status: "Paid" },
    { month: "November 2023", amount: "K6,800", lenders: 10, status: "Paid" },
  ];

  return (
    <div className="min-h-screen bg-loansphere-light">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-loansphere-dark">Distributor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your partnerships and track commissions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-loansphere-green">12</div>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-loansphere-yellow">K8,200</div>
                  <p className="text-xs text-muted-foreground">20% of subscriptions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-loansphere-dark">K45,600</div>
                  <p className="text-xs text-muted-foreground">Since joining</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">78%</div>
                  <p className="text-xs text-muted-foreground">Above average</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest referrals and commissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {referrals.slice(0, 3).map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-semibold">{referral.lender}</div>
                        <div className="text-sm text-muted-foreground">
                          {referral.subscription} Plan • {referral.monthlyValue}/month
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={referral.status === "Active" ? "default" : "secondary"}>
                          {referral.status}
                        </Badge>
                        <div className="text-sm font-semibold text-loansphere-green">
                          {referral.commission}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common distributor tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-loansphere-green hover:bg-loansphere-green/90"
                    onClick={() => setActiveTab("tools")}
                  >
                    Get Referral Link
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("commissions")}
                  >
                    View Commission Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Marketing Kit
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Payout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Referrals</CardTitle>
                <CardDescription>Track your referred lenders and their status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {referrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-lg">{referral.lender}</div>
                        <Badge variant={referral.status === "Active" ? "default" : "secondary"}>
                          {referral.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Joined: {referral.joinDate}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Plan:</span> {referral.subscription} • 
                        <span className="font-medium"> Value:</span> {referral.monthlyValue}/month
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Commission Earned:</span> 
                        <span className="text-loansphere-green font-semibold"> {referral.commission}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>Track your monthly commission payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {commissionHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-6 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-semibold">{record.month}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.lenders} active lenders
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold text-lg text-loansphere-green">
                        {record.amount}
                      </div>
                      <Badge variant="default">{record.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distributor Tools</CardTitle>
                <CardDescription>Resources to grow your network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-loansphere/10 rounded-lg">
                  <div className="font-semibold mb-2">Your Referral Link</div>
                  <div className="text-sm bg-white p-3 rounded border font-mono break-all">
                    https://loansphere.zm/join?ref=DIST123
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      Copy Link
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Share via WhatsApp
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full bg-loansphere-green hover:bg-loansphere-green/90">
                    Download Marketing Kit
                  </Button>
                  <Button variant="outline" className="w-full">
                    Generate QR Code
                  </Button>
                  <Button variant="outline" className="w-full">
                    Track Link Performance
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Payout
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Commission Structure</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• Basic Plan: 20% commission (K20/month per lender)</div>
                    <div>• Premium Plan: 20% commission (K50/month per lender)</div>
                    <div>• Enterprise Plan: 20% commission (K100/month per lender)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
