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
  Phone, 
  Plus, 
  Edit, 
  Trash, 
  Play,
  Pause,
  Settings,
  Save,
  ArrowRight,
  Mic,
  Volume2
} from "lucide-react";

interface IVRFlow {
  id: number;
  name: string;
  description: string;
  language: string;
  steps: IVRStep[];
  isActive: boolean;
  callsHandled: number;
  completionRate: number;
  createdAt: string;
}

interface IVRStep {
  step: number;
  action: "play" | "menu" | "collect" | "transfer";
  content: string;
  options?: string[];
  nextStep?: number;
  timeout?: number;
}

export const IVRFlowManagement = () => {
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [editingFlow, setEditingFlow] = useState<IVRFlow | null>(null);
  const [flowForm, setFlowForm] = useState({
    name: "",
    description: "",
    language: "english"
  });
  const [steps, setSteps] = useState<IVRStep[]>([]);
  const [currentStep, setCurrentStep] = useState<IVRStep>({
    step: 1,
    action: "play",
    content: "",
    timeout: 10
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch IVR flows
  const { data: flows = [], isLoading: loadingFlows } = useQuery({
    queryKey: ["/api/africas-talking/ivr/flows"],
  });

  // Create/Update flow mutation
  const saveFlowMutation = useMutation({
    mutationFn: async (flowData: any) => {
      const url = editingFlow 
        ? `/api/africas-talking/ivr/flows/${editingFlow.id}`
        : "/api/africas-talking/ivr/flows";
      const method = editingFlow ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: JSON.stringify(flowData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/ivr/flows"] });
      setShowFlowDialog(false);
      setEditingFlow(null);
      setFlowForm({
        name: "",
        description: "",
        language: "english"
      });
      setSteps([]);
      toast({
        title: "Success",
        description: editingFlow ? "IVR flow updated successfully" : "IVR flow created successfully",
      });
    },
  });

  // Delete flow mutation
  const deleteFlowMutation = useMutation({
    mutationFn: async (flowId: number) => {
      return await apiRequest(`/api/africas-talking/ivr/flows/${flowId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/ivr/flows"] });
      toast({
        title: "Success",
        description: "IVR flow deleted successfully",
      });
    },
  });

  const handleEdit = (flow: IVRFlow) => {
    setEditingFlow(flow);
    setFlowForm({
      name: flow.name,
      description: flow.description,
      language: flow.language
    });
    setSteps(flow.steps || []);
    setShowFlowDialog(true);
  };

  const handleSave = () => {
    saveFlowMutation.mutate({
      ...flowForm,
      steps
    });
  };

  const handleDelete = (flowId: number) => {
    if (confirm("Are you sure you want to delete this IVR flow?")) {
      deleteFlowMutation.mutate(flowId);
    }
  };

  const addStep = () => {
    const newStep = { ...currentStep, step: steps.length + 1 };
    setSteps([...steps, newStep]);
    setCurrentStep({
      step: steps.length + 2,
      action: "play",
      content: "",
      timeout: 10
    });
  };

  const removeStep = (stepIndex: number) => {
    const updatedSteps = steps.filter((_, index) => index !== stepIndex);
    setSteps(updatedSteps.map((step, index) => ({ ...step, step: index + 1 })));
  };

  const predefinedFlows = [
    {
      name: "Main Loan Menu",
      description: "Primary IVR flow for loan services",
      steps: [
        { step: 1, action: "play", content: "Welcome to LoanSphere. Your trusted lending partner.", timeout: 5 },
        { step: 2, action: "menu", content: "Press 1 for new loan application, 2 to check loan balance, 3 for payment options, or 0 for customer service.", options: ["1: New Loan", "2: Balance", "3: Payment", "0: Support"], timeout: 15 }
      ]
    },
    {
      name: "Payment Assistance",
      description: "Guides customers through payment process",
      steps: [
        { step: 1, action: "play", content: "Payment assistance menu. We will guide you through your payment options.", timeout: 5 },
        { step: 2, action: "collect", content: "Please enter your loan reference number followed by the hash key.", timeout: 30 }
      ]
    },
    {
      name: "Balance Inquiry",
      description: "Allows customers to check their loan balance",
      steps: [
        { step: 1, action: "collect", content: "Please enter your loan reference number to check your balance.", timeout: 30 },
        { step: 2, action: "play", content: "Please wait while we retrieve your balance information.", timeout: 5 }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IVR Flow Management</h1>
          <p className="text-gray-600 mt-1">Create and manage voice-guided customer interactions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showFlowDialog} onOpenChange={setShowFlowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Plus className="w-4 h-4 mr-2" />
                New IVR Flow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFlow ? "Edit IVR Flow" : "Create IVR Flow"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Flow Name</Label>
                    <Input
                      value={flowForm.name}
                      onChange={(e) => setFlowForm({...flowForm, name: e.target.value})}
                      placeholder="Main Loan Menu"
                    />
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={flowForm.language} 
                      onValueChange={(value) => setFlowForm({...flowForm, language: value})}
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
                  <Label>Description</Label>
                  <Input
                    value={flowForm.description}
                    onChange={(e) => setFlowForm({...flowForm, description: e.target.value})}
                    placeholder="Primary IVR flow for loan services"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Quick Templates</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {predefinedFlows.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFlowForm({
                            ...flowForm,
                            name: template.name,
                            description: template.description
                          });
                          setSteps(template.steps);
                        }}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Step Builder */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Flow Steps</h3>
                  
                  {/* Existing Steps */}
                  {steps.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge variant="outline">{step.step}</Badge>
                            <div className="flex items-center gap-1">
                              {step.action === "play" && <Volume2 className="w-4 h-4 text-blue-600" />}
                              {step.action === "menu" && <Settings className="w-4 h-4 text-green-600" />}
                              {step.action === "collect" && <Mic className="w-4 h-4 text-orange-600" />}
                              <span className="text-sm font-medium capitalize">{step.action}</span>
                            </div>
                            <span className="text-sm text-gray-600 truncate">{step.content}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStep(index)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Step */}
                  <div className="space-y-3 p-3 border rounded bg-blue-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Action Type</Label>
                        <Select 
                          value={currentStep.action} 
                          onValueChange={(value: any) => setCurrentStep({...currentStep, action: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="play">Play Message</SelectItem>
                            <SelectItem value="menu">Menu Options</SelectItem>
                            <SelectItem value="collect">Collect Input</SelectItem>
                            <SelectItem value="transfer">Transfer Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Timeout (seconds)</Label>
                        <Input
                          type="number"
                          value={currentStep.timeout}
                          onChange={(e) => setCurrentStep({...currentStep, timeout: parseInt(e.target.value)})}
                          min="5"
                          max="60"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Content</Label>
                      <Textarea
                        value={currentStep.content}
                        onChange={(e) => setCurrentStep({...currentStep, content: e.target.value})}
                        placeholder={
                          currentStep.action === "play" ? "Welcome message or instructions..." :
                          currentStep.action === "menu" ? "Press 1 for loans, 2 for balance..." :
                          currentStep.action === "collect" ? "Enter your loan reference number..." :
                          "Transfer to customer service..."
                        }
                        rows={2}
                      />
                    </div>

                    {currentStep.action === "menu" && (
                      <div>
                        <Label className="text-sm">Menu Options (one per line)</Label>
                        <Textarea
                          value={currentStep.options?.join('\n') || ''}
                          onChange={(e) => setCurrentStep({
                            ...currentStep, 
                            options: e.target.value.split('\n').filter(opt => opt.trim())
                          })}
                          placeholder="1: Apply for loan&#10;2: Check balance&#10;3: Make payment"
                          rows={3}
                        />
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={addStep}
                      disabled={!currentStep.content.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Step
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowFlowDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saveFlowMutation.isPending || steps.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveFlowMutation.isPending ? "Saving..." : "Save Flow"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* IVR Flows Management */}
      <Card>
        <CardHeader>
          <CardTitle>IVR Flows</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFlows ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading IVR flows...</p>
            </div>
          ) : flows.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No IVR flows</h3>
              <p className="text-gray-500 mb-4">Create your first voice interaction flow</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Language</th>
                    <th className="text-left p-4 font-medium">Steps</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Performance</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.map((flow: any) => (
                    <tr key={flow.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{flow.name}</div>
                          <div className="text-sm text-gray-500">{flow.description}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{flow.language}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{flow.steps?.length || 0}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        </div>
                      </td>
                      <td className="p-4">
                        {flow.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{flow.callsHandled || 0} calls</div>
                          <div className="text-gray-500">{flow.completionRate || 0}% completion</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(flow)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(flow.id)}
                            disabled={deleteFlowMutation.isPending}
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