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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Smartphone, 
  CreditCard, 
  Banknote,
  Building,
  Search,
  Filter,
  Eye,
  Plus,
  AlertCircle,
  FileText
} from "lucide-react";

export const DisbursementManagement = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch disbursement data from API
  const { data: pendingDisbursements = [], isLoading: loadingPending } = useQuery({
    queryKey: ["/api/disbursements/pending"],
  });

  const { data: disbursementHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["/api/disbursements/history"],
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mobile_money":
        return <Smartphone className="w-4 h-4" />;
      case "bank_transfer":
        return <Building className="w-4 h-4" />;
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "check":
        return <FileText className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      processing: { variant: "default" as const, icon: Send, color: "text-blue-600" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Disbursement Management</h1>
          <p className="text-gray-600 mt-1">Process loan disbursements with Zambian payment methods</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
            <Send className="w-4 h-4 mr-2" />
            New Disbursement
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Disbursements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingPending ? "Loading..." : pendingDisbursements.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingPending ? "Loading..." : `K${pendingDisbursements.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}`}
                </p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingHistory ? "Loading..." : 
                    disbursementHistory.filter(d => 
                      d.status === "completed" && 
                      new Date(d.processedDate || "").toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Money %</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingHistory ? "Loading..." : 
                    disbursementHistory.length > 0 
                      ? Math.round((disbursementHistory.filter(d => d.disbursementMethod === "mobile_money").length / disbursementHistory.length) * 100)
                      : 0
                  }%
                </p>
              </div>
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Disbursements</TabsTrigger>
          <TabsTrigger value="history">Disbursement History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search by borrower name or loan number..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="check">Check</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              {loadingPending ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading pending disbursements...</p>
                </div>
              ) : pendingDisbursements.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending disbursements</h3>
                  <p className="text-gray-500 mb-4">All disbursements are up to date</p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-500">Disbursement data will display when loans are approved for disbursement</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading disbursement history...</p>
                </div>
              ) : disbursementHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No disbursement history</h3>
                  <p className="text-gray-500 mb-4">Disbursement records will appear here</p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-500">Disbursement history will display when disbursements are processed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile Money Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">MTN Mobile Money</h3>
                  <p className="text-sm text-gray-600 mb-2">Direct disbursements to MTN wallets</p>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Airtel Money</h3>
                  <p className="text-sm text-gray-600 mb-2">Direct disbursements to Airtel wallets</p>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Zamtel Kwacha</h3>
                  <p className="text-sm text-gray-600 mb-2">Direct disbursements to Zamtel wallets</p>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Banking Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Standard Chartered Bank</h3>
                  <p className="text-sm text-gray-600 mb-2">Direct bank transfers</p>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Zanaco Bank</h3>
                  <p className="text-sm text-gray-600 mb-2">Direct bank transfers</p>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">FNB Zambia</h3>
                  <p className="text-sm text-gray-600 mb-2">Direct bank transfers</p>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};