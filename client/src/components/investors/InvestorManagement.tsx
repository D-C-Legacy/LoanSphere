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
  Handshake,
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
  Wallet,
  Building,
  Globe,
  Shield,
  Star,
  Award,
  Activity
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const investorProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  minimumInvestment: z.string().min(1, "Minimum investment is required"),
  maximumInvestment: z.string().optional(),
  expectedReturn: z.string().min(1, "Expected return is required"),
  investmentTerm: z.string().min(1, "Investment term is required"),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  category: z.enum(["Fixed Deposit", "Bonds", "Equity", "Mixed Portfolio", "Real Estate"]),
  autoReinvestment: z.boolean(),
  earlyExitPenalty: z.string().optional(),
  managementFee: z.string().optional(),
  performanceFee: z.string().optional(),
});

const investorAccountSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  investorId: z.string().min(1, "Investor is required"),
  branchId: z.string().optional(),
  initialInvestment: z.string().min(1, "Initial investment is required"),
  status: z.enum(["Active", "Pending", "Matured", "Closed"]),
  expectedMaturityDate: z.string().optional(),
});

const loanInvestmentSchema = z.object({
  loanId: z.string().min(1, "Loan is required"),
  investorId: z.string().min(1, "Investor is required"),
  investmentAmount: z.string().min(1, "Investment amount is required"),
  expectedReturn: z.string().min(1, "Expected return is required"),
  maturityDate: z.string().min(1, "Maturity date is required"),
  riskAssessment: z.enum(["Low", "Medium", "High"]),
  autoReinvest: z.boolean(),
});

