import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Users, 
  Search,
  Filter,
  Eye,
  Plus,
  Phone,
  MessageSquare,
  Calendar,
  Target,
  TrendingDown,
  FileText,
  Send,
  UserCheck,
  MapPin
} from "lucide-react";

export const CollectionsManagement = () => {
  const [activeTab, setActiveTab] = useState("overdue");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDueDate: "",
    reason: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch overdue loans from API
  const { data: overdueLoans = [], isLoading: loadingOverdue } = useQuery({
    queryKey: ["/api/loans/overdue"],
  });

  // Fetch collection activities from API
  const { data: collectionActivities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["/api/collections/activities"],
  });

  // Fetch field agents from API
  const { data: fieldAgents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["/api/field-agents"],
  });

  // Send SMS reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async ({ loanId, message }: { loanId: number; message: string }) => {
      return await apiRequest(`/api/loans/${loanId}/send-reminder`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent",
        description: "Payment reminder sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send SMS reminder",
        variant: "destructive",
      });
    },
  });

  // Reschedule payment mutation
  const reschedulePaymentMutation = useMutation({
    mutationFn: async (rescheduleData: any) => {
      return await apiRequest(`/api/loans/${selectedLoan?.id}/reschedule`, {
        method: "POST",
        body: JSON.stringify(rescheduleData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans/overdue"] });
      setShowRescheduleDialog(false);
      setSelectedLoan(null);
      toast({
        title: "Success",
        description: "Payment rescheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reschedule payment",
        variant: "destructive",
      });
    },
  });

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      low: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      medium: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      high: { variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    };
    
    const config = riskConfig[riskLevel as keyof typeof riskConfig] || riskConfig.low;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  const handleSendReminder = (loan: any) => {
    const message = `Hello ${loan.borrowerName}, your loan payment of K${loan.outstandingAmount?.toLocaleString()} is ${loan.daysOverdue} days overdue. Please make payment via mobile money or visit our office. Thank you.`;
    sendReminderMutation.mutate({ loanId: loan.id, message });
  };

  const handleReschedule = () => {
    if (!selectedLoan || !rescheduleForm.newDueDate) return;

    reschedulePaymentMutation.mutate({
      newDueDate: rescheduleForm.newDueDate,
      reason: rescheduleForm.reason,
      notes: rescheduleForm.notes,
    });
  };

  const filteredOverdueLoans = overdueLoans.filter((loan: any) => {
    const matchesSearch = loan.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.borrowerPhone?.includes(searchTerm);
    const matchesRisk = riskFilter === "all" || loan.riskLevel === riskFilter;
    const matchesRegion = regionFilter === "all" || loan.region === regionFilter;
    return matchesSearch && matchesRisk && matchesRegion;
  });

  const regions = ["Lusaka", "Copperbelt", "Central", "Eastern", "Northern", "Western", "Southern", "North-Western", "Muchinga", "Luapula"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Collections & Delinquency</h1>
          <p className="text-gray-600 mt-1">Manage overdue loans and collection activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Collection Report
          </Button>
          <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
            <DialogTrigger asChild>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reschedule Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedLoan && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Loan:</p>
                          <p className="font-medium">{selectedLoan.loanNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Borrower:</p>
                          <p className="font-medium">{selectedLoan.borrowerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount Due:</p>
                          <p className="font-medium">K{selectedLoan.outstandingAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Days Overdue:</p>
                          <p className="font-medium text-red-600">{selectedLoan.daysOverdue} days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label>New Due Date</Label>
                  <Input
                    type="date"
                    value={rescheduleForm.newDueDate}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, newDueDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Reason for Rescheduling</Label>
                  <Select 
                    value={rescheduleForm.reason} 
                    onValueChange={(value) => setRescheduleForm({...rescheduleForm, reason: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial_hardship">Financial Hardship</SelectItem>
                      <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                      <SelectItem value="job_loss">Job Loss</SelectItem>
                      <SelectItem value="seasonal_income">Seasonal Income Delay</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about the rescheduling"
                    value={rescheduleForm.notes}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, notes: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleReschedule}
                    disabled={!rescheduleForm.newDueDate || reschedulePaymentMutation.isPending}
                  >
                    {reschedulePaymentMutation.isPending ? "Rescheduling..." : "Reschedule Payment"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingOverdue ? "Loading..." : overdueLoans.length}
                </p>
                <p className="text-xs text-red-600 mt-1">Requiring attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingOverdue ? "Loading..." : 
                    `K${overdueLoans.reduce((sum: number, loan: any) => sum + (loan.outstandingAmount || 0), 0).toLocaleString()}`
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Principal + interest</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingOverdue ? "Loading..." : 
                    overdueLoans.filter((loan: any) => loan.riskLevel === "high").length
                  }
                </p>
                <p className="text-xs text-red-600 mt-1">Immediate action needed</p>
              </div>
              <Target className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingOverdue ? "Loading..." : "0%"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overdue">Overdue Loans</TabsTrigger>
          <TabsTrigger value="activities">Collection Activities</TabsTrigger>
          <TabsTrigger value="agents">Field Agents</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search by borrower name, loan number, or phone..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-0">
              {loadingOverdue ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading overdue loans...</p>
                </div>
              ) : filteredOverdueLoans.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No overdue loans</h3>
                  <p className="text-gray-500 mb-4">All loans are current or no loans match your filters</p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-500">Overdue loan details will display when loans become overdue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardContent className="p-0">
              {loadingActivities ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading collection activities...</p>
                </div>
              ) : collectionActivities.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No collection activities</h3>
                  <p className="text-gray-500 mb-4">Collection activity records will appear here</p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-500">Collection activities will display when actions are taken</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardContent className="p-0">
              {loadingAgents ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading field agents...</p>
                </div>
              ) : fieldAgents.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No field agents</h3>
                  <p className="text-gray-500 mb-4">Field agent assignments will appear here</p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-500">Field agent assignments and performance will display here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};