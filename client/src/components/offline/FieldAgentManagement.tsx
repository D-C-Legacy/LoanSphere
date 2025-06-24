import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash, 
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Save,
  RefreshCw,
  DollarSign,
  Calendar,
  User
} from "lucide-react";

interface FieldAgent {
  id: number;
  name: string;
  phone: string;
  region: string;
  status: "active" | "inactive" | "training";
  lastSync: string;
  collectionsToday: number;
  amountCollected: number;
  totalCollections: number;
  efficiency: number;
  createdAt: string;
}

export const FieldAgentManagement = () => {
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<FieldAgent | null>(null);
  const [agentForm, setAgentForm] = useState({
    name: "",
    phone: "",
    region: "Lusaka",
    status: "active" as "active" | "inactive" | "training"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch field agents
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["/api/africas-talking/field-agents"],
  });

  // Create/Update agent mutation
  const saveAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      const url = editingAgent 
        ? `/api/africas-talking/field-agents/${editingAgent.id}`
        : "/api/africas-talking/field-agents";
      const method = editingAgent ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: JSON.stringify(agentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/field-agents"] });
      setShowAgentDialog(false);
      setEditingAgent(null);
      setAgentForm({
        name: "",
        phone: "",
        region: "Lusaka",
        status: "active"
      });
      toast({
        title: "Success",
        description: editingAgent ? "Field agent updated successfully" : "Field agent created successfully",
      });
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      return await apiRequest(`/api/africas-talking/field-agents/${agentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/field-agents"] });
      toast({
        title: "Success",
        description: "Field agent deleted successfully",
      });
    },
  });

  // Sync agent data mutation
  const syncAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      return await apiRequest(`/api/offline/field/sync`, {
        method: "POST",
        body: JSON.stringify({
          agentId,
          data: []
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/field-agents"] });
      toast({
        title: "Sync Complete",
        description: "Field agent data synchronized successfully",
      });
    },
  });

  const handleEdit = (agent: FieldAgent) => {
    setEditingAgent(agent);
    setAgentForm({
      name: agent.name,
      phone: agent.phone,
      region: agent.region,
      status: agent.status
    });
    setShowAgentDialog(true);
  };

  const handleSave = () => {
    saveAgentMutation.mutate(agentForm);
  };

  const handleDelete = (agentId: number) => {
    if (confirm("Are you sure you want to delete this field agent?")) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const handleSync = (agentId: number) => {
    syncAgentMutation.mutate(agentId);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: "default" as const, className: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { variant: "secondary" as const, className: "bg-gray-100 text-gray-800", icon: Clock },
      training: { variant: "default" as const, className: "bg-blue-100 text-blue-800", icon: User },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.active;
    const Icon = statusConfig.icon;
    
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const zambianRegions = [
    "Lusaka", "Copperbelt", "Central", "Eastern", "Luapula", 
    "Northern", "North-Western", "Southern", "Western", "Muchinga"
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 0,
    }).format(amount).replace('ZMW', 'K');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Field Agent Management</h1>
          <p className="text-gray-600 mt-1">Manage offline cash collection agents across Zambia</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAgentDialog} onOpenChange={setShowAgentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Field Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingAgent ? "Edit Field Agent" : "Add Field Agent"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Agent Name</Label>
                  <Input
                    value={agentForm.name}
                    onChange={(e) => setAgentForm({...agentForm, name: e.target.value})}
                    placeholder="John Mwanza"
                  />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={agentForm.phone}
                    onChange={(e) => setAgentForm({...agentForm, phone: e.target.value})}
                    placeholder="+260977123456"
                    type="tel"
                  />
                </div>

                <div>
                  <Label>Region</Label>
                  <Select 
                    value={agentForm.region} 
                    onValueChange={(value) => setAgentForm({...agentForm, region: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {zambianRegions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={agentForm.status} 
                    onValueChange={(value: any) => setAgentForm({...agentForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAgentDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saveAgentMutation.isPending || !agentForm.name || !agentForm.phone}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveAgentMutation.isPending ? "Saving..." : "Save Agent"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold">
                  {agents.filter((agent: any) => agent.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Collections</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(agents.reduce((sum: number, agent: any) => sum + (agent.amountCollected || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Collections Count</p>
                <p className="text-2xl font-bold">
                  {agents.reduce((sum: number, agent: any) => sum + (agent.collectionsToday || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Syncs</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Field Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAgents ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading field agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No field agents</h3>
              <p className="text-gray-500 mb-4">Add your first field agent to start offline collections</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Agent</th>
                    <th className="text-left p-4 font-medium">Region</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Today's Performance</th>
                    <th className="text-left p-4 font-medium">Last Sync</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent: any) => (
                    <tr key={agent.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {agent.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{agent.region}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(agent.status)}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{agent.collectionsToday || 0}</span> collections
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            {formatCurrency(agent.amountCollected || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {agent.lastSync ? formatDate(agent.lastSync) : 'Never'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSync(agent.id)}
                            disabled={syncAgentMutation.isPending}
                            title="Sync data"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(agent)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(agent.id)}
                            disabled={deleteAgentMutation.isPending}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};