export const InvestorManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isLoanInvestmentDialogOpen, setIsLoanInvestmentDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const investorProducts = [
    {
      id: 1,
      name: "High Yield Bonds",
      description: "Government and corporate bonds with competitive returns",
      minimumInvestment: "50000",
      maximumInvestment: "2000000",
      expectedReturn: "12.5",
      investmentTerm: "24",
      riskLevel: "Medium",
      category: "Bonds",
      isActive: true,
      totalInvestments: "8500000",
      investorCount: 45,
      averageReturn: "12.8",
    },
    {
      id: 2,
      name: "Real Estate Portfolio",
      description: "Diversified real estate investment opportunities",
      minimumInvestment: "100000",
      maximumInvestment: "5000000",
      expectedReturn: "18.0",
      investmentTerm: "36",
      riskLevel: "High",
      category: "Real Estate",
      isActive: true,
      totalInvestments: "15250000",
      investorCount: 28,
      averageReturn: "19.2",
    },
    {
      id: 3,
      name: "Fixed Deposit Plus",
      description: "Secure fixed deposit with guaranteed returns",
      minimumInvestment: "10000",
      maximumInvestment: "1000000",
      expectedReturn: "8.5",
      investmentTerm: "12",
      riskLevel: "Low",
      category: "Fixed Deposit",
      isActive: true,
      totalInvestments: "6750000",
      investorCount: 89,
      averageReturn: "8.7",
    },
  ];

  const investorAccounts = [
    {
      id: 1,
      accountNumber: "INV-001-2024",
      productName: "High Yield Bonds",
      investorName: "James Mwila",
      currentValue: "125000",
      initialInvestment: "100000",
      expectedReturn: "12.5",
      status: "Active",
      maturityDate: "2026-06-15",
      openedDate: "2024-06-15",
      returnsEarned: "8750",
      riskLevel: "Medium",
    },
    {
      id: 2,
      accountNumber: "INV-002-2024",
      productName: "Real Estate Portfolio",
      investorName: "Susan Phiri",
      currentValue: "285000",
      initialInvestment: "250000",
      expectedReturn: "18.0",
      status: "Active",
      maturityDate: "2027-03-20",
      openedDate: "2024-03-20",
      returnsEarned: "35000",
      riskLevel: "High",
    },
    {
      id: 3,
      accountNumber: "INV-003-2024",
      productName: "Fixed Deposit Plus",
      investorName: "Robert Banda",
      currentValue: "52500",
      initialInvestment: "50000",
      expectedReturn: "8.5",
      status: "Active",
      maturityDate: "2025-12-10",
      openedDate: "2024-12-10",
      returnsEarned: "2500",
      riskLevel: "Low",
    },
  ];

  const loanInvestments = [
    {
      id: 1,
      loanNumber: "LN-001-2024",
      borrowerName: "John Musonda",
      investorName: "James Mwila",
      loanAmount: "150000",
      investmentAmount: "75000",
      expectedReturn: "15.0",
      currentReturn: "3750",
      maturityDate: "2025-06-15",
      status: "Active",
      riskAssessment: "Medium",
      loanPurpose: "Business Expansion",
    },
    {
      id: 2,
      loanNumber: "LN-002-2024",
      borrowerName: "Mary Banda",
      investorName: "Susan Phiri",
      loanAmount: "300000",
      investmentAmount: "150000",
      expectedReturn: "18.0",
      currentReturn: "9000",
      maturityDate: "2025-12-20",
      status: "Active",
      riskAssessment: "High",
      loanPurpose: "Real Estate Purchase",
    },
  ];

  const investors = [
    { id: 1, firstName: "James", lastName: "Mwila", email: "james@example.com" },
    { id: 2, firstName: "Susan", lastName: "Phiri", email: "susan@example.com" },
    { id: 3, firstName: "Robert", lastName: "Banda", email: "robert@example.com" },
  ];

  const loans = [
    { id: 1, loanNumber: "LN-001-2024", borrower: "John Musonda", amount: "150000" },
    { id: 2, loanNumber: "LN-002-2024", borrower: "Mary Banda", amount: "300000" },
    { id: 3, loanNumber: "LN-003-2024", borrower: "Peter Zulu", amount: "75000" },
  ];

  const branches = [
    { id: 1, name: "Main Branch - Lusaka" },
    { id: 2, name: "Kitwe Branch" },
    { id: 3, name: "Ndola Branch" },
  ];

  // Forms
  const productForm = useForm<z.infer<typeof investorProductSchema>>({
    resolver: zodResolver(investorProductSchema),
    defaultValues: {
      name: "",
      description: "",
      minimumInvestment: "",
      maximumInvestment: "",
      expectedReturn: "",
      investmentTerm: "",
      riskLevel: "Medium",
      category: "Fixed Deposit",
      autoReinvestment: false,
      earlyExitPenalty: "",
      managementFee: "",
      performanceFee: "",
    },
  });

  const accountForm = useForm<z.infer<typeof investorAccountSchema>>({
    resolver: zodResolver(investorAccountSchema),
    defaultValues: {
      productId: "",
      investorId: "",
      branchId: "",
      initialInvestment: "",
      status: "Active",
      expectedMaturityDate: "",
    },
  });

  const loanInvestmentForm = useForm<z.infer<typeof loanInvestmentSchema>>({
    resolver: zodResolver(loanInvestmentSchema),
    defaultValues: {
      loanId: "",
      investorId: "",
      investmentAmount: "",
      expectedReturn: "",
      maturityDate: "",
      riskAssessment: "Medium",
      autoReinvest: false,
    },
  });

  // Filter accounts
  const filteredAccounts = investorAccounts.filter((account: any) => {
    const matchesSearch = account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.investorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || account.status === statusFilter;
    const matchesProduct = productFilter === "" || account.productName === productFilter;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Calculate statistics
  const calculateStats = () => {
    const totalInvestments = investorAccounts.reduce((sum: number, acc: any) => 
      sum + parseFloat(acc.currentValue || "0"), 0);
    const totalInitialInvestments = investorAccounts.reduce((sum: number, acc: any) => 
      sum + parseFloat(acc.initialInvestment || "0"), 0);
    const totalReturns = investorAccounts.reduce((sum: number, acc: any) => 
      sum + parseFloat(acc.returnsEarned || "0"), 0);
    const avgReturn = totalInitialInvestments > 0 ? (totalReturns / totalInitialInvestments) * 100 : 0;
    
    return {
      totalAccounts: investorAccounts.length,
      totalInvestments,
      totalReturns,
      avgReturn,
      activeAccounts: investorAccounts.filter((acc: any) => acc.status === "Active").length,
      totalProducts: investorProducts.length,
      totalLoanInvestments: loanInvestments.length,
    };
  };

  const stats = calculateStats();

  const onProductSubmit = (data: z.infer<typeof investorProductSchema>) => {
    toast({ title: "Success", description: "Investment product created successfully" });
    setIsProductDialogOpen(false);
    productForm.reset();
  };

  const onAccountSubmit = (data: z.infer<typeof investorAccountSchema>) => {
    toast({ title: "Success", description: "Investor account created successfully" });
    setIsAccountDialogOpen(false);
    accountForm.reset();
  };

  const onLoanInvestmentSubmit = (data: z.infer<typeof loanInvestmentSchema>) => {
    toast({ title: "Success", description: "Loan investment created successfully" });
    setIsLoanInvestmentDialogOpen(false);
    loanInvestmentForm.reset();
  };

  const handleWhitelabelSetup = () => {
    toast({ title: "Success", description: "Whitelabel investor portal setup initiated" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Investor Management</h2>
          <p className="text-gray-600">Manage investment products, loan investments, and investor relations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleWhitelabelSetup}>
            <Globe className="h-4 w-4 mr-2" />
            Whitelabel Portal
          </Button>
          <Dialog open={isLoanInvestmentDialogOpen} onOpenChange={setIsLoanInvestmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Handshake className="h-4 w-4 mr-2" />
                Loan Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Loan Investment</DialogTitle>
                <DialogDescription>Connect investors with specific loan opportunities</DialogDescription>
              </DialogHeader>
              <Form {...loanInvestmentForm}>
                <form onSubmit={loanInvestmentForm.handleSubmit(onLoanInvestmentSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={loanInvestmentForm.control}
                      name="loanId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                      control={loanInvestmentForm.control}
                      name="investorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select investor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {investors.map((investor: any) => (
                                <SelectItem key={investor.id} value={investor.id.toString()}>
                                  {investor.firstName} {investor.lastName}
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
                      control={loanInvestmentForm.control}
                      name="investmentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Amount (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loanInvestmentForm.control}
                      name="expectedReturn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Return (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="15.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={loanInvestmentForm.control}
                      name="maturityDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maturity Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loanInvestmentForm.control}
                      name="riskAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Assessment</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low Risk</SelectItem>
                              <SelectItem value="Medium">Medium Risk</SelectItem>
                              <SelectItem value="High">High Risk</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={loanInvestmentForm.control}
                    name="autoReinvest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Auto Reinvestment</FormLabel>
                          <FormDescription>Automatically reinvest returns into similar loans</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Create Loan Investment
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
                <DialogTitle>Create Investment Product</DialogTitle>
                <DialogDescription>Configure a new investment product with returns and risk assessment</DialogDescription>
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
                            <Input placeholder="e.g., High Yield Bonds" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                              <SelectItem value="Bonds">Bonds</SelectItem>
                              <SelectItem value="Equity">Equity</SelectItem>
                              <SelectItem value="Mixed Portfolio">Mixed Portfolio</SelectItem>
                              <SelectItem value="Real Estate">Real Estate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="minimumInvestment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Investment (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="10000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="maximumInvestment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Investment (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={productForm.control}
                      name="expectedReturn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Return (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="12.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="investmentTerm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Term (months)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="24" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="riskLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low Risk</SelectItem>
                              <SelectItem value="Medium">Medium Risk</SelectItem>
                              <SelectItem value="High">High Risk</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={productForm.control}
                      name="managementFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Management Fee (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="2.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="performanceFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performance Fee (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="earlyExitPenalty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Early Exit Penalty (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="5.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={productForm.control}
                    name="autoReinvestment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Auto Reinvestment</FormLabel>
                          <FormDescription>Automatically reinvest returns at maturity</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Product description and investment strategy..." {...field} />
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
                New Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Investment Account</DialogTitle>
                <DialogDescription>Open a new investment account for an investor</DialogDescription>
              </DialogHeader>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {investorProducts.map((product: any) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} ({product.expectedReturn}%)
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
                      name="investorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select investor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {investors.map((investor: any) => (
                                <SelectItem key={investor.id} value={investor.id.toString()}>
                                  {investor.firstName} {investor.lastName}
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
                      name="initialInvestment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Investment (ZMW)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="50000.00" {...field} />
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
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Create Investment Account
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.totalInvestments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ZMW {stats.totalReturns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Earned returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReturn.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Portfolio average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">Investment accounts</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Investments</CardTitle>
            <Handshake className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoanInvestments}</div>
            <p className="text-xs text-muted-foreground">Direct loan funding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">All investments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="loan-investments">Loan Investments</TabsTrigger>
          <TabsTrigger value="whitelabel">Whitelabel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Investment Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Performance Analytics</h3>
                  <p className="text-gray-500">Investment performance charts will display here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investorProducts.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          product.riskLevel === "Low" ? "bg-green-500" :
                          product.riskLevel === "Medium" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category} • {product.riskLevel} Risk</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{product.averageReturn}%</p>
                        <p className="text-sm text-gray-500">{product.investorCount} investors</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Accounts</CardTitle>
              <CardDescription>Manage investor accounts and track investment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by account number or investor name..."
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Matured">Matured</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {investorProducts.map((product: any) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Investment Accounts List */}
              <div className="space-y-4">
                {filteredAccounts.map((account: any) => (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{account.accountNumber}</h4>
                            <Badge variant={account.status === "Active" ? "default" : 
                              account.status === "Pending" ? "secondary" : "destructive"}>
                              {account.status}
                            </Badge>
                            <Badge variant="outline">{account.productName}</Badge>
                            <Badge variant={account.riskLevel === "Low" ? "secondary" : 
                              account.riskLevel === "Medium" ? "default" : "destructive"}>
                              {account.riskLevel} Risk
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Investor</p>
                              <p className="font-medium">{account.investorName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-medium">ZMW {parseFloat(account.currentValue).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Expected Return</p>
                              <p className="font-medium">{account.expectedReturn}% p.a.</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Returns Earned</p>
                              <p className="font-medium text-green-600">ZMW {parseFloat(account.returnsEarned).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Opened: {account.openedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Maturity: {account.maturityDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedInvestment(account)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-8">
                    <Handshake className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No investments found</h3>
                    <p className="text-gray-500">No investment accounts match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Products</CardTitle>
              <CardDescription>Configure investment products with risk assessment and return targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {investorProducts.map((product: any) => (
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
                          <span className="text-sm text-muted-foreground">Category</span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Expected Return</span>
                          <span className="font-medium text-green-600">{product.expectedReturn}% p.a.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Risk Level</span>
                          <Badge variant={product.riskLevel === "Low" ? "secondary" : 
                            product.riskLevel === "Medium" ? "default" : "destructive"}>
                            {product.riskLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Min Investment</span>
                          <span className="font-medium">ZMW {parseFloat(product.minimumInvestment).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Investment Term</span>
                          <span className="font-medium">{product.investmentTerm} months</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Investments</span>
                            <span className="font-medium">ZMW {parseFloat(product.totalInvestments).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Investors</span>
                            <span className="font-medium">{product.investorCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg Return</span>
                            <span className="font-medium text-green-600">{product.averageReturn}%</span>
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

        <TabsContent value="loan-investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Investments</CardTitle>
              <CardDescription>Direct investor funding for specific loan opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanInvestments.map((investment: any) => (
                  <Card key={investment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{investment.loanNumber}</h4>
                            <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                              {investment.status}
                            </Badge>
                            <Badge variant={investment.riskAssessment === "Low" ? "secondary" : 
                              investment.riskAssessment === "Medium" ? "default" : "destructive"}>
                              {investment.riskAssessment} Risk
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Borrower</p>
                              <p className="font-medium">{investment.borrowerName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Investor</p>
                              <p className="font-medium">{investment.investorName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Investment Amount</p>
                              <p className="font-medium">ZMW {parseFloat(investment.investmentAmount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Return</p>
                              <p className="font-medium text-green-600">ZMW {parseFloat(investment.currentReturn).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Purpose: {investment.loanPurpose}
                            </span>
                            <span className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              Expected: {investment.expectedReturn}% p.a.
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Maturity: {investment.maturityDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
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

        <TabsContent value="whitelabel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Whitelabel Investor Portal
              </CardTitle>
              <CardDescription>Custom-branded investor portal and API integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Portal Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Portal Domain</Label>
                      <Input placeholder="investors.yourcompany.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" accept="image/*" />
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Brand Colors</Label>
                      <div className="flex gap-2">
                        <Input type="color" value="#3b82f6" className="w-16" />
                        <Input type="color" value="#10b981" className="w-16" />
                      </div>
                    </div>
                    <Button className="w-full">
                      Update Portal Branding
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      API Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>API Base URL</Label>
                      <Input value="https://api.loansphere.world/v1" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex items-center gap-2">
                        <Input type="password" value="••••••••••••••••" readOnly />
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input placeholder="https://yourapp.com/webhooks/loansphere" />
                    </div>
                    <Button className="w-full">
                      Save API Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Portal Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Investment Dashboard</span>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Performance Analytics</span>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Document Management</span>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mobile App Access</span>
                        <Checkbox />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Advanced Reporting</span>
                        <Checkbox />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">White-glove Support</span>
                        <Checkbox />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Portal Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Investors</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Logins</span>
                        <span className="font-medium">2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Portal Uptime</span>
                        <span className="font-medium text-green-600">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Session</span>
                        <span className="font-medium">12m 34s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Support Tickets</span>
                        <span className="font-medium">3 open</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};