import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Wallet,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Upload,
  Download,
  Calculator,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Settings,
  FileText,
  CreditCard,
  Target,
  Percent,
  RefreshCw,
  Send,
  Activity
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const savingsProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  interestRate: z.string().min(1, "Interest rate is required"),
  compoundingFrequency: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Annually"]),
  minimumBalance: z.string().min(1, "Minimum balance is required"),
  allowWithdrawals: z.boolean(),
  withdrawalFee: z.string().optional(),
  maxWithdrawalsPerMonth: z.string().optional(),
  overdraftAllowed: z.boolean(),
  overdraftLimit: z.string().optional(),
  overdraftRate: z.string().optional(),
  requiresApproval: z.boolean(),
  dormancyPeriod: z.string().optional(),
  dormancyFee: z.string().optional(),
  autoRenewal: z.boolean(),
  maturityPeriod: z.string().optional(),
  earlyWithdrawalPenalty: z.string().optional(),
});

const savingsAccountSchema = z.object({
  accountNumber: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
  customerId: z.string().min(1, "Customer is required"),
  branchId: z.string().optional(),
  openingBalance: z.string().min(1, "Opening balance is required"),
  status: z.enum(["Active", "Dormant", "Closed", "Suspended"]),
  nominalAnnualInterestRate: z.string().optional(),
});

const transactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  transactionType: z.enum(["Deposit", "Withdrawal", "Interest", "Fee", "Transfer"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
});

