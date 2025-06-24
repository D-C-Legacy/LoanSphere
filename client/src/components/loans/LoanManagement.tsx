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

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Filter, FileText, Calculator, Send, DollarSign, Users, Clock, AlertTriangle, ArrowDown, Edit, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Loan {
  id: number;
  loanNumber: string;
  borrowerName: string;
  principalAmount: string;
  interestRate: number;
  termMonths: number;
  status: "processing" | "open" | "default" | "not_taken_up" | "denied" | "closed" | "restructured";
  releasedDate?: string;
  disbursedDate?: string;
  maturityDate?: string;
  monthlyPayment: string;
  balanceAmount: string;
  interestType: "flat" | "reducing_balance_equal_installments" | "reducing_balance_equal_principal" | "interest_only" | "compound";
  repaymentCycle: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  loanOfficer?: string;
  collateralRequired: boolean;
}

interface LoanProduct {
  id: number;
  title: string;
  interestRate: number;
  minAmount: string;
  maxAmount: string;
  minTerm: number;
  maxTerm: number;
  interestType: string;
  repaymentCycle: string;
  isActive: boolean;
}

interface Borrower {
  id: number;
  firstName: string;
  lastName: string;
  uniqueNumber: string;
  email?: string;
  mobile?: string;
  status: string;
}

