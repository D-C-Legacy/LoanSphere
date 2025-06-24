import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Shield,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Upload,
  Camera,
  FileText,
  Calculator,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Image,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const collateralTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  depreciation: z.string().optional(),
});

const collateralSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  collateralTypeId: z.string().min(1, "Type is required"),
  borrowerId: z.string().min(1, "Borrower is required"),
  loanId: z.string().optional(),
  branchId: z.string().optional(),
  serialNumber: z.string().optional(),
  estimatedValue: z.string().min(1, "Value is required"),
  currentValue: z.string().optional(),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor"]),
  status: z.enum(["Active", "Released", "Sold", "Lost", "Damaged"]),
  location: z.string().optional(),
  valuationDate: z.string().optional(),
  nextValuationDate: z.string().optional(),
});

export const CollateralManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isCollateralDialogOpen, setIsCollateralDialogOpen] = useState(false);
  const [selectedCollateral, setSelectedCollateral] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch collateral data from API with proper authentication
  const { data: collateral = [], isLoading: loadingCollateral } = useQuery({
    queryKey: ["/api/collateral"],
  });

  const { data: collateralTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["/api/collateral-types"],
  });

  const { data: borrowers = [], isLoading: loadingBorrowers } = useQuery({
    queryKey: ["/api/borrowers"],
  });

  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ["/api/loans"],
  });

  // Type-safe arrays
  const typesArray = Array.isArray(collateralTypes) ? collateralTypes : [];
  const borrowersArray = Array.isArray(borrowers) ? borrowers : [];
  const loansArray = Array.isArray(loans) ? loans : [];

  // Create mutations for API operations
  const createTypeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof collateralTypeSchema>) => {
      return await apiRequest("/api/collateral-types", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Collateral type created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/collateral-types"] });
      setIsTypeDialogOpen(false);
      typeForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create collateral type",
        variant: "destructive" 
      });
    },
  });

  const createCollateralMutation = useMutation({
    mutationFn: async (data: z.infer<typeof collateralSchema>) => {
      return await apiRequest("/api/collateral", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Collateral created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/collateral"] });
      setIsCollateralDialogOpen(false);
      collateralForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create collateral",
        variant: "destructive" 
      });
    },
  });

  // Forms
  const typeForm = useForm<z.infer<typeof collateralTypeSchema>>({
    resolver: zodResolver(collateralTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      depreciation: "0",
    },
  });

  const collateralForm = useForm<z.infer<typeof collateralSchema>>({
    resolver: zodResolver(collateralSchema),
    defaultValues: {
      name: "",
      description: "",
      collateralTypeId: "",
      borrowerId: "",
      loanId: "",
      branchId: "",
      serialNumber: "",
      estimatedValue: "",
      currentValue: "",
      condition: "Good",
      status: "Active",
      location: "",
      valuationDate: "",
      nextValuationDate: "",
    },
  });

  // Filter collateral with proper array checks
  const collateralArray = Array.isArray(collateral) ? collateral : [];
  const filteredCollateral = collateralArray.filter((item: any) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "" || typeFilter === "all" || item.typeName === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate LTV ratios and statistics with proper error handling
  const calculateStats = () => {
    if (collateralArray.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        avgLTV: 0,
        activeItems: 0,
        highRiskItems: 0,
      };
    }

    const totalValue = collateralArray.reduce((sum: number, item: any) => 
      sum + parseFloat(item.estimatedValue || "0"), 0);
    
    const avgLTV = collateralArray.reduce((sum: number, item: any) => {
      const loanAmount = parseFloat(item.loanAmount || "0");
      const collateralValue = parseFloat(item.estimatedValue || "1");
      return sum + (loanAmount / collateralValue * 100);
    }, 0) / collateralArray.length;
    
    return {
      totalItems: collateralArray.length,
      totalValue,
      avgLTV,
      activeItems: collateralArray.filter((item: any) => item.status === "Active").length,
      highRiskItems: collateralArray.filter((item: any) => {
        const loanAmount = parseFloat(item.loanAmount || "0");
        const collateralValue = parseFloat(item.estimatedValue || "1");
        return (loanAmount / collateralValue * 100) > 80;
      }).length,
    };
  };

  const stats = calculateStats();

  const onTypeSubmit = (data: z.infer<typeof collateralTypeSchema>) => {
    createTypeMutation.mutate(data);
  };

  const onCollateralSubmit = (data: z.infer<typeof collateralSchema>) => {
    createCollateralMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Collateral Management</h2>
          <p className="text-gray-600">Manage loan collateral, track LTV ratios, and maintain asset registry</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collateral Type</DialogTitle>
                <DialogDescription>Create a new collateral type category</DialogDescription>
              </DialogHeader>
              <Form {...typeForm}>
                <form onSubmit={typeForm.handleSubmit(onTypeSubmit)} className="space-y-4">
                  <FormField
                    control={typeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Vehicle, Property, Equipment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={typeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Type description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={typeForm.control}
                    name="depreciation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Depreciation (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Type
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCollateralDialogOpen} onOpenChange={setIsCollateralDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Collateral
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Collateral Item</DialogTitle>
                <DialogDescription>Register a new collateral item for loan security</DialogDescription>
              </DialogHeader>
              <Form {...collateralForm}>
                <form onSubmit={collateralForm.handleSubmit(onCollateralSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={collateralForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Collateral Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Toyota Corolla 2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={collateralForm.control}
                      name="collateralTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typesArray.map((type: any) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={collateralForm.control}
                      name="borrowerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Borrower</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select borrower" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {borrowersArray.map((borrower: any) => (
                                <SelectItem key={borrower.id} value={borrower.id.toString()}>
                                  {borrower.firstName} {borrower.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={collateralForm.control}
                      name="loanId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Associated Loan (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loansArray.map((loan: any) => (
                                <SelectItem key={loan.id} value={loan.id.toString()}>
                                  Loan #{loan.loanNumber} - ZMW {loan.amount}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={collateralForm.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial/VIN Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Serial or identification number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={collateralForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Storage or usage location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={collateralForm.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Value (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={collateralForm.control}
                      name="currentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Market Value (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={collateralForm.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Excellent">Excellent</SelectItem>
                              <SelectItem value="Good">Good</SelectItem>
                              <SelectItem value="Fair">Fair</SelectItem>
                              <SelectItem value="Poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={collateralForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Released">Released</SelectItem>
                              <SelectItem value="Sold">Sold</SelectItem>
                              <SelectItem value="Lost">Lost</SelectItem>
                              <SelectItem value="Damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={collateralForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed description of the collateral item..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" type="button">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>
                    <Button variant="outline" className="flex-1" type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Collateral
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Registered collateral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV Ratio</CardTitle>
            <Calculator className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLTV.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Loan-to-value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeItems}</div>
            <p className="text-xs text-muted-foreground">Currently secured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskItems}</div>
            <p className="text-xs text-muted-foreground">LTV &gt; 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Collateral Registry</CardTitle>
          <CardDescription>Search and filter collateral items by status, type, borrower name, or serial number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, serial number, or borrower..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typesArray.map((type: any) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collateral List */}
          <div className="space-y-4">
            {filteredCollateral.map((item: any) => {
              const ltvRatio = item.loanAmount && item.estimatedValue 
                ? (parseFloat(item.loanAmount) / parseFloat(item.estimatedValue) * 100)
                : 0;
              
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant={item.status === "Active" ? "default" : 
                            item.status === "Released" ? "secondary" : "destructive"}>
                            {item.status}
                          </Badge>
                          <Badge variant="outline">{item.typeName}</Badge>
                          {ltvRatio > 80 && (
                            <Badge variant="destructive" className="text-xs">
                              High Risk LTV
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Borrower</p>
                            <p className="font-medium">{item.borrowerName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Serial Number</p>
                            <p className="font-medium">{item.serialNumber || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Est. Value</p>
                            <p className="font-medium">ZMW {parseFloat(item.estimatedValue).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">LTV Ratio</p>
                            <p className={`font-medium ${ltvRatio > 80 ? "text-red-600" : 
                              ltvRatio > 60 ? "text-yellow-600" : "text-green-600"}`}>
                              {ltvRatio.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Image className="h-3 w-3" />
                            {item.photos?.length || 0} photos
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {item.documents?.length || 0} documents
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedCollateral(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredCollateral.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No collateral found</h3>
                <p className="text-gray-500">No collateral items match your current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};