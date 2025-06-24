import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Users, 
  Shield, 
  Clock, 
  MapPin, 
  Upload,
  Settings,
  Lock,
  UserCheck,
  Building,
  Calendar,
  Globe
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Staff role schema for form validation
const staffRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.object({
    pages: z.array(z.string()),
    actions: z.array(z.string()),
    modules: z.array(z.string()),
    restrictions: z.object({
      canBackdate: z.boolean(),
      canPostdate: z.boolean(),
      requiresApproval: z.object({
        repayments: z.boolean(),
        savingsTransactions: z.boolean(),
      }),
    }),
  }),
});

// Staff member schema for form validation
const staffMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  staffRoleId: z.number().min(1, "Role is required"),
  branchId: z.number().optional(),
  loginRestrictions: z.object({
    workDays: z.array(z.string()),
    workHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
    allowedIPs: z.array(z.string()),
    allowedCountries: z.array(z.string()),
    requireTwoFactor: z.boolean(),
  }),
});

type StaffRoleFormData = z.infer<typeof staffRoleSchema>;
type StaffMemberFormData = z.infer<typeof staffMemberSchema>;

interface StaffRole {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  permissions: {
    pages: string[];
    actions: string[];
    modules: string[];
    restrictions: {
      canBackdate: boolean;
      canPostdate: boolean;
      requiresApproval: {
        repayments: boolean;
        savingsTransactions: boolean;
      };
    };
  };
  createdAt: string;
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  staffRole: StaffRole;
  branchId?: number;
  branchName?: string;
  isActive: boolean;
  loginRestrictions: {
    workDays: string[];
    workHours: { start: string; end: string };
    allowedIPs: string[];
    allowedCountries: string[];
    requireTwoFactor: boolean;
  };
  lastLoginAt?: string;
  lastLoginIP?: string;
  createdAt: string;
}

const DEFAULT_ROLES = [
  {
    name: "Cashier",
    description: "Handle daily cash transactions and basic customer service",
    permissions: {
      pages: ["loans", "repayments", "borrowers"],
      actions: ["view_loans", "add_repayment", "view_borrowers"],
      modules: ["loan_servicing"],
      restrictions: {
        canBackdate: false,
        canPostdate: false,
        requiresApproval: { repayments: true, savingsTransactions: true }
      }
    }
  },
  {
    name: "Teller",
    description: "Process transactions and manage customer accounts",
    permissions: {
      pages: ["loans", "repayments", "borrowers", "savings"],
      actions: ["view_loans", "add_repayment", "edit_borrower", "manage_savings"],
      modules: ["loan_servicing", "savings_management"],
      restrictions: {
        canBackdate: false,
        canPostdate: false,
        requiresApproval: { repayments: false, savingsTransactions: true }
      }
    }
  },
  {
    name: "Collector",
    description: "Manage collections and follow up on overdue accounts",
    permissions: {
      pages: ["loans", "collections", "borrowers"],
      actions: ["view_loans", "manage_collections", "contact_borrowers"],
      modules: ["loan_servicing", "collections"],
      restrictions: {
        canBackdate: false,
        canPostdate: false,
        requiresApproval: { repayments: true, savingsTransactions: true }
      }
    }
  },
  {
    name: "Branch Manager",
    description: "Full branch operations management and oversight",
    permissions: {
      pages: ["*"],
      actions: ["*"],
      modules: ["*"],
      restrictions: {
        canBackdate: true,
        canPostdate: true,
        requiresApproval: { repayments: false, savingsTransactions: false }
      }
    }
  },
  {
    name: "Admin",
    description: "System administration and configuration",
    permissions: {
      pages: ["*"],
      actions: ["*"],
      modules: ["*"],
      restrictions: {
        canBackdate: true,
        canPostdate: true,
        requiresApproval: { repayments: false, savingsTransactions: false }
      }
    }
  }
];

const AVAILABLE_PAGES = [
  "dashboard", "loans", "borrowers", "loan_products", "applications", 
  "repayments", "collections", "savings", "branches", "staff", 
  "reports", "settings", "accounting", "expenses"
];

const AVAILABLE_ACTIONS = [
  "view_loans", "create_loan", "edit_loan", "delete_loan", "approve_loan",
  "view_borrowers", "create_borrower", "edit_borrower", "delete_borrower",
  "add_repayment", "edit_repayment", "delete_repayment", "approve_repayment",
  "manage_collections", "contact_borrowers", "manage_savings", "view_reports",
  "manage_staff", "system_settings"
];

