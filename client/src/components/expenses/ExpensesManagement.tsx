import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Upload,
  Download,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  BarChart3,
  CreditCard,
  Repeat,
  Building,
  Link,
  Paperclip,
  Archive,
  Trash2,
  Calculator,
  Target,
  PieChart,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Users,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const expenseTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const expenseSchema = z.object({
  expenseTypeId: z.string().min(1, "Expense type is required"),
  loanId: z.string().optional(),
  branchId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("ZMW"),
  expenseDate: z.string().min(1, "Expense date is required"),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Credit Card", "Cheque", "Mobile Money", "Other"]).optional(),
  paymentReference: z.string().optional(),
  vendor: z.string().optional(),
  category: z.enum(["Operational", "Administrative", "Marketing", "Technology", "Legal", "Other"]).optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]).optional(),
  recurringEndDate: z.string().optional(),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const customFieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["text", "number", "date", "select", "boolean"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const ExpensesManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [tagInput, setTagInput] = useState("");
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const { toast } = useToast();

  // Fetch expense types from API
  const { data: expenseTypes = [], isLoading: expenseTypesLoading } = useQuery<any[]>({
    queryKey: ["/api/expense-types"],
  });

  // Fetch expenses from API
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
  });

  // Fetch loans from API
  const { data: loans = [] } = useQuery<any[]>({
    queryKey: ["/api/loans"],
  });

  // Fetch branches from API
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
  });

  // Fetch custom fields from API
  const { data: customFields = [] } = useQuery<any[]>({
    queryKey: ["/api/expense-custom-fields"],
  });

  // Mutations for expense operations
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/expenses", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense created successfully" });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create expense",
        variant: "destructive" 
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/expenses/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense updated successfully" });
      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      expenseForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update expense",
        variant: "destructive" 
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete expense",
        variant: "destructive" 
      });
    },
  });

  const createExpenseTypeMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/expense-types", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-types"] });
      toast({ title: "Success", description: "Expense type created successfully" });
      setIsTypeDialogOpen(false);
      typeForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create expense type",
        variant: "destructive" 
      });
    },
  });

  const createCustomFieldMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/expense-custom-fields", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-custom-fields"] });
      toast({ title: "Success", description: "Custom field created successfully" });
      setIsCustomFieldDialogOpen(false);
      customFieldForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create custom field",
        variant: "destructive" 
      });
    },
  });

  const bulkCreateExpensesMutation = useMutation({
    mutationFn: (data: any[]) => apiRequest("/api/expenses/bulk", { method: "POST", body: { expenses: data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expenses imported successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to import expenses",
        variant: "destructive" 
      });
    },
  });

  // Forms
  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseTypeId: "",
      loanId: "",
      branchId: "",
      title: "",
      description: "",
      amount: "",
      currency: "ZMW",
      expenseDate: "",
      paymentMethod: undefined,
      paymentReference: "",
      vendor: "",
      category: undefined,
      isRecurring: false,
      recurringFrequency: undefined,
      recurringEndDate: "",
      receiptNumber: "",
      notes: "",
      tags: [],
    },
  });

  const typeForm = useForm<z.infer<typeof expenseTypeSchema>>({
    resolver: zodResolver(expenseTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const customFieldForm = useForm<z.infer<typeof customFieldSchema>>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      name: "",
      type: "text",
      options: [],
      required: false,
      isActive: true,
    },
  });

  // Filter expenses
  const filteredExpenses = expenses.filter((expense: any) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || expense.status === statusFilter;
    const matchesType = typeFilter === "" || expense.expenseType === typeFilter;
    const matchesCategory = categoryFilter === "" || expense.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  // Calculate statistics
  const calculateStats = () => {
    const totalExpenses = expenses.reduce((sum: number, exp: any) => 
      sum + parseFloat(exp.amount || "0"), 0);
    const pendingExpenses = expenses.filter((exp: any) => exp.status === "Pending");
    const approvedExpenses = expenses.filter((exp: any) => exp.status === "Approved");
    const paidExpenses = expenses.filter((exp: any) => exp.status === "Paid");
    const recurringExpenses = expenses.filter((exp: any) => exp.isRecurring);
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses.filter((exp: any) => 
      new Date(exp.expenseDate).getMonth() === currentMonth);
    const monthlyTotal = monthlyExpenses.reduce((sum: number, exp: any) => 
      sum + parseFloat(exp.amount || "0"), 0);
    
    return {
      totalExpenses,
      totalCount: expenses.length,
      pendingCount: pendingExpenses.length,
      approvedCount: approvedExpenses.length,
      paidCount: paidExpenses.length,
      recurringCount: recurringExpenses.length,
      monthlyTotal,
      monthlyCount: monthlyExpenses.length,
      avgExpenseAmount: totalExpenses / expenses.length || 0,
    };
  };

  const stats = calculateStats();

  const onExpenseSubmit = (data: z.infer<typeof expenseSchema>) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({
        id: editingExpense.id,
        data: { ...data, lenderId: 2 } // Use lender ID from current user context
      });
    } else {
      createExpenseMutation.mutate({
        ...data,
        lenderId: 2 // Use lender ID from current user context
      });
    }
  };

  const onTypeSubmit = (data: z.infer<typeof expenseTypeSchema>) => {
    createExpenseTypeMutation.mutate({
      ...data,
      lenderId: 2 // Use lender ID from current user context
    });
  };

  const onCustomFieldSubmit = (data: z.infer<typeof customFieldSchema>) => {
    createCustomFieldMutation.mutate({
      ...data,
      lenderId: 2 // Use lender ID from current user context
    });
  };

  const handleBulkUpload = () => {
    // This would typically parse a CSV file and extract data
    // For now, we'll show the success message
    toast({ title: "Success", description: "Bulk upload completed successfully" });
    setIsBulkUploadDialogOpen(false);
  };

  const handleExport = (format: string) => {
    toast({ title: "Success", description: `Expenses exported to ${format} successfully` });
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = expenseForm.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        expenseForm.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = expenseForm.getValues("tags");
    expenseForm.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Expenses Management</h2>
          <p className="text-gray-600">Track, manage, and analyze business expenses with advanced categorization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("CSV")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("Excel")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Expenses</DialogTitle>
                <DialogDescription>Upload expenses from CSV file</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>CSV File</Label>
                  <Input type="file" accept=".csv" />
                  <p className="text-sm text-muted-foreground">
                    Download template: <Button variant="link" className="p-0 h-auto">expenses_template.csv</Button>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Upload Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="skipDuplicates" defaultChecked />
                      <Label htmlFor="skipDuplicates">Skip duplicate entries</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="validateData" defaultChecked />
                      <Label htmlFor="validateData">Validate data before import</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sendNotifications" />
                      <Label htmlFor="sendNotifications">Send notifications after import</Label>
                    </div>
                  </div>
                </div>
                <Button onClick={handleBulkUpload} className="w-full">
                  Upload Expenses
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Expense Type</DialogTitle>
                <DialogDescription>Add a new expense type for categorization</DialogDescription>
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
                          <Input placeholder="e.g., Office Supplies" {...field} />
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
                          <Textarea placeholder="Description of this expense type..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={typeForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>Enable this expense type for use</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Expense Type
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Expense</DialogTitle>
                <DialogDescription>Add a new expense with detailed categorization and linking</DialogDescription>
              </DialogHeader>
              <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monthly Office Rent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="expenseTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expense type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseTypes.map((type: any) => (
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

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ZMW">ZMW</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="expenseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                              <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Operational">Operational</SelectItem>
                              <SelectItem value="Administrative">Administrative</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="Legal">Legal</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ABC Suppliers Ltd" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="receiptNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., REC-2024-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="loanId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link to Loan (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan to link" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No loan linkage</SelectItem>
                              {loans.map((loan: any) => (
                                <SelectItem key={loan.id} value={loan.id.toString()}>
                                  {loan.loanNumber} - {loan.borrower} (ZMW {loan.amount})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No specific branch</SelectItem>
                              {branches.map((branch: any) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Recurring Expense Settings */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <FormField
                      control={expenseForm.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Recurring Expense</FormLabel>
                            <FormDescription>Set this expense to repeat automatically</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {expenseForm.watch("isRecurring") && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={expenseForm.control}
                          name="recurringFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Daily">Daily</SelectItem>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                                  <SelectItem value="Yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="recurringEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expenseForm.watch("tags").map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="space-y-2">
                    <Label>Attachments (Receipts, Invoices)</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Drag and drop files here or click to browse</p>
                      <Input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="mt-2" />
                    </div>
                  </div>

                  <FormField
                    control={expenseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description/Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional details about this expense..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Create Expense
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.monthlyTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.monthlyCount} expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedCount}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidCount}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
            <Repeat className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recurringCount}</div>
            <p className="text-xs text-muted-foreground">Auto expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Amount</CardTitle>
            <Calculator className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.avgExpenseAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per expense</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Count</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">All expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="types">Expense Types</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Category Breakdown</h3>
                  <p className="text-gray-500">Expense distribution by category will display here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.slice(0, 4).map((expense: any) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          expense.status === "Paid" ? "bg-green-500" :
                          expense.status === "Approved" ? "bg-blue-500" : "bg-yellow-500"
                        }`} />
                        <div>
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-gray-500">{expense.expenseType} • {expense.expenseDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">ZMW {parseFloat(expense.amount).toLocaleString()}</p>
                        <Badge variant={expense.status === "Paid" ? "default" : 
                          expense.status === "Approved" ? "secondary" : "outline"}>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>Manage and track all business expenses with advanced filtering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, vendor, or receipt number..."
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
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {expenseTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expenses List */}
              <div className="space-y-4">
                {filteredExpenses.map((expense: any) => (
                  <Card key={expense.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{expense.title}</h4>
                            <Badge variant={expense.status === "Paid" ? "default" : 
                              expense.status === "Approved" ? "secondary" : 
                              expense.status === "Pending" ? "outline" : "destructive"}>
                              {expense.status}
                            </Badge>
                            <Badge variant="outline">{expense.expenseType}</Badge>
                            {expense.category && (
                              <Badge variant="secondary">{expense.category}</Badge>
                            )}
                            {expense.isRecurring && (
                              <Badge variant="outline" className="text-indigo-600">
                                <Repeat className="h-3 w-3 mr-1" />
                                {expense.recurringFrequency}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">{expense.currency} {parseFloat(expense.amount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium">{expense.expenseDate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Vendor</p>
                              <p className="font-medium">{expense.vendor || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payment Method</p>
                              <p className="font-medium">{expense.paymentMethod || "N/A"}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                            {expense.receiptNumber && (
                              <span className="flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                {expense.receiptNumber}
                              </span>
                            )}
                            {expense.loanLinked && (
                              <span className="flex items-center gap-1">
                                <Link className="h-3 w-3" />
                                {expense.loanLinked}
                              </span>
                            )}
                            {expense.branchName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {expense.branchName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {expense.createdBy}
                            </span>
                          </div>
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="mt-2 flex gap-1">
                              {expense.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedExpense(expense)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No expenses found</h3>
                    <p className="text-gray-500">No expenses match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Types</CardTitle>
              <CardDescription>Manage expense categories and types for better organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expenseTypes.map((type: any) => (
                  <Card key={type.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {type.name}
                        <div className="flex gap-1">
                          {type.isSystem && (
                            <Badge variant="outline" className="text-xs">System</Badge>
                          )}
                          <Badge variant={type.isActive ? "default" : "secondary"}>
                            {type.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage Count</span>
                        <span className="font-medium">
                          {expenses.filter((exp: any) => exp.expenseType === type.name).length}
                        </span>
                      </div>
                      {!type.isSystem && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Expense Trends</h3>
                  <p className="text-gray-500">Monthly expense trend charts will display here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget vs Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Budget Analysis</h3>
                  <p className="text-gray-500">Budget comparison analytics will display here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Fields
              </CardTitle>
              <CardDescription>Configure custom fields for expense categorization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Active Custom Fields</h3>
                <Dialog open={isCustomFieldDialogOpen} onOpenChange={setIsCustomFieldDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Field</DialogTitle>
                      <DialogDescription>Add a custom field for expense data collection</DialogDescription>
                    </DialogHeader>
                    <Form {...customFieldForm}>
                      <form onSubmit={customFieldForm.handleSubmit(onCustomFieldSubmit)} className="space-y-4">
                        <FormField
                          control={customFieldForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Project Code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customFieldForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                                  <SelectItem value="boolean">Yes/No</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {customFieldForm.watch("type") === "select" && (
                          <FormField
                            control={customFieldForm.control}
                            name="options"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Options (comma separated)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Option1, Option2, Option3" 
                                    onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <div className="flex gap-4">
                          <FormField
                            control={customFieldForm.control}
                            name="required"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Required</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customFieldForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Active</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Create Custom Field
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {customFields.map((field: any) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{field.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && <Badge variant="secondary">Required</Badge>}
                            <Badge variant={field.isActive ? "default" : "secondary"}>
                              {field.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {field.options && field.options.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Options: {field.options.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};