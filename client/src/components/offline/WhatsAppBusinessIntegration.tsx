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
  MessageSquare, 
  Plus, 
  Edit, 
  Trash, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Copy
} from "lucide-react";

interface WhatsAppTemplate {
  id: number;
  name: string;
  content: string;
  language: string;
  status: "approved" | "pending_approval" | "rejected";
  category: string;
  variables: string[];
  createdAt: string;
}

export const WhatsAppBusinessIntegration = () => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    language: "english",
    category: "loan_reminder"
  });
  const [testRecipient, setTestRecipient] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WhatsApp templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["/api/africas-talking/whatsapp/templates"],
  });

  // Create/Update template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const url = editingTemplate 
        ? `/api/africas-talking/whatsapp/templates/${editingTemplate.id}`
        : "/api/africas-talking/whatsapp/templates";
      const method = editingTemplate ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: JSON.stringify(templateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/whatsapp/templates"] });
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: "",
        content: "",
        language: "english",
        category: "loan_reminder"
      });
      toast({
        title: "Success",
        description: editingTemplate ? "Template updated successfully" : "Template created successfully",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest(`/api/africas-talking/whatsapp/templates/${templateId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/africas-talking/whatsapp/templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
  });

  // Send test message mutation
  const sendTestMutation = useMutation({
    mutationFn: async ({ templateId, recipient }: { templateId: number; recipient: string }) => {
      return await apiRequest("/api/africas-talking/whatsapp/send", {
        method: "POST",
        body: JSON.stringify({
          template: templateId,
          recipient,
          variables: {}
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Message Sent",
        description: "WhatsApp test message sent successfully",
      });
      setTestRecipient("");
    },
  });

  const handleEdit = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      content: template.content,
      language: template.language,
      category: template.category || "loan_reminder"
    });
    setShowTemplateDialog(true);
  };

  const handleSave = () => {
    const variables = templateForm.content.match(/{(\w+)}/g)?.map(v => v.replace(/[{}]/g, '')) || [];
    saveTemplateMutation.mutate({
      ...templateForm,
      variables
    });
  };

  const handleDelete = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      approved: { variant: "default" as const, className: "bg-green-100 text-green-800", icon: CheckCircle },
      pending_approval: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800", icon: Clock },
      rejected: { variant: "destructive" as const, className: "bg-red-100 text-red-800", icon: AlertCircle },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending_approval;
    const Icon = statusConfig.icon;
    
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const predefinedTemplates = [
    {
      name: "loan_application_welcome",
      content: "Welcome to LoanSphere! Your loan application has been received. Reference: {reference}. We'll review and respond within 24 hours.",
      category: "application"
    },
    {
      name: "payment_reminder",
      content: "Dear {name}, your payment of K{amount} is due on {date}. Reply PAY to make payment via mobile money. Thank you!",
      category: "payment"
    },
    {
      name: "loan_approved",
      content: "Congratulations {name}! Your loan of K{amount} has been approved. Funds will be disbursed to your mobile money within 2 hours.",
      category: "approval"
    },
    {
      name: "payment_received",
      content: "Payment received! Thank you {name} for your payment of K{amount}. Your remaining balance is K{balance}.",
      category: "confirmation"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">WhatsApp Business Integration</h1>
          <p className="text-gray-600 mt-1">Manage message templates and automated workflows</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      placeholder="payment_reminder"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={templateForm.category} 
                      onValueChange={(value) => setTemplateForm({...templateForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="approval">Approval</SelectItem>
                        <SelectItem value="confirmation">Confirmation</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select 
                    value={templateForm.language} 
                    onValueChange={(value) => setTemplateForm({...templateForm, language: value})}
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
                  <Label>Message Content</Label>
                  <Textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    placeholder="Dear {name}, your payment of K{amount} is due on {date}..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use {"{variable}"} for dynamic content. Example: {"{name}"}, {"{amount}"}, {"{date}"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Quick Templates</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedTemplates.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setTemplateForm({
                          ...templateForm,
                          name: template.name,
                          content: template.content,
                          category: template.category
                        })}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {template.name.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saveTemplateMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Management */}
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTemplates ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates</h3>
              <p className="text-gray-500 mb-4">Create your first WhatsApp message template</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Content Preview</th>
                    <th className="text-left p-4 font-medium">Language</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template: any) => (
                    <tr key={template.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{template.category || 'general'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm max-w-xs truncate">{template.content}</div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{template.language}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(template.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(template.id)}
                            disabled={deleteTemplateMutation.isPending}
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

      {/* Test Messaging */}
      <Card>
        <CardHeader>
          <CardTitle>Test Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Test Phone Number</Label>
              <Input
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="+260977123456"
                type="tel"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => sendTestMutation.mutate({ templateId: 1, recipient: testRecipient })}
                disabled={!testRecipient || sendTestMutation.isPending}
                className="bg-loansphere-green hover:bg-loansphere-green/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendTestMutation.isPending ? "Sending..." : "Send Test Message"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};