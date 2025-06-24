import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  Share2,
  Copy,
  Mail,
  Phone,
  Calendar,
  Award,
  BarChart3,
  Plus
} from "lucide-react";

interface Referral {
  id: number;
  lenderName: string;
  email: string;
  status: "Pending" | "Approved" | "Active" | "Rejected";
  signupDate: string;
  subscriptionPlan: string;
  commissionEarned: string;
  monthlyRevenue: string;
}

interface Commission {
  id: number;
  lenderName: string;
  period: string;
  subscriptionFee: string;
  commissionRate: number;
  commissionAmount: string;
  status: "Pending" | "Paid" | "Processing";
  paymentDate?: string;
}

interface DistributorSummary {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: string;
  monthlyEarnings: string;
  conversionRate: string;
  tier: string;
}

export default function DistributorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [referralCode] = useState(`LOAN${user?.id || '000'}REF`);
  const [referralLink] = useState(`https://loansphere.com/lender-signup?ref=${referralCode}`);

  const { data: referrals, isLoading: referralsLoading } = useQuery<Referral[]>({
    queryKey: ["/api/distributor/referrals"],
    enabled: !!user,
  });

  const { data: commissions, isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ["/api/distributor/commissions"],
    enabled: !!user,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<DistributorSummary>({
    queryKey: ["/api/distributor/summary"],
    enabled: !!user,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Paid":
        return "bg-emerald-100 text-emerald-800";
      case "Processing":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isLoading = referralsLoading || commissionsLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loansphere-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your distributor dashboard...</p>
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
              <h1 className="text-3xl font-bold">Distributor Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Earn commissions by referring lenders to LoanSphere
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1">
                {summary?.tier || "Bronze"} Partner
              </Badge>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Share2 className="h-4 w-4 mr-2" />
                Share Referral
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-loansphere-green" />
                <div>
                  <p className="text-2xl font-bold">{summary?.totalReferrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.activeReferrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Lenders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.totalCommissions || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.monthlyEarnings || "ZMW 0"}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{summary?.conversionRate || "0%"}</p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">20%</p>
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="tools">Referral Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referral Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                  <CardDescription>Your latest lender referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  {referrals && referrals.length > 0 ? (
                    <div className="space-y-4">
                      {referrals.slice(0, 4).map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-loansphere-green/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-loansphere-green" />
                            </div>
                            <div>
                              <p className="font-medium">{referral.lenderName}</p>
                              <p className="text-sm text-muted-foreground">
                                {referral.subscriptionPlan} • {new Date(referral.signupDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(referral.status)}>
                              {referral.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {referral.commissionEarned}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("referrals")}
                        className="w-full"
                      >
                        View All Referrals
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start sharing your referral link to earn commissions from lender signups.
                      </p>
                      <Button
                        onClick={() => setActiveTab("tools")}
                        className="bg-loansphere-green hover:bg-loansphere-green/90"
                      >
                        Get Referral Tools
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Commission Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Commission Earnings</CardTitle>
                  <CardDescription>Your monthly commission breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {commissions && commissions.length > 0 ? (
                    <div className="space-y-4">
                      {commissions.slice(0, 4).map((commission) => (
                        <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{commission.lenderName}</p>
                            <p className="text-sm text-muted-foreground">
                              {commission.period} • {commission.commissionRate}% rate
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">{commission.commissionAmount}</p>
                            <Badge className={getStatusColor(commission.status)}>
                              {commission.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("commissions")}
                        className="w-full"
                      >
                        View All Commissions
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Commissions Yet</h3>
                      <p className="text-muted-foreground">
                        Commissions will appear here once your referred lenders start paying subscriptions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>All Referrals</CardTitle>
                <CardDescription>Track all your lender referrals and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Referrals Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start referring lenders using your unique referral code and link.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tools")}
                    className="bg-loansphere-green hover:bg-loansphere-green/90"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Get Referral Tools
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>Track your commission payments and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Commission History</h3>
                  <p className="text-muted-foreground">
                    Your commission earnings will appear here once referred lenders become active.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referral Code & Link */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Tools</CardTitle>
                  <CardDescription>Use these tools to refer new lenders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="referral-code">Referral Code</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="referral-code"
                        value={referralCode}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(referralCode, "Referral code")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="referral-link">Referral Link</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="referral-link"
                        value={referralLink}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(referralLink, "Referral link")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Quick Share</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => window.open(`mailto:?subject=Join LoanSphere as a Lender&body=I'd like to invite you to join LoanSphere, Zambia's leading loan marketplace. Use my referral link: ${referralLink}`, '_blank')}
                        className="w-full"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`sms:?body=Join LoanSphere as a lender using my referral: ${referralLink}`, '_blank')}
                        className="w-full"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        SMS
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Structure */}
              <Card>
                <CardHeader>
                  <CardTitle>Commission Structure</CardTitle>
                  <CardDescription>How you earn from referrals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Base Commission</span>
                      <span className="text-2xl font-bold text-green-600">20%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Earn 20% of monthly subscription fees from your referrals
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Monthly Earnings Per Plan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Starter Plan (ZMW 120)</span>
                        <span className="font-medium">ZMW 24/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Plan (ZMW 250)</span>
                        <span className="font-medium">ZMW 50/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enterprise Plan (ZMW 400)</span>
                        <span className="font-medium">ZMW 80/month</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Bonus Opportunities</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 5 referrals: +5% bonus rate</li>
                      <li>• 10 referrals: +10% bonus rate</li>
                      <li>• 25 referrals: Silver Partner status</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}