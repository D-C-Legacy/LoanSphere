import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Settings,
  Users,
  Calendar,
  Globe,
  Clock,
  Building,
  Phone,
  Mail,
  Pencil,
  Trash2,
  Shield,
  BarChart3,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId: number;
  managerName?: string;
  isActive: boolean;
  capital: string;
  currency: string;
  country: string;
  dateFormat: string;
  minLoanAmount: string;
  maxLoanAmount: string;
  minInterestRate: string;
  maxInterestRate: string;
  holidays: string[];
  customFields: Record<string, any>;
  staffCount: number;
  activeLoans: number;
  totalDisbursed: string;
  createdAt: string;
}

interface LoanOfficer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  branchId: number;
  isActive: boolean;
}

interface PackageInfo {
  name: string;
  maxBranches: number;
  currentBranches: number;
}

export function BranchManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    managerId: '',
    capital: '',
    currency: 'ZMW',
    country: 'Zambia',
    dateFormat: 'DD/MM/YYYY',
    minLoanAmount: '',
    maxLoanAmount: '',
    minInterestRate: '',
    maxInterestRate: '',
    holidays: [] as string[],
    customFields: {}
  });

  // Fetch branches
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['/api/branches'],
  });

  // Fetch loan officers
  const { data: loanOfficers = [] } = useQuery({
    queryKey: ['/api/loan-officers'],
  });

  // Fetch package info
  const { data: packageInfo } = useQuery({
    queryKey: ['/api/auth/user/package'],
  });

  // Create branch mutation
  const createBranchMutation = useMutation({
    mutationFn: async (branchData: any) => {
      return await apiRequest('/api/branches', {
        method: 'POST',
        body: JSON.stringify(branchData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setIsCreateDialogOpen(false);
      resetNewBranch();
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    },
  });

  // Update branch mutation
  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return await apiRequest(`/api/branches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      setIsEditDialogOpen(false);
      setSelectedBranch(null);
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    },
  });

  // Delete branch mutation
  const deleteBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/branches/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      });
    },
  });

  const resetNewBranch = () => {
    setNewBranch({
      name: '',
      address: '',
      phone: '',
      email: '',
      managerId: '',
      capital: '',
      currency: 'ZMW',
      country: 'Zambia',
      dateFormat: 'DD/MM/YYYY',
      minLoanAmount: '',
      maxLoanAmount: '',
      minInterestRate: '',
      maxInterestRate: '',
      holidays: [],
      customFields: {}
    });
  };

  const handleCreateBranch = () => {
    if (!packageInfo || branches.length >= packageInfo.maxBranches) {
      toast({
        title: "Package Limit Reached",
        description: `Your ${packageInfo?.name || 'current'} package allows only ${packageInfo?.maxBranches || 0} branches. Upgrade to add more.`,
        variant: "destructive",
      });
      return;
    }
    createBranchMutation.mutate(newBranch);
  };

  const handleUpdateBranch = () => {
    if (selectedBranch) {
      updateBranchMutation.mutate({ id: selectedBranch.id, ...selectedBranch });
    }
  };

  const handleDeleteBranch = (branchId: number) => {
    if (branches.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one active branch.",
        variant: "destructive",
      });
      return;
    }
    deleteBranchMutation.mutate(branchId);
  };

  const getBranchOfficers = (branchId: number) => {
    return loanOfficers.filter((officer: LoanOfficer) => officer.branchId === branchId);
  };

  const canCreateBranch = packageInfo && branches.length < packageInfo.maxBranches;

  if (branchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loansphere-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600 mt-1">Manage your organization's branches and settings</p>
        </div>
        <div className="flex items-center gap-3">
          {packageInfo && (
            <Badge variant="outline" className="text-sm">
              {branches.length}/{packageInfo.maxBranches} Branches Used
            </Badge>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-loansphere-green hover:bg-loansphere-green/90"
                disabled={!canCreateBranch}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="limits">Loan Limits</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="holidays">Holidays</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Branch Name</Label>
                      <Input
                        id="name"
                        value={newBranch.name}
                        onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                        placeholder="Main Branch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="managerId">Branch Manager</Label>
                      <Select
                        value={newBranch.managerId}
                        onValueChange={(value) => setNewBranch({ ...newBranch, managerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanOfficers.map((officer: LoanOfficer) => (
                            <SelectItem key={officer.id} value={officer.id.toString()}>
                              {officer.firstName} {officer.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newBranch.address}
                      onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                      placeholder="Branch address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newBranch.phone}
                        onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                        placeholder="+260 XXX XXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newBranch.email}
                        onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                        placeholder="branch@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="capital">Branch Capital</Label>
                    <Input
                      id="capital"
                      value={newBranch.capital}
                      onChange={(e) => setNewBranch({ ...newBranch, capital: e.target.value })}
                      placeholder="1000000"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="limits" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minLoanAmount">Minimum Loan Amount</Label>
                      <Input
                        id="minLoanAmount"
                        value={newBranch.minLoanAmount}
                        onChange={(e) => setNewBranch({ ...newBranch, minLoanAmount: e.target.value })}
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoanAmount">Maximum Loan Amount</Label>
                      <Input
                        id="maxLoanAmount"
                        value={newBranch.maxLoanAmount}
                        onChange={(e) => setNewBranch({ ...newBranch, maxLoanAmount: e.target.value })}
                        placeholder="500000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minInterestRate">Minimum Interest Rate (%)</Label>
                      <Input
                        id="minInterestRate"
                        value={newBranch.minInterestRate}
                        onChange={(e) => setNewBranch({ ...newBranch, minInterestRate: e.target.value })}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxInterestRate">Maximum Interest Rate (%)</Label>
                      <Input
                        id="maxInterestRate"
                        value={newBranch.maxInterestRate}
                        onChange={(e) => setNewBranch({ ...newBranch, maxInterestRate: e.target.value })}
                        placeholder="24"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={newBranch.currency}
                        onValueChange={(value) => setNewBranch({ ...newBranch, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ZMW">ZMW - Zambian Kwacha</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={newBranch.country}
                        onValueChange={(value) => setNewBranch({ ...newBranch, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Zambia">Zambia</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={newBranch.dateFormat}
                      onValueChange={(value) => setNewBranch({ ...newBranch, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="holidays" className="space-y-4">
                  <div>
                    <Label>Branch Holidays</Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Add holidays when loan schedules should skip these dates
                    </p>
                    <div className="space-y-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const holiday = prompt("Enter holiday date (YYYY-MM-DD):");
                          if (holiday && /^\d{4}-\d{2}-\d{2}$/.test(holiday)) {
                            setNewBranch({ 
                              ...newBranch, 
                              holidays: [...newBranch.holidays, holiday] 
                            });
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Holiday
                      </Button>
                      {newBranch.holidays.map((holiday, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{holiday}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewBranch({
                                ...newBranch,
                                holidays: newBranch.holidays.filter((_, i) => i !== index)
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBranch}
                  disabled={createBranchMutation.isPending}
                  className="bg-loansphere-green hover:bg-loansphere-green/90"
                >
                  {createBranchMutation.isPending ? "Creating..." : "Create Branch"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Package Limitation Warning */}
      {!canCreateBranch && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Branch Limit Reached</p>
                <p className="text-sm">
                  Your {packageInfo?.name || 'current'} package allows {packageInfo?.maxBranches || 0} branches. 
                  Upgrade your package to add more branches.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch: Branch) => (
          <Card key={branch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-loansphere-green" />
                    {branch.name}
                  </CardTitle>
                  <Badge variant={branch.isActive ? "default" : "secondary"} className="mt-2">
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBranch(branch.id)}
                    disabled={branches.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{branch.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{getBranchOfficers(branch.id).length} Staff Members</span>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capital:</span>
                  <span className="font-medium">{branch.currency} {branch.capital}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loan Range:</span>
                  <span className="font-medium">
                    {branch.currency} {branch.minLoanAmount} - {branch.maxLoanAmount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Interest Range:</span>
                  <span className="font-medium">
                    {branch.minInterestRate}% - {branch.maxInterestRate}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Holidays:</span>
                  <span className="font-medium">{branch.holidays?.length || 0} days</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-lg text-loansphere-green">
                    {branch.activeLoans || 0}
                  </div>
                  <div className="text-gray-600">Active Loans</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg text-blue-600">
                    {branch.currency} {branch.totalDisbursed || '0'}
                  </div>
                  <div className="text-gray-600">Disbursed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {branches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first branch</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-loansphere-green hover:bg-loansphere-green/90"
              disabled={!canCreateBranch}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Branch
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}