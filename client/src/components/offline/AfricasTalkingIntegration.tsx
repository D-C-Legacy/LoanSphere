import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Smartphone, 
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  Play, 
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Save
} from "lucide-react";

interface USSDCode {
  id: number;
  shortCode: string;
  title: string;
  description: string;
  menuStructure: any;
  isActive: boolean;
  language: string;
  responses: number;
  successRate: number;
}

interface USSDSession {
  id: number;
  sessionId: string;
  phoneNumber: string;
  shortCode: string;
  currentStep: string;
  userInputs: any;
  status: "active" | "completed" | "timeout" | "error";
  createdAt: string;
  updatedAt: string;
}

export const AfricasTalkingIntegration = () => {
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<USSDCode | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<USSDSession | null>(null);
  const [codeForm, setCodeForm] = useState({
    shortCode: "",
    title: "",
    description: "",
    language: "english",
    menuStructure: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch USSD codes
  const { data: ussdCodes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ["/api/africas-talking/ussd-codes"],
  });

  // Fetch USSD sessions
  const { data: ussdSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["/api/africas-talking/ussd-sessions"],
  });

  // Fetch Africa's Talking configuration
  const { data: atConfig, isLoading: loadingConfig } = useQuery({
    queryKey: ["/api/africas-talking/config"],
  });

  // Create/Update USSD code mutation
  const saveCodeMutation = useMutation({
    mutationFn: async (codeData: any) => {
      const url = editingCode 
        ? `/api/africas-talking/ussd-codes/${editingCode.id}`
        : "/api/africas-talking/ussd-codes";
      const method = editingCode ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: JSON.stringify(codeData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/ussd-codes"] });
      setShowCodeDialog(false);
      setEditingCode(null);
      setCodeForm({
        shortCode: "",
        title: "",
        description: "",
        language: "english",
        menuStructure: ""
      });
      toast({
        title: "Success",
        description: editingCode ? "USSD code updated successfully" : "USSD code created successfully",
      });
    },
  });

  // Delete USSD code mutation
  const deleteCodeMutation = useMutation({
    mutationFn: async (codeId: number) => {
      return await apiRequest(`/api/africas-talking/ussd-codes/${codeId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/ussd-codes"] });
      toast({
        title: "Success",
        description: "USSD code deleted successfully",
      });
    },
  });

  // Toggle USSD code status mutation
  const toggleCodeMutation = useMutation({
    mutationFn: async ({ codeId, isActive }: { codeId: number; isActive: boolean }) => {
      return await apiRequest(`/api/africas-talking/ussd-codes/${codeId}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/ussd-codes"] });
      toast({
        title: "Success",
        description: "USSD code status updated successfully",
      });
    },
  });

  // Test USSD code mutation
  const testCodeMutation = useMutation({
    mutationFn: async (codeId: number) => {
      return await apiRequest(`/api/africas-talking/ussd-codes/${codeId}/test`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Initiated",
        description: "USSD test session started successfully",
      });
    },
  });

  const handleEdit = (code: USSDCode) => {
    setEditingCode(code);
    setCodeForm({
      shortCode: code.shortCode,
      title: code.title,
      description: code.description,
      language: code.language,
      menuStructure: JSON.stringify(code.menuStructure, null, 2)
    });
    setShowCodeDialog(true);
  };

  const handleSave = () => {
    const menuStructure = codeForm.menuStructure ? JSON.parse(codeForm.menuStructure) : {};
    saveCodeMutation.mutate({
      ...codeForm,
      menuStructure
    });
  };

  const handleDelete = (codeId: number) => {
    if (confirm("Are you sure you want to delete this USSD code?")) {
      deleteCodeMutation.mutate(codeId);
    }
  };

  const handleToggleStatus = (codeId: number, currentStatus: boolean) => {
    toggleCodeMutation.mutate({ codeId, isActive: !currentStatus });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      completed: { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      timeout: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      error: { variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.active;
    
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Africa's Talking USSD Integration</h1>
          <p className="text-gray-600 mt-1">Manage USSD codes, sessions, and configurations</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
            <DialogTrigger asChild>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Plus className="w-4 h-4 mr-2" />
                New USSD Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCode ? "Edit USSD Code" : "Create USSD Code"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Short Code</Label>
                    <Input
                      value={codeForm.shortCode}
                      onChange={(e) => setCodeForm({...codeForm, shortCode: e.target.value})}
                      placeholder="*123*5#"
                    />
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={codeForm.language} 
                      onValueChange={(value) => setCodeForm({...codeForm, language: value})}
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
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={codeForm.title}
                    onChange={(e) => setCodeForm({...codeForm, title: e.target.value})}
                    placeholder="Loan Application Menu"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={codeForm.description}
                    onChange={(e) => setCodeForm({...codeForm, description: e.target.value})}
                    placeholder="Main menu for loan applications and inquiries"
                  />
                </div>

                <div>
                  <Label>Menu Structure (JSON)</Label>
                  <Textarea
                    value={codeForm.menuStructure}
                    onChange={(e) => setCodeForm({...codeForm, menuStructure: e.target.value})}
                    placeholder='{"welcome": "Welcome to LoanSphere. Press 1 for loans, 2 for balance", "options": {...}}'
                    rows={8}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saveCodeMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveCodeMutation.isPending ? "Saving..." : "Save Code"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Africa's Talking Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Africa's Talking Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">API Status</h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Connected</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Username</h3>
              <p className="text-sm text-gray-600">{atConfig?.username || "loansphere_prod"}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Balance</h3>
              <p className="text-sm font-medium">USD {atConfig?.balance || "0.00"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* USSD Codes Management */}
      <Card>
        <CardHeader>
          <CardTitle>USSD Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCodes ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading USSD codes...</p>
            </div>
          ) : ussdCodes.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No USSD codes</h3>
              <p className="text-gray-500 mb-4">Create your first USSD code to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Short Code</th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Language</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Performance</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ussdCodes.map((code: USSDCode) => (
                    <tr key={code.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-mono font-medium">{code.shortCode}</div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{code.title}</div>
                          <div className="text-sm text-gray-500">{code.description}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{code.language}</span>
                      </td>
                      <td className="p-4">
                        <div 
                          className="cursor-pointer" 
                          onClick={() => handleToggleStatus(code.id, code.isActive)}
                        >
                          {code.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{code.responses || 0} responses</div>
                          <div className="text-gray-500">{code.successRate || 0}% success</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testCodeMutation.mutate(code.id)}
                            disabled={testCodeMutation.isPending}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(code)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(code.id)}
                            disabled={deleteCodeMutation.isPending}
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

      {/* Active USSD Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active USSD Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading sessions...</p>
            </div>
          ) : ussdSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
              <p className="text-gray-500 mb-4">USSD sessions will appear here when users interact</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Session ID</th>
                    <th className="text-left p-4 font-medium">Phone Number</th>
                    <th className="text-left p-4 font-medium">Short Code</th>
                    <th className="text-left p-4 font-medium">Current Step</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {ussdSessions.map((session: USSDSession) => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{session.sessionId}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{session.phoneNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono">{session.shortCode}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{session.currentStep}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleTimeString()}
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