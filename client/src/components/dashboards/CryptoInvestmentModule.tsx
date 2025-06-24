import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Shield, Activity, Coins, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CryptoInvestment {
  id: string;
  investorId: string;
  stablecoin: "USDC" | "USDT" | "DAI";
  amountUSD: number;
  amountZMW: number;
  expectedAPR: number;
  currentReturns: number;
  portfolioHealth: number;
  repaymentRate: number;
  status: "active" | "pending" | "completed" | "liquidated";
  startDate: string;
  maturityDate: string;
  riskLevel: "low" | "medium" | "high";
}

interface DebtSwapOpportunity {
  id: string;
  loanType: string;
  originalAmount: string;
  discountPrice: string;
  discountPercentage: number;
  borrowerProfile: string;
  delinquencyPeriod: string;
  expectedRecovery: number;
  riskAssessment: "low" | "medium" | "high";
  bidDeadline: string;
  currentBids: number;
  highestBid: string;
}

export const CryptoInvestmentModule = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [selectedStablecoin, setSelectedStablecoin] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cryptoInvestments = [], isLoading: loadingCrypto } = useQuery({
    queryKey: ["/api/crypto-investments"],
  });

  const { data: debtSwapOpportunities = [], isLoading: loadingDebt } = useQuery({
    queryKey: ["/api/debt-swap/opportunities"],
  });

  const createCryptoInvestmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/crypto-investments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-investments"] });
      toast({ title: "Success", description: "Crypto investment created successfully" });
      setInvestmentAmount("");
      setSelectedStablecoin("");
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: ({ opportunityId, bidAmount }: { opportunityId: string; bidAmount: string }) => 
      apiRequest(`/api/debt-swap/opportunities/${opportunityId}/bid`, "POST", { bidAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debt-swap/opportunities"] });
      toast({ title: "Success", description: "Bid placed successfully" });
      setBidAmount("");
    },
  });

  const handleCreateInvestment = () => {
    if (!investmentAmount || !selectedStablecoin) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    createCryptoInvestmentMutation.mutate({
      stablecoin: selectedStablecoin,
      amountUSD: parseFloat(investmentAmount),
      expectedAPR: 15,
      riskLevel: "medium",
    });
  };

  const handlePlaceBid = (opportunityId: string) => {
    if (!bidAmount) {
      toast({ title: "Error", description: "Please enter bid amount", variant: "destructive" });
      return;
    }

    placeBidMutation.mutate({ opportunityId, bidAmount });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low": return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case "high": return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
      default: return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crypto Investment & Debt Trading</h2>
          <p className="text-muted-foreground">
            Stablecoin investments and debt swap marketplace for premium investors
          </p>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Coins className="h-4 w-4 mr-1" />
          Premium Feature
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Crypto Collateralization
          </TabsTrigger>
          <TabsTrigger value="debt-swap" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Debt Swap Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stablecoin Investment Portal</CardTitle>
              <CardDescription>
                Fund Zambian loans with stablecoins and earn competitive returns in ZMW
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How Crypto-Collateralization Works:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Fund K50,000 equivalent in USDC, USDT, or DAI</li>
                  <li>Earn 15% APR paid in Zambian Kwacha (ZMW)</li>
                  <li>Portfolio health tracking with 98% repayment rates</li>
                  <li>Automated currency conversion and local disbursement</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investment-amount">Investment Amount (USD)</Label>
                  <Input
                    id="investment-amount"
                    type="number"
                    placeholder="1000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stablecoin">Stablecoin</Label>
                  <Select value={selectedStablecoin} onValueChange={setSelectedStablecoin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stablecoin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCreateInvestment}
                disabled={createCryptoInvestmentMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {createCryptoInvestmentMutation.isPending ? "Processing..." : "Create Crypto Investment"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Crypto Investments</CardTitle>
              <CardDescription>Monitor your stablecoin-backed loan investments</CardDescription>
            </CardHeader>
            <CardContent>
              {cryptoInvestments.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Crypto Investments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start funding Zambian loans with stablecoins to earn 15% APR in ZMW.
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Minimum investment: $100 USD equivalent</p>
                    <p>• Portfolio health monitoring included</p>
                    <p>• Returns paid monthly in Zambian Kwacha</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cryptoInvestments.map((investment: CryptoInvestment) => (
                    <div key={investment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Coins className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{investment.stablecoin} Investment</h4>
                            <p className="text-sm text-muted-foreground">
                              ${investment.amountUSD.toLocaleString()} → K{investment.amountZMW.toLocaleString()}
                            </p>
                          </div>
                          {getRiskBadge(investment.riskLevel)}
                        </div>
                        <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                          {investment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Expected APR</p>
                          <p className="font-semibold text-green-600">{investment.expectedAPR}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Current Returns</p>
                          <p className="font-semibold">K{investment.currentReturns.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Portfolio Health</p>
                          <div className="flex items-center gap-2">
                            <Progress value={investment.portfolioHealth} className="flex-1" />
                            <span className="text-sm font-medium">{investment.portfolioHealth}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Repayment Rate</p>
                          <p className="font-semibold text-green-600">{investment.repaymentRate}%</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        Maturity: {new Date(investment.maturityDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt-swap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Debt Swap Marketplace</CardTitle>
              <CardDescription>
                Bid on delinquent loans at discounted rates - targeting civil servant loans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Investment Strategy</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Buy delinquent civil servant loans at 60% face value with higher recovery potential 
                  due to government salary deductions.
                </p>
              </div>

              {debtSwapOpportunities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Debt Swap Opportunities</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back later for delinquent loan acquisition opportunities.
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Focus on civil servant loans for better recovery rates</p>
                    <p>• Typical discounts: 40-60% off face value</p>
                    <p>• Recovery through salary deductions when possible</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {debtSwapOpportunities.map((opportunity: DebtSwapOpportunity) => (
                    <div key={opportunity.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{opportunity.loanType}</h4>
                          <p className="text-sm text-muted-foreground">{opportunity.borrowerProfile}</p>
                        </div>
                        <div className="text-right">
                          {getRiskBadge(opportunity.riskAssessment)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {opportunity.currentBids} bids
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Original Amount</p>
                          <p className="font-semibold">{opportunity.originalAmount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Discount Price</p>
                          <p className="font-semibold text-green-600">{opportunity.discountPrice}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Discount</p>
                          <p className="font-semibold text-orange-600">{opportunity.discountPercentage}% off</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Expected Recovery</p>
                          <p className="font-semibold">{opportunity.expectedRecovery}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label htmlFor={`bid-${opportunity.id}`}>Your Bid Amount</Label>
                          <Input
                            id={`bid-${opportunity.id}`}
                            placeholder={opportunity.discountPrice}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => handlePlaceBid(opportunity.id)}
                          disabled={placeBidMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {placeBidMutation.isPending ? "Placing..." : "Place Bid"}
                        </Button>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        Delinquent for: {opportunity.delinquencyPeriod} • 
                        Bid deadline: {new Date(opportunity.bidDeadline).toLocaleDateString()} • 
                        Highest bid: {opportunity.highestBid}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crypto Investments</CardTitle>
            <Coins className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$24.7k</div>
            <p className="text-xs text-muted-foreground">≈ K520,000 ZMW</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt Swap Portfolio</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">K180k</div>
            <p className="text-xs text-muted-foreground">5 acquired loan packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combined Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18.4%</div>
            <p className="text-xs text-muted-foreground">Weighted average APR</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};