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
  Smartphone, 
  MessageSquare, 
  Phone, 
  Users, 
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Globe,
  MapPin,
  Search,
  Plus,
  Settings,
  BarChart3,
  Download,
  Upload,
  Edit,
  Trash,
  Play
} from "lucide-react";
import { AfricasTalkingIntegration } from "./AfricasTalkingIntegration";
import { WhatsAppBusinessIntegration } from "./WhatsAppBusinessIntegration";
import { IVRFlowManagement } from "./IVRFlowManagement";
import { FieldAgentManagement } from "./FieldAgentManagement";

export const OfflineLendingManagement = () => {
  const [activeTab, setActiveTab] = useState("africas-talking");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [showUSSDDialog, setShowUSSDDialog] = useState(false);
  const [ussdForm, setUssdForm] = useState({
    shortCode: "*123*5#",
    language: "english",
    menu: "main",
    action: "apply"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch USSD transactions
  const { data: ussdTransactions = [], isLoading: loadingUSSD } = useQuery({
    queryKey: ["/api/offline/ussd-transactions"],
  });

  // Fetch WhatsApp interactions
  const { data: whatsappMessages = [], isLoading: loadingWhatsApp } = useQuery({
    queryKey: ["/api/offline/whatsapp-messages"],
  });

  // Fetch IVR calls
  const { data: ivrCalls = [], isLoading: loadingIVR } = useQuery({
    queryKey: ["/api/offline/ivr-calls"],
  });

  // Fetch offline field operations
  const { data: fieldOperations = [], isLoading: loadingField } = useQuery({
    queryKey: ["/api/offline/field-operations"],
  });

  // Send USSD response mutation
  const sendUSSDMutation = useMutation({
    mutationFn: async (ussdData: any) => {
      return await apiRequest("/api/offline/ussd/send", {
        method: "POST",
        body: JSON.stringify(ussdData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offline"] });
      setShowUSSDDialog(false);
      toast({
        title: "USSD Sent",
        description: "USSD message sent successfully",
      });
    },
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "ussd":
        return <Smartphone className="w-4 h-4" />;
      case "whatsapp":
        return <MessageSquare className="w-4 h-4" />;
      case "ivr":
        return <Phone className="w-4 h-4" />;
      case "field":
        return <Users className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { variant: "default" as const, icon: Wifi, color: "text-green-600" },
      offline: { variant: "secondary" as const, icon: WifiOff, color: "text-gray-600" },
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleUSSDSend = () => {
    sendUSSDMutation.mutate(ussdForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Offline-First Lending OS</h1>
          <p className="text-gray-600 mt-1">Banking the unbanked with USSD, WhatsApp & Voice channels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={showUSSDDialog} onOpenChange={setShowUSSDDialog}>
            <DialogTrigger asChild>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Smartphone className="w-4 h-4 mr-2" />
                Send USSD
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send USSD Response</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>USSD Short Code</Label>
                  <Input
                    value={ussdForm.shortCode}
                    onChange={(e) => setUssdForm({...ussdForm, shortCode: e.target.value})}
                    placeholder="*123*5#"
                  />
                </div>

                <div>
                  <Label>Language</Label>
                  <Select 
                    value={ussdForm.language} 
                    onValueChange={(value) => setUssdForm({...ussdForm, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="nyanja">Nyanja</SelectItem>
                      <SelectItem value="bemba">Bemba</SelectItem>
                      <SelectItem value="tonga">Tonga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Menu Action</Label>
                  <Select 
                    value={ussdForm.action} 
                    onValueChange={(value) => setUssdForm({...ussdForm, action: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apply">Apply for Loan</SelectItem>
                      <SelectItem value="repay">Make Repayment</SelectItem>
                      <SelectItem value="balance">Check Balance</SelectItem>
                      <SelectItem value="history">View History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUSSDDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUSSDSend}
                    disabled={sendUSSDMutation.isPending}
                  >
                    {sendUSSDMutation.isPending ? "Sending..." : "Send USSD"}
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
                <p className="text-sm font-medium text-gray-600">USSD Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingUSSD ? "Loading..." : "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingWhatsApp ? "Loading..." : "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active conversations</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">IVR Calls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingIVR ? "Loading..." : "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Voice interactions</p>
              </div>
              <Phone className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Field Operations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingField ? "Loading..." : "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Offline agents active</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="africas-talking">Africa's Talking</TabsTrigger>
          <TabsTrigger value="ussd">USSD Gateway</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Bot</TabsTrigger>
          <TabsTrigger value="ivr">Voice (IVR)</TabsTrigger>
          <TabsTrigger value="field">Field Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search transactions, messages, or operations..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="ussd">USSD Only</SelectItem>
              <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
              <SelectItem value="ivr">IVR Only</SelectItem>
              <SelectItem value="field">Field Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="africas-talking">
          <AfricasTalkingIntegration />
        </TabsContent>

        <TabsContent value="ussd">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                USSD Gateway - Banking the Unbanked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Active USSD Codes</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">*123*5#</span>
                        <Badge variant="secondary">Setup Required</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Main loan application menu</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">*123*6#</span>
                        <Badge variant="secondary">Setup Required</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Repayment and balance check</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">*123*7#</span>
                        <Badge variant="secondary">Planned</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">SACCO group loans</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Language Support</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>English</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">Primary</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Nyanja (Chichewa)</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Bemba</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Tonga</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">USSD Gateway Ready</h3>
                <p className="text-gray-500 mb-4">Connect with telecom operators to activate USSD services</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppBusinessIntegration />
        </TabsContent>

        <TabsContent value="ivr">
          <IVRFlowManagement />
        </TabsContent>

        <TabsContent value="field">
          <FieldAgentManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Offline-First Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Channel Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>USSD Applications</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WhatsApp Interactions</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVR Completions</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Field Collections</span>
                      <span className="font-medium">0%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Language Usage</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>English</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nyanja</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bemba</span>
                      <span className="font-medium">0%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Connectivity Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2G/3G Users</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4G/WiFi Users</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offline Transactions</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};