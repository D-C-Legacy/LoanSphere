import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Mail,
  MessageSquare,
  Camera,
  FileText,
  Settings,
  UserPlus,
  CreditCard,
  Banknote,
  UserCheck,
  Building2,
  Edit,
  Trash2,
  Eye,
  Send,
  Phone,
  Calendar,
  MapPin,
  User,
  Briefcase,
  Hash,
  ArrowUpDown,
  FileDown,
  UserX,
  Move,
  X
} from "lucide-react";

interface Borrower {
  id: number;
  uniqueNumber: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  title?: string;
  address?: string;
  description?: string;
  photoUrl?: string;
  customFields?: Record<string, any>;
  loanOfficerId?: number;
  branchId?: number;
  status: 'Active' | 'Inactive' | 'Restricted';
  lastLoanStatus?: 'Active' | 'Paid' | 'Overdue' | 'None';
  totalLoans: number;
  activeSavings: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
}

export const BorrowerManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLoanStatus, setFilterLoanStatus] = useState("all");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newCustomField, setNewCustomField] = useState<Partial<CustomField>>({});
  const [borrowerForm, setBorrowerForm] = useState<Partial<Borrower>>({});
  const [uniqueNumberFormat, setUniqueNumberFormat] = useState("BOR-{YYYY}-{####}");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch borrowers
  const { data: borrowers = [], isLoading: loadingBorrowers } = useQuery({
    queryKey: ["/api/borrowers"],
    enabled: false
  });

  // Fetch loan officers
  const { data: loanOfficers = [], isLoading: loadingOfficers } = useQuery({
    queryKey: ["/api/loan-officers"],
    enabled: false
  });

  // Fetch branches
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ["/api/branches"],
    enabled: false
  });

  // Create borrower mutation
  const createBorrowerMutation = useMutation({
    mutationFn: async (borrowerData: Partial<Borrower>) => {
      return await apiRequest("/api/borrowers", {
        method: "POST",
        body: JSON.stringify(borrowerData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrowers"] });
      setIsAddDialogOpen(false);
      setBorrowerForm({});
      toast({
        title: "Success",
        description: "Borrower created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create borrower",
        variant: "destructive",
      });
    },
  });

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async ({ borrowerId, message }: { borrowerId: number; message: string }) => {
      return await apiRequest(`/api/borrowers/${borrowerId}/sms`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent",
        description: "Message sent successfully",
      });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async ({ borrowerId, subject, message }: { borrowerId: number; subject: string; message: string }) => {
      return await apiRequest(`/api/borrowers/${borrowerId}/email`, {
        method: "POST",
        body: JSON.stringify({ subject, message }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Email sent successfully",
      });
    },
  });

  // Filter borrowers based on search and filters
  const filteredBorrowers = borrowers.filter((borrower: Borrower) => {
    const matchesSearch = 
      borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrower.uniqueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (borrower.businessName && borrower.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (borrower.email && borrower.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (borrower.mobile && borrower.mobile.includes(searchQuery));

    const matchesStatus = filterStatus === "all" || borrower.status === filterStatus;
    const matchesLoanStatus = filterLoanStatus === "all" || borrower.lastLoanStatus === filterLoanStatus;

    return matchesSearch && matchesStatus && matchesLoanStatus;
  });

  const handleAddCustomField = () => {
    if (newCustomField.name && newCustomField.type) {
      const field: CustomField = {
        id: Date.now().toString(),
        name: newCustomField.name,
        type: newCustomField.type,
        options: newCustomField.options || [],
        required: newCustomField.required || false,
      };
      setCustomFields([...customFields, field]);
      setNewCustomField({});
    }
  };

  const handleCreateBorrower = () => {
    if (!borrowerForm.firstName || !borrowerForm.lastName) {
      toast({
        title: "Required Fields",
        description: "First Name and Last Name are required",
        variant: "destructive",
      });
      return;
    }

    const borrowerData = {
      ...borrowerForm,
      uniqueNumber: generateUniqueNumber(),
      customFields: {},
      status: 'Active' as const,
      totalLoans: 0,
      activeSavings: 0,
    };

    createBorrowerMutation.mutate(borrowerData);
  };

  const generateUniqueNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return uniqueNumberFormat
      .replace('{YYYY}', year.toString())
      .replace('{####}', randomNum);
  };

  const exportToCsv = () => {
    const csvData = filteredBorrowers.map((borrower: Borrower) => ({
      'Unique Number': borrower.uniqueNumber,
      'First Name': borrower.firstName,
      'Last Name': borrower.lastName,
      'Business Name': borrower.businessName || '',
      'Email': borrower.email || '',
      'Mobile': borrower.mobile || '',
      'Status': borrower.status,
      'Last Loan Status': borrower.lastLoanStatus || 'None',
      'Total Loans': borrower.totalLoans,
      'Active Savings': borrower.activeSavings,
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'borrowers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Borrower Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive borrower database and management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsBulkUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Upload</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToCsv}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-loansphere-green hover:bg-loansphere-green/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Borrower</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Borrowers
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Custom Fields
          </TabsTrigger>
          <TabsTrigger value="numbering" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Numbering
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search by name, number, email, mobile..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterLoanStatus} onValueChange={setFilterLoanStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Loan Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Loans</SelectItem>
                    <SelectItem value="Active">Active Loans</SelectItem>
                    <SelectItem value="Paid">Fully Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="None">No Loans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Borrowers List */}
          <Card>
            <CardContent className="p-0">
              {loadingBorrowers ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading borrowers...</p>
                </div>
              ) : filteredBorrowers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowers found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filterStatus !== "all" || filterLoanStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first borrower to get started"
                    }
                  </p>
                  {!searchQuery && filterStatus === "all" && filterLoanStatus === "all" && (
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-loansphere-green hover:bg-loansphere-green/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Borrower
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Borrower</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Loans</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBorrowers.map((borrower: Borrower) => (
                        <tr key={borrower.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {borrower.photoUrl ? (
                                  <img 
                                    src={borrower.photoUrl} 
                                    alt={borrower.firstName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {borrower.firstName} {borrower.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {borrower.uniqueNumber}
                                </div>
                                {borrower.businessName && (
                                  <div className="text-sm text-gray-500">
                                    {borrower.businessName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {borrower.email && (
                                <div className="text-sm flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  {borrower.email}
                                </div>
                              )}
                              {borrower.mobile && (
                                <div className="text-sm flex items-center gap-2">
                                  <Phone className="w-3 h-3" />
                                  {borrower.mobile}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-2">
                              <Badge 
                                variant={borrower.status === "Active" ? "default" : 
                                        borrower.status === "Restricted" ? "destructive" : "secondary"}
                              >
                                {borrower.status}
                              </Badge>
                              {borrower.lastLoanStatus && borrower.lastLoanStatus !== "None" && (
                                <Badge variant="outline" className="text-xs">
                                  {borrower.lastLoanStatus} Loan
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div>Loans: {borrower.totalLoans}</div>
                              <div>Savings: {borrower.activeSavings}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Create additional fields to capture borrower information specific to your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label>Field Name</Label>
                  <Input 
                    value={newCustomField.name || ''}
                    onChange={(e) => setNewCustomField({...newCustomField, name: e.target.value})}
                    placeholder="e.g., National ID"
                  />
                </div>
                <div>
                  <Label>Field Type</Label>
                  <Select 
                    value={newCustomField.type} 
                    onValueChange={(value) => setNewCustomField({...newCustomField, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddCustomField} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </div>

              {customFields.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Current Custom Fields</h4>
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{field.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                        {field.required && (
                          <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCustomFields(customFields.filter(f => f.id !== field.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Borrower Numbering System</CardTitle>
              <CardDescription>
                Configure how unique borrower numbers are generated automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Number Format</Label>
                <Input 
                  value={uniqueNumberFormat}
                  onChange={(e) => setUniqueNumberFormat(e.target.value)}
                  placeholder="e.g., BOR-{YYYY}-{####}"
                />
                <div className="text-sm text-gray-500">
                  Available placeholders: {'{YYYY}'} (year), {'{MM}'} (month), {'{####}'} (sequential number)
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <span className="font-mono">{generateUniqueNumber()}</span>
                </div>
              </div>

              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                Save Format
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Communication</CardTitle>
              <CardDescription>
                Send SMS or email to multiple borrowers at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Center</h3>
                <p className="text-gray-500 mb-4">Send messages to borrowers individually or in bulk</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Borrower Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Borrower</DialogTitle>
            <DialogDescription>
              Create a new borrower profile. Only First Name and Last Name are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Required Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName"
                  value={borrowerForm.firstName || ''}
                  onChange={(e) => setBorrowerForm({...borrowerForm, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName"
                  value={borrowerForm.lastName || ''}
                  onChange={(e) => setBorrowerForm({...borrowerForm, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Optional Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input 
                id="businessName"
                value={borrowerForm.businessName || ''}
                onChange={(e) => setBorrowerForm({...borrowerForm, businessName: e.target.value})}
                placeholder="Enter business name if applicable"
              />
            </div>

            {/* Contact Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={borrowerForm.email || ''}
                  onChange={(e) => setBorrowerForm({...borrowerForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input 
                  id="mobile"
                  value={borrowerForm.mobile || ''}
                  onChange={(e) => setBorrowerForm({...borrowerForm, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input 
                  id="dateOfBirth"
                  type="date"
                  value={borrowerForm.dateOfBirth || ''}
                  onChange={(e) => setBorrowerForm({...borrowerForm, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={borrowerForm.gender} 
                  onValueChange={(value) => setBorrowerForm({...borrowerForm, gender: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  value={borrowerForm.title || ''}
                  onChange={(e) => setBorrowerForm({...borrowerForm, title: e.target.value})}
                  placeholder="Mr., Mrs., Dr., etc."
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address"
                value={borrowerForm.address || ''}
                onChange={(e) => setBorrowerForm({...borrowerForm, address: e.target.value})}
                placeholder="Enter full address"
                rows={2}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description/Notes</Label>
              <Textarea 
                id="description"
                value={borrowerForm.description || ''}
                onChange={(e) => setBorrowerForm({...borrowerForm, description: e.target.value})}
                placeholder="Additional notes about this borrower"
                rows={3}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Borrower Photo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload borrower photo</p>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>
              </div>
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Custom Fields</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'text' && (
                        <Input placeholder={`Enter ${field.name.toLowerCase()}`} />
                      )}
                      {field.type === 'number' && (
                        <Input type="number" placeholder={`Enter ${field.name.toLowerCase()}`} />
                      )}
                      {field.type === 'date' && (
                        <Input type="date" />
                      )}
                      {field.type === 'select' && (
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.type === 'boolean' && (
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBorrower}
                disabled={createBorrowerMutation.isPending}
                className="bg-loansphere-green hover:bg-loansphere-green/90"
              >
                {createBorrowerMutation.isPending ? "Creating..." : "Create Borrower"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Borrowers</DialogTitle>
            <DialogDescription>
              Upload multiple borrowers at once using a CSV file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">Upload CSV File</h4>
              <p className="text-gray-600 mb-4">
                Select a CSV file with borrower information
              </p>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">CSV Format Requirements</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Required columns: FirstName, LastName</p>
                <p>• Optional columns: BusinessName, Email, Mobile, DateOfBirth, Gender, Title, Address, Description</p>
                <p>• Use comma-separated values (.csv format)</p>
                <p>• First row should contain column headers</p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Sample CSV Template
            </Button>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
                Upload Borrowers
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};