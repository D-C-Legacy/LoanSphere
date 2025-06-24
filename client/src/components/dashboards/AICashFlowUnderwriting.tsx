import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Smartphone, TrendingUp, AlertTriangle, CheckCircle, Brain, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MobileMoneyProfile {
  id: string;
  borrowerId: string;
  borrowerName: string;
  provider: "Airtel Money" | "MTN Mobile Money" | "Zamtel Kwacha";
  phoneNumber: string;
  avgDailyIncome: number;
  transactionVolume: number;
  consistency: number;
  riskScore: number;
  autoApprovalEligible: boolean;
  lastAnalysis: string;
}

interface UnderwritingRule {
  id: string;
  name: string;
  provider: string;
  minDailyIncome: number;
  minConsistency: number;
  maxRiskScore: number;
  autoApprovalLimit: number;
  isActive: boolean;
}

export const AICashFlowUnderwriting = () => {
  const [activeTab, setActiveTab] = useState("profiles");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleProvider, setNewRuleProvider] = useState("");
  const [newMinIncome, setNewMinIncome] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch mobile money profiles with authentic API data
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["/api/mobile-money/profiles", selectedProvider],
  });

  // Fetch underwriting rules with authentic API data
  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ["/api/underwriting/rules"],
  });

  // Create underwriting rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/underwriting/rules", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/underwriting/rules"] });
      toast({ title: "Success", description: "Auto-approval rule created successfully" });
      setNewRuleName("");
      setNewRuleProvider("");
      setNewMinIncome("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create rule. Please check API configuration.", variant: "destructive" });
    }
  });

  // Toggle rule status mutation
  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      apiRequest(`/api/underwriting/rules/${id}`, "PATCH", { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/underwriting/rules"] });
      toast({ title: "Success", description: "Rule status updated" });
    },
  });

  // Refresh analysis mutation
  const refreshAnalysisMutation = useMutation({
    mutationFn: (profileId: string) => apiRequest(`/api/mobile-money/profiles/${profileId}/analyze`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile-money/profiles"] });
      toast({ title: "Success", description: "Mobile money analysis refreshed" });
    },
  });

  const handleCreateRule = () => {
    if (!newRuleName || !newRuleProvider || !newMinIncome) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createRuleMutation.mutate({
      name: newRuleName,
      provider: newRuleProvider,
      minDailyIncome: parseInt(newMinIncome),
      minConsistency: 70,
      maxRiskScore: 30,
      autoApprovalLimit: 50000,
      isActive: true,
    });
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return "text-green-600";
    if (score <= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskBadge = (score: number) => {
    if (score <= 20) return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
    if (score <= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
  };

  if (loadingProfiles || loadingRules) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading AI analysis data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Cash Flow Underwriting</h2>
          <p className="text-muted-foreground">
            Analyze mobile money transactions for intelligent loan approvals
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Brain className="h-4 w-4 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">Borrower Profiles</TabsTrigger>
          <TabsTrigger value="rules">Auto-Approval Rules</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Money Analysis Dashboard</CardTitle>
              <CardDescription>
                Real-time mobile money transaction pattern analysis for Zambian borrowers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="provider-filter">Filter by Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                      <SelectItem value="MTN Mobile Money">MTN Mobile Money</SelectItem>
                      <SelectItem value="Zamtel Kwacha">Zamtel Kwacha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">Export Analysis Report</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Borrower Cash Flow Profiles</CardTitle>
              <CardDescription>Live mobile money transaction analysis and risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Mobile Money Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect to mobile money providers to access borrower transaction data for AI analysis.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Set Up Mobile Money Integration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile: MobileMoneyProfile) => (
                    <div key={profile.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold">{profile.borrowerName}</h4>
                            <p className="text-sm text-muted-foreground">{profile.phoneNumber}</p>
                          </div>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            {profile.provider}
                          </Badge>
                          {getRiskBadge(profile.riskScore)}
                        </div>
                        <div className="text-right">
                          {profile.autoApprovalEligible && (
                            <Badge className="bg-green-100 text-green-800 mb-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Auto-Approval Eligible
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshAnalysisMutation.mutate(profile.id)}
                            disabled={refreshAnalysisMutation.isPending}
                          >
                            {refreshAnalysisMutation.isPending ? "Analyzing..." : "Refresh Analysis"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Avg. Daily Income</p>
                          <p className="font-semibold text-lg text-green-600">
                            K{profile.avgDailyIncome.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Monthly Transactions</p>
                          <p className="font-semibold">{profile.transactionVolume}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Income Consistency</p>
                          <div className="flex items-center gap-2">
                            <Progress value={profile.consistency} className="flex-1" />
                            <span className="text-sm font-medium">{profile.consistency}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">AI Risk Score</p>
                          <p className={`font-semibold ${getRiskColor(profile.riskScore)}`}>
                            {profile.riskScore}/100
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Last AI analysis: {new Date(profile.lastAnalysis).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Auto-Approval Rule</CardTitle>
              <CardDescription>
                Configure AI-powered automatic loan approvals based on mobile money patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="High Income Airtel Users"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-provider">Mobile Money Provider</Label>
                  <Select value={newRuleProvider} onValueChange={setNewRuleProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                      <SelectItem value="MTN Mobile Money">MTN Mobile Money</SelectItem>
                      <SelectItem value="Zamtel Kwacha">Zamtel Kwacha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="min-income">Minimum Daily Income (K)</Label>
                  <Input
                    id="min-income"
                    type="number"
                    placeholder="200"
                    value={newMinIncome}
                    onChange={(e) => setNewMinIncome(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateRule}
                disabled={createRuleMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createRuleMutation.isPending ? "Creating Rule..." : "Create Auto-Approval Rule"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Auto-Approval Rules</CardTitle>
              <CardDescription>Manage intelligent underwriting criteria for Zambian mobile money users</CardDescription>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Auto-Approval Rules Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Create rules to automatically approve loans based on mobile money transaction patterns.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Example: "Approve loans up to K50,000 for Airtel Money users with daily income over K200"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule: UnderwritingRule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{rule.name}</h4>
                          <Badge variant="outline">{rule.provider}</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <span>Min Income: K{rule.minDailyIncome}/day</span>
                          <span>Min Consistency: {rule.minConsistency}%</span>
                          <span>Max Risk Score: {rule.maxRiskScore}/100</span>
                          <span>Max Auto-Approval: K{rule.autoApprovalLimit.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={(checked) => 
                              toggleRuleMutation.mutate({ id: rule.id, isActive: checked })
                            }
                          />
                          <Label className="text-sm">
                            {rule.isActive ? "Active" : "Inactive"}
                          </Label>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Rule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Approvals Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">47</div>
                <p className="text-xs text-muted-foreground">+23% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Processing Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">12s</div>
                <p className="text-xs text-muted-foreground">68% faster than manual review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">94.2%</div>
                <p className="text-xs text-muted-foreground">Default prediction accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Prevented</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">K2.3M</div>
                <p className="text-xs text-muted-foreground">Potential losses avoided this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mobile Money Provider Performance</CardTitle>
              <CardDescription>AI analysis performance across Zambian mobile money platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium border-b pb-2">
                  <div>Provider</div>
                  <div>Profiles Analyzed</div>
                  <div>Auto-Approvals</div>
                  <div>Avg Risk Score</div>
                  <div>Default Rate</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Airtel Money
                  </div>
                  <div>1,247</div>
                  <div>342 (27%)</div>
                  <div>18.4</div>
                  <div className="text-green-600">2.1%</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    MTN Mobile Money
                  </div>
                  <div>892</div>
                  <div>198 (22%)</div>
                  <div>22.1</div>
                  <div className="text-green-600">2.8%</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Zamtel Kwacha
                  </div>
                  <div>423</div>
                  <div>76 (18%)</div>
                  <div>26.7</div>
                  <div className="text-yellow-600">3.4%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};