export default function LoanManagement() {
  const [activeTab, setActiveTab] = useState("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showLoanCalculator, setShowLoanCalculator] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch loans
  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ["/api/loans"],
    enabled: activeTab === "applications" || activeTab === "servicing",
  });

  // Fetch loan products
  const { data: loanProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/loan-products"],
    enabled: activeTab === "products",
  });

  // Fetch borrowers for loan creation
  const { data: borrowers = [], isLoading: borrowersLoading } = useQuery({
    queryKey: ["/api/borrowers"],
    enabled: showAddLoan,
  });

  // Create loan mutation
  const createLoanMutation = useMutation({
    mutationFn: async (loanData: any) => {
      return await apiRequest("/api/loans", {
        method: "POST",
        body: JSON.stringify(loanData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setShowAddLoan(false);
      toast({
        title: "Success",
        description: "Loan created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create loan",
        variant: "destructive",
      });
    },
  });

  // Create loan product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest("/api/loan-products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-products"] });
      setShowAddProduct(false);
      toast({
        title: "Success",
        description: "Loan product created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create loan product",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      processing: "bg-yellow-100 text-yellow-800",
      open: "bg-green-100 text-green-800",
      default: "bg-red-100 text-red-800",
      denied: "bg-gray-100 text-gray-800",
      closed: "bg-blue-100 text-blue-800",
      restructured: "bg-purple-100 text-purple-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const filteredLoans = loans.filter((loan: Loan) => {
    const matchesSearch = searchTerm === "" || 
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const LoanCalculator = () => {
    const [principal, setPrincipal] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [termMonths, setTermMonths] = useState("");
    const [interestType, setInterestType] = useState("reducing_balance_equal_installments");
    const [calculation, setCalculation] = useState<any>(null);

    const calculateLoan = () => {
      const p = parseFloat(principal);
      const r = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
      const n = parseInt(termMonths);

      if (!p || !r || !n) return;

      let monthlyPayment = 0;
      let totalAmount = 0;
      let totalInterest = 0;

      switch (interestType) {
        case "flat":
          totalInterest = (p * parseFloat(interestRate) * n) / (100 * 12);
          totalAmount = p + totalInterest;
          monthlyPayment = totalAmount / n;
          break;
        case "reducing_balance_equal_installments":
          monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          totalAmount = monthlyPayment * n;
          totalInterest = totalAmount - p;
          break;
        case "interest_only":
          monthlyPayment = p * r;
          totalInterest = monthlyPayment * n;
          totalAmount = p + totalInterest;
          break;
        default:
          monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          totalAmount = monthlyPayment * n;
          totalInterest = totalAmount - p;
      }

      setCalculation({
        monthlyPayment: monthlyPayment.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
      });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="principal">Principal Amount (ZMW)</Label>
            <Input
              id="principal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="25000"
            />
          </div>
          <div>
            <Label htmlFor="interest">Interest Rate (%)</Label>
            <Input
              id="interest"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="12"
            />
          </div>
          <div>
            <Label htmlFor="term">Term (Months)</Label>
            <Input
              id="term"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              placeholder="24"
            />
          </div>
          <div>
            <Label htmlFor="type">Interest Type</Label>
            <Select value={interestType} onValueChange={setInterestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat Interest</SelectItem>
                <SelectItem value="reducing_balance_equal_installments">Reducing Balance - Equal Installments</SelectItem>
                <SelectItem value="reducing_balance_equal_principal">Reducing Balance - Equal Principal</SelectItem>
                <SelectItem value="interest_only">Interest Only</SelectItem>
                <SelectItem value="compound">Compound Interest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={calculateLoan} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate
        </Button>

        {calculation && (
          <Card>
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Monthly Payment:</span>
                <span className="font-semibold">ZMW {calculation.monthlyPayment}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">ZMW {calculation.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-semibold">ZMW {calculation.totalInterest}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const AddLoanForm = () => {
    const [formData, setFormData] = useState({
      borrowerId: "",
      loanProductId: "",
      principalAmount: "",
      interestRate: "",
      termMonths: "",
      interestType: "reducing_balance_equal_installments",
      repaymentCycle: "monthly",
      firstRepaymentDate: "",
      disbursementMethod: "cash",
      collateralRequired: false,
      loanOfficerId: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createLoanMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="borrower">Borrower</Label>
            <Select value={formData.borrowerId} onValueChange={(value) => setFormData({...formData, borrowerId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select borrower" />
              </SelectTrigger>
              <SelectContent>
                {borrowers.map((borrower: Borrower) => (
                  <SelectItem key={borrower.id} value={borrower.id.toString()}>
                    {borrower.firstName} {borrower.lastName} ({borrower.uniqueNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="product">Loan Product</Label>
            <Select value={formData.loanProductId} onValueChange={(value) => setFormData({...formData, loanProductId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan product" />
              </SelectTrigger>
              <SelectContent>
                {loanProducts.map((product: LoanProduct) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Principal Amount (ZMW)</Label>
            <Input
              id="amount"
              value={formData.principalAmount}
              onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
              placeholder="25000"
              required
            />
          </div>
          <div>
            <Label htmlFor="rate">Interest Rate (%)</Label>
            <Input
              id="rate"
              value={formData.interestRate}
              onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
              placeholder="12"
              required
            />
          </div>
          <div>
            <Label htmlFor="term">Term (Months)</Label>
            <Input
              id="term"
              value={formData.termMonths}
              onChange={(e) => setFormData({...formData, termMonths: e.target.value})}
              placeholder="24"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Interest Type</Label>
            <Select value={formData.interestType} onValueChange={(value) => setFormData({...formData, interestType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat Interest</SelectItem>
                <SelectItem value="reducing_balance_equal_installments">Reducing Balance - Equal Installments</SelectItem>
                <SelectItem value="reducing_balance_equal_principal">Reducing Balance - Equal Principal</SelectItem>
                <SelectItem value="interest_only">Interest Only</SelectItem>
                <SelectItem value="compound">Compound Interest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cycle">Repayment Cycle</Label>
            <Select value={formData.repaymentCycle} onValueChange={(value) => setFormData({...formData, repaymentCycle: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="disbursement">Disbursement Method</Label>
            <Select value={formData.disbursementMethod} onValueChange={(value) => setFormData({...formData, disbursementMethod: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            id="collateral"
            type="button"
            variant={formData.collateralRequired ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({...formData, collateralRequired: !formData.collateralRequired})}
            className={formData.collateralRequired ? "bg-loansphere-green hover:bg-loansphere-green/90" : ""}
          >
            {formData.collateralRequired ? "Required" : "Optional"}
          </Button>
          <Label htmlFor="collateral">Collateral Required</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowAddLoan(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createLoanMutation.isPending}>
            {createLoanMutation.isPending ? "Creating..." : "Create Loan"}
          </Button>
        </div>
      </form>
    );
  };

  const AddProductForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      loanType: "",
      minAmount: "",
      maxAmount: "",
      interestRate: "",
      interestType: "reducing_balance_equal_installments",
      minTerm: "",
      maxTerm: "",
      repaymentCycle: "monthly",
      customRepaymentCycle: "",
      gracePeriodDays: "0",
      latePenaltyType: "percentage",
      latePenaltyRate: "0",
      latePenaltyFrequency: "monthly",
      maturityPenaltyType: "percentage", 
      maturityPenaltyRate: "0",
      loanNumberFormat: "LN-{YYYY}-{MM}-{####}",
      disbursementMethod: "cash",
      requiresGuarantor: false,
      maxGuarantors: "1",
      requiresCollateral: false,
      isActive: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createProductMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Personal Loan"
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Loan product description"
            />
          </div>
          <div>
            <Label htmlFor="loanType">Loan Type</Label>
            <Input
              id="loanType"
              value={formData.loanType}
              onChange={(e) => setFormData({...formData, loanType: e.target.value})}
              placeholder="personal"
              required
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              value={formData.interestRate}
              onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
              placeholder="12"
              required
            />
          </div>
          <div>
            <Label htmlFor="minAmount">Minimum Amount (ZMW)</Label>
            <Input
              id="minAmount"
              value={formData.minAmount}
              onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
              placeholder="5000"
              required
            />
          </div>
          <div>
            <Label htmlFor="maxAmount">Maximum Amount (ZMW)</Label>
            <Input
              id="maxAmount"
              value={formData.maxAmount}
              onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
              placeholder="100000"
              required
            />
          </div>
          <div>
            <Label htmlFor="minTerm">Minimum Term (Months)</Label>
            <Input
              id="minTerm"
              value={formData.minTerm}
              onChange={(e) => setFormData({...formData, minTerm: e.target.value})}
              placeholder="6"
              required
            />
          </div>
          <div>
            <Label htmlFor="maxTerm">Maximum Term (Months)</Label>
            <Input
              id="maxTerm"
              value={formData.maxTerm}
              onChange={(e) => setFormData({...formData, maxTerm: e.target.value})}
              placeholder="60"
              required
            />
          </div>
          <div>
            <Label htmlFor="interestType">Interest Type</Label>
            <Select value={formData.interestType} onValueChange={(value) => setFormData({...formData, interestType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat Interest</SelectItem>
                <SelectItem value="reducing_balance_equal_installments">Reducing Balance - Equal Installments</SelectItem>
                <SelectItem value="reducing_balance_equal_principal">Reducing Balance - Equal Principal</SelectItem>
                <SelectItem value="interest_only">Interest Only</SelectItem>
                <SelectItem value="compound">Compound Interest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="repaymentCycle">Repayment Cycle</Label>
            <Select value={formData.repaymentCycle} onValueChange={(value) => setFormData({...formData, repaymentCycle: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
            <Input
              id="gracePeriod"
              type="number"
              value={formData.gracePeriodDays}
              onChange={(e) => setFormData({...formData, gracePeriodDays: e.target.value})}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="disbursementMethod">Disbursement Method</Label>
            <Select value={formData.disbursementMethod} onValueChange={(value) => setFormData({...formData, disbursementMethod: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhanced Penalty Fee Section */}
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Default Penalty Fees</h3>
          
          {/* Late Payment Penalty */}
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-700">Late Payment Penalty</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="latePenaltyType">Penalty Type</Label>
                <Select value={formData.latePenaltyType} onValueChange={(value) => setFormData({...formData, latePenaltyType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (ZMW)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="latePenaltyRate">
                  {formData.latePenaltyType === "fixed" ? "Amount (ZMW)" : "Rate (%)"}
                </Label>
                <Input
                  id="latePenaltyRate"
                  type="number"
                  step="0.01"
                  value={formData.latePenaltyRate}
                  onChange={(e) => setFormData({...formData, latePenaltyRate: e.target.value})}
                  placeholder={formData.latePenaltyType === "fixed" ? "50" : "2"}
                />
              </div>
              <div>
                <Label htmlFor="latePenaltyFrequency">Frequency</Label>
                <Select value={formData.latePenaltyFrequency} onValueChange={(value) => setFormData({...formData, latePenaltyFrequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Maturity Penalty */}
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-700">Maturity Penalty (Overdue beyond term)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maturityPenaltyType">Penalty Type</Label>
                <Select value={formData.maturityPenaltyType} onValueChange={(value) => setFormData({...formData, maturityPenaltyType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (ZMW)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maturityPenaltyRate">
                  {formData.maturityPenaltyType === "fixed" ? "Amount (ZMW)" : "Rate (%)"}
                </Label>
                <Input
                  id="maturityPenaltyRate"
                  type="number"
                  step="0.01"
                  value={formData.maturityPenaltyRate}
                  onChange={(e) => setFormData({...formData, maturityPenaltyRate: e.target.value})}
                  placeholder={formData.maturityPenaltyType === "fixed" ? "100" : "5"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loanNumberFormat">Loan Number Format</Label>
            <Input
              id="loanNumberFormat"
              value={formData.loanNumberFormat}
              onChange={(e) => setFormData({...formData, loanNumberFormat: e.target.value})}
              placeholder="LN-{YYYY}-{MM}-{####}"
            />
          </div>
          <div>
            <Label htmlFor="maxGuarantors">Max Guarantors (if required)</Label>
            <Input
              id="maxGuarantors"
              type="number"
              value={formData.maxGuarantors}
              onChange={(e) => setFormData({...formData, maxGuarantors: e.target.value})}
              placeholder="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              id="guarantor"
              type="button"
              variant={formData.requiresGuarantor ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData({...formData, requiresGuarantor: !formData.requiresGuarantor})}
              className={formData.requiresGuarantor ? "bg-loansphere-green hover:bg-loansphere-green/90" : ""}
            >
              {formData.requiresGuarantor ? "Required" : "Optional"}
            </Button>
            <Label htmlFor="guarantor">Requires Guarantor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              id="collateral"
              type="button"
              variant={formData.requiresCollateral ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData({...formData, requiresCollateral: !formData.requiresCollateral})}
              className={formData.requiresCollateral ? "bg-loansphere-green hover:bg-loansphere-green/90" : ""}
            >
              {formData.requiresCollateral ? "Required" : "Optional"}
            </Button>
            <Label htmlFor="collateral">Requires Collateral</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createProductMutation.isPending}>
            {createProductMutation.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Loan Management</h1>
          <p className="text-gray-600">Manage loan applications, products, origination, and servicing</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showLoanCalculator} onOpenChange={setShowLoanCalculator}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Loan Calculator</DialogTitle>
                <DialogDescription>
                  Calculate loan payments and interest
                </DialogDescription>
              </DialogHeader>
              <LoanCalculator />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="products">Loan Products</TabsTrigger>
          <TabsTrigger value="origination">Origination</TabsTrigger>
          <TabsTrigger value="servicing">Servicing</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddLoan} onOpenChange={setShowAddLoan}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Loan</DialogTitle>
                  <DialogDescription>
                    Add a new loan with custom terms and conditions
                  </DialogDescription>
                </DialogHeader>
                <AddLoanForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {loansLoading ? (
              <div className="text-center py-8">Loading loans...</div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-8">No loans found</div>
            ) : (
              filteredLoans.map((loan: Loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{loan.loanNumber}</h3>
                          <Badge className={getStatusBadge(loan.status)}>
                            {loan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Borrower: {loan.borrowerName}
                        </p>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Principal:</span>
                            <p className="font-medium">{loan.principalAmount}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Interest:</span>
                            <p className="font-medium">{loan.interestRate}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Term:</span>
                            <p className="font-medium">{loan.termMonths} months</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Monthly Payment:</span>
                            <p className="font-medium">{loan.monthlyPayment}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Statement
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Loan Products</h2>
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Loan Product</DialogTitle>
                  <DialogDescription>
                    Define loan product terms and conditions
                  </DialogDescription>
                </DialogHeader>
                <AddProductForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsLoading ? (
              <div className="col-span-full text-center py-8">Loading products...</div>
            ) : loanProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">No loan products found</div>
            ) : (
              loanProducts.map((product: LoanProduct) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Interest Rate:</span>
                      <span className="font-medium">{product.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Range:</span>
                      <span className="font-medium">{product.minAmount} - {product.maxAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Term:</span>
                      <span className="font-medium">{product.minTerm} - {product.maxTerm} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Repayment:</span>
                      <span className="font-medium capitalize">{product.repaymentCycle}</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        Edit Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="origination" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  -1 from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  ZMW 125,000 total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  15% rejection rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loan Application Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">John Mwamba - Personal Loan</p>
                      <p className="text-sm text-gray-600">ZMW 50,000 • 24 months • Pending review</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Mary Banda - Business Loan</p>
                      <p className="text-sm text-gray-600">ZMW 120,000 • 36 months • Under verification</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Documents</Button>
                    <Button size="sm">Verify</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Peter Chanda - Agriculture Loan</p>
                      <p className="text-sm text-gray-600">ZMW 75,000 • 18 months • Ready for disbursement</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Schedule</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Disburse</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" className="w-full mr-2">
                  <FileText className="h-4 w-4 mr-2" />
                  Bulk Import Applications
                </Button>
                <Button variant="outline" className="w-full ml-2">
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Export Pipeline Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servicing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  ZMW 2.4M outstanding
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  14.7% of portfolio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ZMW 45K</div>
                <p className="text-xs text-muted-foreground">
                  78% collection rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Early Settlements</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  +3 this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                  <div>
                    <p className="font-medium text-sm">John Mwamba</p>
                    <p className="text-xs text-gray-600">Loan #LN-2025-01-001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">ZMW 2,500</p>
                    <p className="text-xs text-gray-600">Today 14:30</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <div>
                    <p className="font-medium text-sm">Mary Banda</p>
                    <p className="text-xs text-gray-600">Loan #LN-2025-01-002</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">ZMW 1,200</p>
                    <p className="text-xs text-gray-600">Today 11:15</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Peter Chanda</p>
                    <p className="text-xs text-gray-600">Loan #LN-2025-01-003</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">ZMW 800</p>
                    <p className="text-xs text-gray-600">Yesterday 16:45</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overdue Loans Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                  <div>
                    <p className="font-medium text-sm text-red-800">Grace Mutale</p>
                    <p className="text-xs text-red-600">5 days overdue • ZMW 3,200</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      SMS
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Call
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                  <div>
                    <p className="font-medium text-sm text-orange-800">James Phiri</p>
                    <p className="text-xs text-orange-600">2 days overdue • ZMW 1,800</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      SMS
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Call
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div>
                    <p className="font-medium text-sm text-yellow-800">Susan Tembo</p>
                    <p className="text-xs text-yellow-600">Due today • ZMW 2,100</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      Remind
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      Bulk SMS
                    </Button>
                    <Button variant="outline" className="w-full text-xs">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      Export List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}