const bulkTransactionSchema = z.object({
  accounts: z.array(z.string()).min(1, "Select at least one account"),
  transactionType: z.enum(["Interest", "Fee", "Deposit"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  executionDate: z.string().optional(),
});

export const SavingsManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const savingsProducts = [
    {
      id: 1,
      name: "Regular Savings",
      description: "Standard savings account with competitive interest",
      interestRate: "5.5",
      compoundingFrequency: "Monthly",
      minimumBalance: "1000",
      allowWithdrawals: true,
      withdrawalFee: "50",
      maxWithdrawalsPerMonth: "5",
      isActive: true,
      accountCount: 125,
      totalBalance: "5250000",
    },
    {
      id: 2,
      name: "Premium Savings",
      description: "High-yield savings for premium customers",
      interestRate: "7.0",
      compoundingFrequency: "Monthly",
      minimumBalance: "10000",
      allowWithdrawals: true,
      withdrawalFee: "25",
      maxWithdrawalsPerMonth: "10",
      isActive: true,
      accountCount: 68,
      totalBalance: "8750000",
    },
    {
      id: 3,
      name: "Youth Savings",
      description: "Special savings account for young customers",
      interestRate: "6.0",
      compoundingFrequency: "Monthly",
      minimumBalance: "500",
      allowWithdrawals: true,
      withdrawalFee: "0",
      maxWithdrawalsPerMonth: "3",
      isActive: true,
      accountCount: 89,
      totalBalance: "1850000",
    },
  ];

  const savingsAccounts = [
    {
      id: 1,
      accountNumber: "SAV-001-2024",
      productName: "Regular Savings",
      customerName: "John Musonda",
      currentBalance: "25000",
      availableBalance: "25000",
      interestRate: "5.5",
      status: "Active",
      lastTransactionDate: "2024-06-12",
      openedDate: "2024-01-15",
      maturityDate: null,
      totalInterestEarned: "650",
    },
    {
      id: 2,
      accountNumber: "SAV-002-2024",
      productName: "Premium Savings",
      customerName: "Mary Banda",
      currentBalance: "85000",
      availableBalance: "85000",
      interestRate: "7.0",
      status: "Active",
      lastTransactionDate: "2024-06-11",
      openedDate: "2024-02-20",
      maturityDate: null,
      totalInterestEarned: "2380",
    },
    {
      id: 3,
      accountNumber: "SAV-003-2024",
      productName: "Youth Savings",
      customerName: "Peter Zulu",
      currentBalance: "12500",
      availableBalance: "12500",
      interestRate: "6.0",
      status: "Active",
      lastTransactionDate: "2024-06-10",
      openedDate: "2024-03-05",
      maturityDate: null,
      totalInterestEarned: "375",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      accountNumber: "SAV-001-2024",
      customerName: "John Musonda",
      type: "Deposit",
      amount: "5000",
      balance: "25000",
      date: "2024-06-12",
      description: "Cash deposit",
      reference: "TXN-001-2024",
    },
    {
      id: 2,
      accountNumber: "SAV-002-2024",
      customerName: "Mary Banda",
      type: "Interest",
      amount: "498",
      balance: "85000",
      date: "2024-06-11",
      description: "Monthly interest credit",
      reference: "INT-002-2024",
    },
    {
      id: 3,
      accountNumber: "SAV-003-2024",
      customerName: "Peter Zulu",
      type: "Withdrawal",
      amount: "2000",
      balance: "12500",
      date: "2024-06-10",
      description: "ATM withdrawal",
      reference: "WTH-003-2024",
    },
  ];

  const customers = [
    { id: 1, firstName: "John", lastName: "Musonda" },
    { id: 2, firstName: "Mary", lastName: "Banda" },
    { id: 3, firstName: "Peter", lastName: "Zulu" },
  ];

  const branches = [
    { id: 1, name: "Main Branch - Lusaka" },
    { id: 2, name: "Kitwe Branch" },
    { id: 3, name: "Ndola Branch" },
  ];

  // Forms
  const productForm = useForm<z.infer<typeof savingsProductSchema>>({
    resolver: zodResolver(savingsProductSchema),
    defaultValues: {
      name: "",
      description: "",
      interestRate: "",
      compoundingFrequency: "Monthly",
      minimumBalance: "",
      allowWithdrawals: true,
      withdrawalFee: "",
      maxWithdrawalsPerMonth: "",
      overdraftAllowed: false,
      overdraftLimit: "",
      overdraftRate: "",
      requiresApproval: false,
      dormancyPeriod: "",
      dormancyFee: "",
      autoRenewal: false,
      maturityPeriod: "",
      earlyWithdrawalPenalty: "",
    },
  });

  const accountForm = useForm<z.infer<typeof savingsAccountSchema>>({
    resolver: zodResolver(savingsAccountSchema),
    defaultValues: {
      accountNumber: "",
      productId: "",
      customerId: "",
      branchId: "",
      openingBalance: "",
      status: "Active",
      nominalAnnualInterestRate: "",
    },
  });

  const transactionForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: "",
      transactionType: "Deposit",
      amount: "",
      description: "",
      referenceNumber: "",
    },
  });

  const bulkForm = useForm<z.infer<typeof bulkTransactionSchema>>({
    resolver: zodResolver(bulkTransactionSchema),
    defaultValues: {
      accounts: [],
      transactionType: "Interest",
      amount: "",
      description: "",
      executionDate: "",
    },
  });

  // Filter accounts
  const filteredAccounts = savingsAccounts.filter((account: any) => {
    const matchesSearch = account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || account.status === statusFilter;
    const matchesProduct = productFilter === "" || account.productName === productFilter;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Calculate statistics
  const calculateStats = () => {
    const totalAccounts = savingsAccounts.length;
    const totalBalance = savingsAccounts.reduce((sum: number, acc: any) => 
      sum + parseFloat(acc.currentBalance || "0"), 0);
    const totalInterest = savingsAccounts.reduce((sum: number, acc: any) => 
      sum + parseFloat(acc.totalInterestEarned || "0"), 0);
    const avgBalance = totalAccounts > 0 ? totalBalance / totalAccounts : 0;
    
    return {
      totalAccounts,
      totalBalance,
      totalInterest,
      avgBalance,
      activeAccounts: savingsAccounts.filter((acc: any) => acc.status === "Active").length,
      totalProducts: savingsProducts.length,
    };
  };

  const stats = calculateStats();

  const onProductSubmit = (data: z.infer<typeof savingsProductSchema>) => {
    toast({ title: "Success", description: "Savings product created successfully" });
    setIsProductDialogOpen(false);
    productForm.reset();
  };

  const onAccountSubmit = (data: z.infer<typeof savingsAccountSchema>) => {
    toast({ title: "Success", description: "Savings account created successfully" });
    setIsAccountDialogOpen(false);
    accountForm.reset();
  };

  const onTransactionSubmit = (data: z.infer<typeof transactionSchema>) => {
    toast({ title: "Success", description: "Transaction processed successfully" });
    setIsTransactionDialogOpen(false);
    transactionForm.reset();
  };

  const onBulkSubmit = (data: z.infer<typeof bulkTransactionSchema>) => {
    toast({ title: "Success", description: `Bulk ${data.transactionType.toLowerCase()} processed for ${data.accounts.length} accounts` });
    setIsBulkDialogOpen(false);
    bulkForm.reset();
  };

  const handleAutoInterestPosting = () => {
    toast({ title: "Success", description: "Automatic interest posting initiated for all eligible accounts" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Savings Management</h2>
          <p className="text-gray-600">Manage savings products, accounts, and automated interest calculations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAutoInterestPosting}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto Interest
          </Button>
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Bulk Process
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Transaction Processing</DialogTitle>
                <DialogDescription>Process transactions for multiple accounts simultaneously</DialogDescription>
              </DialogHeader>
              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-4">
                  <FormField
                    control={bulkForm.control}
                    name="transactionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Interest">Interest Credit</SelectItem>
                            <SelectItem value="Fee">Fee Deduction</SelectItem>
                            <SelectItem value="Deposit">Bulk Deposit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bulkForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ZMW)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bulkForm.control}
                    name="accounts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Accounts</FormLabel>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {savingsAccounts.map((account: any) => (
                            <div key={account.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value.includes(account.id.toString())}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, account.id.toString()]);
                                  } else {
                                    field.onChange(field.value.filter((id: string) => id !== account.id.toString()));
                                  }
                                }}
                              />
                              <span className="text-sm">{account.accountNumber} - {account.customerName}</span>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bulkForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Transaction description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Process Bulk Transaction
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Savings Product</DialogTitle>
                <DialogDescription>Configure a new savings product with interest rates and terms</DialogDescription>
              </DialogHeader>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Regular Savings" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="5.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="compoundingFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compounding Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Quarterly">Quarterly</SelectItem>
                              <SelectItem value="Annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="minimumBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Balance (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="withdrawalFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Withdrawal Fee (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="maxWithdrawalsPerMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Withdrawals/Month</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={productForm.control}
                      name="allowWithdrawals"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allow Withdrawals</FormLabel>
                            <FormDescription>Enable customers to withdraw from this account</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="overdraftAllowed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allow Overdraft</FormLabel>
                            <FormDescription>Enable overdraft facility for this product</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="requiresApproval"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Requires Approval</FormLabel>
                            <FormDescription>Account opening requires manual approval</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="autoRenewal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Auto Renewal</FormLabel>
                            <FormDescription>Automatically renew account at maturity</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Product description and terms..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Create Product
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open Savings Account</DialogTitle>
                <DialogDescription>Create a new savings account for a customer</DialogDescription>
              </DialogHeader>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Savings Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {savingsProducts.map((product: any) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} ({product.interestRate}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.firstName} {customer.lastName}
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
                      control={accountForm.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                    <FormField
                      control={accountForm.control}
                      name="openingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Balance (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={accountForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Dormant">Dormant</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Open Account
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Savings accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Paid</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.totalInterest.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Balance</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.avgBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Available products</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Performance Analytics</h3>
                  <p className="text-gray-500">Charts and analytics will display here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === "Deposit" ? "bg-green-500" :
                          transaction.type === "Withdrawal" ? "bg-red-500" : "bg-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium">{transaction.customerName}</p>
                          <p className="text-sm text-gray-500">{transaction.type} • {transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === "Deposit" || transaction.type === "Interest" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "Deposit" || transaction.type === "Interest" ? "+" : "-"}ZMW {transaction.amount}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.accountNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Accounts</CardTitle>
              <CardDescription>Manage customer savings accounts and balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by account number or customer name..."
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Dormant">Dormant</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {savingsProducts.map((product: any) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accounts List */}
              <div className="space-y-4">
                {filteredAccounts.map((account: any) => (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{account.accountNumber}</h4>
                            <Badge variant={account.status === "Active" ? "default" : 
                              account.status === "Dormant" ? "secondary" : "destructive"}>
                              {account.status}
                            </Badge>
                            <Badge variant="outline">{account.productName}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Customer</p>
                              <p className="font-medium">{account.customerName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Balance</p>
                              <p className="font-medium">ZMW {parseFloat(account.currentBalance).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interest Rate</p>
                              <p className="font-medium">{account.interestRate}% p.a.</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interest Earned</p>
                              <p className="font-medium text-green-600">ZMW {parseFloat(account.totalInterestEarned).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Opened: {account.openedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last Activity: {account.lastTransactionDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedAccount(account)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>New Transaction</DialogTitle>
                                <DialogDescription>Process a transaction for this account</DialogDescription>
                              </DialogHeader>
                              <Form {...transactionForm}>
                                <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4">
                                  <FormField
                                    control={transactionForm.control}
                                    name="transactionType"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Transaction Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="Deposit">Deposit</SelectItem>
                                            <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                                            <SelectItem value="Interest">Interest Credit</SelectItem>
                                            <SelectItem value="Fee">Fee Deduction</SelectItem>
                                            <SelectItem value="Transfer">Transfer</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={transactionForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Amount (ZMW)</FormLabel>
                                        <FormControl>
                                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={transactionForm.control}
                                    name="description"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Transaction description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={transactionForm.control}
                                    name="referenceNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Reference Number</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Optional reference" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button type="submit" className="w-full">
                                    Process Transaction
                                  </Button>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-8">
                    <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No accounts found</h3>
                    <p className="text-gray-500">No savings accounts match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Products</CardTitle>
              <CardDescription>Configure savings products with interest rates and terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savingsProducts.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {product.name}
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Interest Rate</span>
                          <span className="font-medium text-green-600">{product.interestRate}% p.a.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Compounding</span>
                          <span className="font-medium">{product.compoundingFrequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Min Balance</span>
                          <span className="font-medium">ZMW {parseFloat(product.minimumBalance).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Withdrawal Fee</span>
                          <span className="font-medium">ZMW {parseFloat(product.withdrawalFee || "0").toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Max Withdrawals</span>
                          <span className="font-medium">{product.maxWithdrawalsPerMonth}/month</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Accounts</span>
                            <span className="font-medium">{product.accountCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Balance</span>
                            <span className="font-medium">ZMW {parseFloat(product.totalBalance).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all savings account transactions and automated interest postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search transactions..." className="pl-8" />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="space-y-4">
                {recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        transaction.type === "Deposit" ? "bg-green-500" :
                        transaction.type === "Withdrawal" ? "bg-red-500" : 
                        transaction.type === "Interest" ? "bg-blue-500" : "bg-gray-500"
                      }`} />
                      <div>
                        <p className="font-medium">{transaction.accountNumber}</p>
                        <p className="text-sm text-gray-500">{transaction.customerName}</p>
                      </div>
                      <div>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === "Deposit" || transaction.type === "Interest" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "Deposit" || transaction.type === "Interest" ? "+" : "-"}ZMW {parseFloat(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Balance: ZMW {parseFloat(transaction.balance).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                      <p className="text-xs text-gray-400">{transaction.reference}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};