const AVAILABLE_MODULES = [
  "loan_origination", "loan_servicing", "borrower_management", "collections",
  "savings_management", "branch_management", "staff_management", "reporting",
  "accounting", "system_administration"
];

const WORK_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const COUNTRIES = [
  "Zambia", "South Africa", "Kenya", "Nigeria", "Ghana", "Tanzania", "Uganda"
];

export default function UserRolesManagement() {
  const [activeTab, setActiveTab] = useState("staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for now - will connect to real API
  const staffMembers = [
    {
      id: 1,
      firstName: "John",
      lastName: "Mwamba",
      email: "john.mwamba@loansphere.world",
      phone: "+260 97 123 4567",
      photoUrl: undefined,
      staffRole: { id: 1, name: "Branch Manager", isDefault: true },
      branchId: 1,
      branchName: "Main Branch - Lusaka",
      isActive: true,
      loginRestrictions: {
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        workHours: { start: "08:00", end: "17:00" },
        allowedIPs: [],
        allowedCountries: ["Zambia"],
        requireTwoFactor: true
      },
      lastLoginAt: "2025-06-16T10:30:00Z",
      lastLoginIP: "192.168.1.100",
      createdAt: "2025-06-01T00:00:00Z"
    },
    {
      id: 2,
      firstName: "Mary",
      lastName: "Banda",
      email: "mary.banda@loansphere.world",
      phone: "+260 97 234 5678",
      photoUrl: undefined,
      staffRole: { id: 2, name: "Teller", isDefault: true },
      branchId: 1,
      branchName: "Main Branch - Lusaka",
      isActive: true,
      loginRestrictions: {
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        workHours: { start: "08:30", end: "16:30" },
        allowedIPs: [],
        allowedCountries: ["Zambia"],
        requireTwoFactor: false
      },
      lastLoginAt: "2025-06-16T09:15:00Z",
      lastLoginIP: "192.168.1.101",
      createdAt: "2025-06-05T00:00:00Z"
    },
    {
      id: 3,
      firstName: "Peter",
      lastName: "Chanda",
      email: "peter.chanda@loansphere.world",
      phone: "+260 97 345 6789",
      photoUrl: undefined,
      staffRole: { id: 3, name: "Collector", isDefault: true },
      branchId: 1,
      branchName: "Main Branch - Lusaka",
      isActive: true,
      loginRestrictions: {
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        workHours: { start: "07:00", end: "18:00" },
        allowedIPs: [],
        allowedCountries: ["Zambia"],
        requireTwoFactor: false
      },
      lastLoginAt: "2025-06-15T16:45:00Z",
      lastLoginIP: "192.168.1.102",
      createdAt: "2025-06-10T00:00:00Z"
    }
  ];

  const staffRoles = [
    {
      id: 1,
      name: "Branch Manager",
      description: "Full branch operations management and oversight",
      isDefault: true,
      permissions: {
        pages: ["*"],
        actions: ["*"],
        modules: ["*"],
        restrictions: {
          canBackdate: true,
          canPostdate: true,
          requiresApproval: { repayments: false, savingsTransactions: false }
        }
      },
      createdAt: "2025-06-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Teller",
      description: "Process transactions and manage customer accounts",
      isDefault: true,
      permissions: {
        pages: ["loans", "repayments", "borrowers", "savings"],
        actions: ["view_loans", "add_repayment", "edit_borrower", "manage_savings"],
        modules: ["loan_servicing", "savings_management"],
        restrictions: {
          canBackdate: false,
          canPostdate: false,
          requiresApproval: { repayments: false, savingsTransactions: true }
        }
      },
      createdAt: "2025-06-01T00:00:00Z"
    },
    {
      id: 3,
      name: "Collector",
      description: "Manage collections and follow up on overdue accounts",
      isDefault: true,
      permissions: {
        pages: ["loans", "collections", "borrowers"],
        actions: ["view_loans", "manage_collections", "contact_borrowers"],
        modules: ["loan_servicing", "collections"],
        restrictions: {
          canBackdate: false,
          canPostdate: false,
          requiresApproval: { repayments: true, savingsTransactions: true }
        }
      },
      createdAt: "2025-06-01T00:00:00Z"
    }
  ];

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
  });

  // Staff role form
  const roleForm = useForm<StaffRoleFormData>({
    resolver: zodResolver(staffRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: {
        pages: [],
        actions: [],
        modules: [],
        restrictions: {
          canBackdate: false,
          canPostdate: false,
          requiresApproval: {
            repayments: true,
            savingsTransactions: true,
          },
        },
      },
    },
  });

  // Staff member form
  const staffForm = useForm<StaffMemberFormData>({
    resolver: zodResolver(staffMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      staffRoleId: 0,
      branchId: 0,
      loginRestrictions: {
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        workHours: { start: "08:00", end: "17:00" },
        allowedIPs: [],
        allowedCountries: ["Zambia"],
        requireTwoFactor: false,
      },
    },
  });

  // Create staff role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: StaffRoleFormData) => {
      return await apiRequest("/api/staff-roles", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Staff role created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-roles"] });
      setIsAddRoleOpen(false);
      roleForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create staff role",
        variant: "destructive" 
      });
    },
  });

  // Create staff member mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffMemberFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      return await apiRequest("/api/staff-members", "POST", formData);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Staff member added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-members"] });
      setIsAddStaffOpen(false);
      staffForm.reset();
      setPhotoFile(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add staff member",
        variant: "destructive" 
      });
    },
  });

  // Filter staff members
  const filteredStaff = staffMembers.filter((staff: StaffMember) => {
    const matchesSearch = staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || staff.staffRole.name === selectedRole;
    const matchesBranch = selectedBranch === "all" || staff.branchId?.toString() === selectedBranch;
    
    return matchesSearch && matchesRole && matchesBranch;
  });

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Roles & Staff Management</h2>
          <p className="text-gray-600">Manage staff members, roles, and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="roles">Staff Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search staff by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {staffRoles.map((role: StaffRole) => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff: StaffMember) => (
              <Card key={staff.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={staff.photoUrl} />
                      <AvatarFallback>
                        {staff.firstName[0]}{staff.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{staff.firstName} {staff.lastName}</h3>
                      <p className="text-sm text-gray-600">{staff.email}</p>
                      <Badge variant={staff.isActive ? "default" : "secondary"} className="mt-1">
                        {staff.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <Badge variant="outline">{staff.staffRole.name}</Badge>
                  </div>
                  
                  {staff.branchName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Branch:</span>
                      <span className="text-sm">{staff.branchName}</span>
                    </div>
                  )}
                  
                  {staff.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm">{staff.phone}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Work Days:</span>
                      <span>{staff.loginRestrictions.workDays.length} days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Work Hours:</span>
                      <span>{staff.loginRestrictions.workHours.start} - {staff.loginRestrictions.workHours.end}</span>
                    </div>
                    {staff.loginRestrictions.requireTwoFactor && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <Lock className="h-3 w-3" />
                        <span>2FA Required</span>
                      </div>
                    )}
                  </div>
                  
                  {staff.lastLoginAt && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Last login: {new Date(staff.lastLoginAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingStaff(staff)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-600 mb-4">Add your first staff member to get started</p>
              <Button onClick={() => setIsAddStaffOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffRoles.map((role: StaffRole) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    {role.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-600">{role.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Permissions:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Modules:</span>
                        <Badge variant="outline">{role.permissions.modules.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Actions:</span>
                        <Badge variant="outline">{role.permissions.actions.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Pages:</span>
                        <Badge variant="outline">{role.permissions.pages.length}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Restrictions:</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Can Backdate:</span>
                        <Badge variant={role.permissions.restrictions.canBackdate ? "default" : "secondary"}>
                          {role.permissions.restrictions.canBackdate ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Can Postdate:</span>
                        <Badge variant={role.permissions.restrictions.canPostdate ? "default" : "secondary"}>
                          {role.permissions.restrictions.canPostdate ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Repayments Need Approval:</span>
                        <Badge variant={role.permissions.restrictions.requiresApproval.repayments ? "destructive" : "default"}>
                          {role.permissions.restrictions.requiresApproval.repayments ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Savings Need Approval:</span>
                        <Badge variant={role.permissions.restrictions.requiresApproval.savingsTransactions ? "destructive" : "default"}>
                          {role.permissions.restrictions.requiresApproval.savingsTransactions ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingRole(role)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      disabled={role.isDefault}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <p className="text-sm text-gray-600">
                Overview of permissions assigned to each role
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Permission</th>
                      {staffRoles.map((role: StaffRole) => (
                        <th key={role.id} className="border border-gray-300 p-3 text-center">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AVAILABLE_ACTIONS.map((action) => (
                      <tr key={action}>
                        <td className="border border-gray-300 p-3 font-medium">
                          {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        {staffRoles.map((role: StaffRole) => (
                          <td key={role.id} className="border border-gray-300 p-3 text-center">
                            {role.permissions.actions.includes(action) || 
                             role.permissions.actions.includes("*") ? (
                              <UserCheck className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff member account with role and permissions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...staffForm}>
            <form onSubmit={staffForm.handleSubmit((data) => createStaffMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Personal Information</h3>
                  
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={photoFile ? URL.createObjectURL(photoFile) : undefined} />
                        <AvatarFallback>
                          <Upload className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photo
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={staffForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Role and Security Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Role & Security</h3>

                  <FormField
                    control={staffForm.control}
                    name="staffRoleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Role *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staffRoles.map((role: StaffRole) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Branch</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All branches</SelectItem>
                            {branches.map((branch: any) => (
                              <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Restrict staff access to specific branch only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Login Restrictions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Login Restrictions</h4>

                    <div>
                      <Label>Work Days</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {WORK_DAYS.map((day) => (
                          <FormField
                            key={day}
                            control={staffForm.control}
                            name="loginRestrictions.workDays"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, day]);
                                      } else {
                                        field.onChange(current.filter((d) => d !== day));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {day.slice(0, 3)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={staffForm.control}
                        name="loginRestrictions.workHours.start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={staffForm.control}
                        name="loginRestrictions.workHours.end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <Label>Allowed Countries</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {COUNTRIES.map((country) => (
                          <FormField
                            key={country}
                            control={staffForm.control}
                            name="loginRestrictions.allowedCountries"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(country)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, country]);
                                      } else {
                                        field.onChange(current.filter((c) => c !== country));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {country}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={staffForm.control}
                      name="loginRestrictions.requireTwoFactor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Require Two-Factor Authentication
                            </FormLabel>
                            <FormDescription>
                              Staff member must use 2FA to log in
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStaffMutation.isPending}>
                  {createStaffMutation.isPending ? "Creating..." : "Create Staff Member"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Staff Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and restrictions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit((data) => createRoleMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Role Information</h3>

                  <FormField
                    control={roleForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={roleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="font-medium">Restrictions</h4>

                    <FormField
                      control={roleForm.control}
                      name="permissions.restrictions.canBackdate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow Backdating</FormLabel>
                            <FormDescription>
                              Can create transactions with past dates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={roleForm.control}
                      name="permissions.restrictions.canPostdate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow Postdating</FormLabel>
                            <FormDescription>
                              Can create transactions with future dates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={roleForm.control}
                      name="permissions.restrictions.requiresApproval.repayments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Repayments Require Approval</FormLabel>
                            <FormDescription>
                              Repayment entries need supervisor approval
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={roleForm.control}
                      name="permissions.restrictions.requiresApproval.savingsTransactions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Savings Transactions Require Approval</FormLabel>
                            <FormDescription>
                              Savings entries need supervisor approval
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Permissions</h3>

                  <div>
                    <Label>Accessible Pages</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {AVAILABLE_PAGES.map((page) => (
                        <FormField
                          key={page}
                          control={roleForm.control}
                          name="permissions.pages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(page)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, page]);
                                    } else {
                                      field.onChange(current.filter((p) => p !== page));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {page.replace(/_/g, ' ')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Available Actions</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {AVAILABLE_ACTIONS.map((action) => (
                        <FormField
                          key={action}
                          control={roleForm.control}
                          name="permissions.actions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(action)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, action]);
                                    } else {
                                      field.onChange(current.filter((a) => a !== action));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Accessible Modules</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {AVAILABLE_MODULES.map((module) => (
                        <FormField
                          key={module}
                          control={roleForm.control}
                          name="permissions.modules"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(module)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, module]);
                                    } else {
                                      field.onChange(current.filter((m) => m !== module));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoleMutation.isPending}>
                  {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}