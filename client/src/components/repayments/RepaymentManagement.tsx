import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Receipt,
  BarChart3,
  Settings
} from "lucide-react";

interface Repayment {
  id: number;
  loanId: number;
  loanNumber: string;
  borrowerName: string;
  amount: string;
  principalAmount: string;
  interestAmount: string;
  feesAmount: string;
  penaltyAmount: string;
  paymentDate: string;
  collectionDate: string;
  paymentMethod: string;
  collector: string;
  status: "pending" | "approved" | "rejected";
  receiptNumber: string;
  notes: string;
  customFields: Record<string, any>;
  createdAt: string;
}

export default function RepaymentManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [bulkCount, setBulkCount] = useState(30);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch repayments data
  const { data: repayments = [], isLoading: loadingRepayments } = useQuery({
    queryKey: ["/api/repayments"],
  });

  // Fetch loans for selection
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ["/api/loans"],
  });

  // Fetch loan officers/collectors
  const { data: collectors = [], isLoading: loadingCollectors } = useQuery({
    queryKey: ["/api/loan-officers"],
  });

  // Add single repayment mutation
  const addRepaymentMutation = useMutation({
    mutationFn: async (repaymentData: any) => {
      return await apiRequest("/api/repayments", "POST", repaymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repayments"] });
      toast({ title: "Success", description: "Repayment added successfully" });
      setShowAddDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add repayment",
        variant: "destructive" 
      });
    },
  });

  // Bulk repayment mutation
  const bulkRepaymentMutation = useMutation({
    mutationFn: async (repaymentData: any) => {
      return await apiRequest("/api/repayments/bulk", "POST", repaymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repayments"] });
      toast({ title: "Success", description: "Bulk repayments added successfully" });
      setShowBulkDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add bulk repayments",
        variant: "destructive" 
      });
    },
  });

  // CSV upload mutation
  const csvUploadMutation = useMutation({
    mutationFn: async (csvData: any) => {
      return await apiRequest("/api/repayments/csv-upload", "POST", csvData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repayments"] });
      toast({ title: "Success", description: "CSV repayments imported successfully" });
      setShowCsvDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to import CSV repayments",
        variant: "destructive" 
      });
    },
  });

  // Approve repayment mutation
  const approveRepaymentMutation = useMutation({
    mutationFn: async (repaymentId: number) => {
      return await apiRequest(`/api/repayments/${repaymentId}/approve`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repayments"] });
      toast({ title: "Success", description: "Repayment approved successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to approve repayment",
        variant: "destructive" 
      });
    },
  });

  const handleExportRepayments = () => {
    // Export repayments to CSV/Excel
    const csvData = repayments.map((repayment: Repayment) => ({
      'Loan Number': repayment.loanNumber,
      'Borrower Name': repayment.borrowerName,
      'Total Amount': repayment.amount,
      'Principal': repayment.principalAmount,
      'Interest': repayment.interestAmount,
      'Fees': repayment.feesAmount,
      'Penalty': repayment.penaltyAmount,
      'Payment Date': repayment.paymentDate,
      'Collection Date': repayment.collectionDate,
      'Payment Method': repayment.paymentMethod,
      'Collector': repayment.collector,
      'Status': repayment.status,
      'Receipt Number': repayment.receiptNumber,
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repayments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReceipt = (repaymentId: number) => {
    // Generate and download receipt
    window.open(`/api/repayments/${repaymentId}/receipt`, '_blank');
  };

  const filteredRepayments = repayments.filter((repayment: Repayment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      repayment.loanNumber?.toLowerCase().includes(query) ||
      repayment.borrowerName?.toLowerCase().includes(query) ||
      repayment.paymentMethod?.toLowerCase().includes(query) ||
      repayment.collector?.toLowerCase().includes(query) ||
      repayment.receiptNumber?.toLowerCase().includes(query)
    );
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Repayments</p>
                <p className="text-2xl font-bold text-gray-900">{repayments.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">
                  {repayments.filter((r: Repayment) => r.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {repayments.filter((r: Repayment) => 
                    r.status === "approved" && 
                    new Date(r.paymentDate).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  K{repayments.reduce((sum: number, r: Repayment) => sum + parseFloat(r.amount || '0'), 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-loansphere-green hover:bg-loansphere-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Single Repayment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Repayment</DialogTitle>
            </DialogHeader>
            <AddRepaymentForm 
              loans={loans}
              collectors={collectors}
              onSubmit={(data) => addRepaymentMutation.mutate(data)}
              isLoading={addRepaymentMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Add {bulkCount} Repayments
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Bulk Repayments</DialogTitle>
            </DialogHeader>
            <BulkRepaymentForm 
              loans={loans}
              collectors={collectors}
              bulkCount={bulkCount}
              setBulkCount={setBulkCount}
              onSubmit={(data) => bulkRepaymentMutation.mutate(data)}
              isLoading={bulkRepaymentMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              CSV Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Repayments via CSV</DialogTitle>
            </DialogHeader>
            <CsvUploadForm 
              onSubmit={(data) => csvUploadMutation.mutate(data)}
              isLoading={csvUploadMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleExportRepayments}>
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by loan number, borrower name, collector, payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLoan} onValueChange={setSelectedLoan}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by loan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Loans</SelectItem>
            {loans.map((loan: any) => (
              <SelectItem key={loan.id} value={loan.id.toString()}>
                {loan.loanNumber} - {loan.borrowerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Repayments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Repayments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Number</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Collector</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRepayments ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading repayments...
                  </TableCell>
                </TableRow>
              ) : filteredRepayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No repayments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepayments.map((repayment: Repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell className="font-medium">{repayment.loanNumber}</TableCell>
                    <TableCell>{repayment.borrowerName}</TableCell>
                    <TableCell>K{parseFloat(repayment.amount || '0').toLocaleString()}</TableCell>
                    <TableCell>{new Date(repayment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{repayment.paymentMethod}</TableCell>
                    <TableCell>{repayment.collector}</TableCell>
                    <TableCell>
                      <Badge variant={
                        repayment.status === "approved" ? "default" :
                        repayment.status === "pending" ? "secondary" : "destructive"
                      }>
                        {repayment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {repayment.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => approveRepaymentMutation.mutate(repayment.id)}
                            disabled={approveRepaymentMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReceipt(repayment.id)}
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Repayment Management</h1>
          <p className="text-gray-600 mt-1">Process and track loan repayments with advanced features</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="analytics">
          <RepaymentAnalytics repayments={repayments} />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionManagement repayments={repayments} collectors={collectors} />
        </TabsContent>

        <TabsContent value="settings">
          <RepaymentSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual Repayment Form Component
function AddRepaymentForm({ loans, collectors, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    loanId: '',
    amount: '',
    principalAmount: '',
    interestAmount: '',
    feesAmount: '',
    penaltyAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    collectionDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    collector: '',
    notes: '',
    autoCalculate: true,
    customFields: {} as Record<string, any>,
  });

  const selectedLoan = loans.find((loan: any) => loan.id.toString() === formData.loanId);

  // Auto-fill amount and date based on selected loan
  React.useEffect(() => {
    if (selectedLoan && formData.autoCalculate) {
      // Calculate next payment amount based on loan schedule
      const nextPayment = selectedLoan.nextPaymentAmount || selectedLoan.monthlyPayment || '';
      const nextDate = selectedLoan.nextPaymentDate || new Date().toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        amount: nextPayment,
        paymentDate: nextDate,
        principalAmount: selectedLoan.nextPrincipalAmount || '',
        interestAmount: selectedLoan.nextInterestAmount || '',
        feesAmount: selectedLoan.nextFeesAmount || '0',
        penaltyAmount: selectedLoan.nextPenaltyAmount || '0',
      }));
    }
  }, [selectedLoan, formData.autoCalculate]);

  // Manual calculation when auto-calculate is disabled
  const handleAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, amount: value }));
    
    if (!formData.autoCalculate && selectedLoan) {
      // Manual allocation logic
      const totalAmount = parseFloat(value) || 0;
      const interestDue = parseFloat(selectedLoan.interestDue || '0');
      const feesDue = parseFloat(selectedLoan.feesDue || '0');
      const penaltyDue = parseFloat(selectedLoan.penaltyDue || '0');
      
      // Allocate in order: fees, penalty, interest, principal
      let remaining = totalAmount;
      const fees = Math.min(remaining, feesDue);
      remaining -= fees;
      
      const penalty = Math.min(remaining, penaltyDue);
      remaining -= penalty;
      
      const interest = Math.min(remaining, interestDue);
      remaining -= interest;
      
      const principal = remaining;
      
      setFormData(prev => ({
        ...prev,
        feesAmount: fees.toString(),
        penaltyAmount: penalty.toString(),
        interestAmount: interest.toString(),
        principalAmount: principal.toString(),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loanId">Select Loan *</Label>
          <Select value={formData.loanId} onValueChange={(value) => setFormData({...formData, loanId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Choose loan" />
            </SelectTrigger>
            <SelectContent>
              {loans.map((loan: any) => (
                <SelectItem key={loan.id} value={loan.id.toString()}>
                  {loan.loanNumber} - {loan.borrowerName} (Balance: K{loan.balanceAmount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="collector">Collector *</Label>
          <Select value={formData.collector} onValueChange={(value) => setFormData({...formData, collector: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select collector" />
            </SelectTrigger>
            <SelectContent>
              {collectors.map((collector: any) => (
                <SelectItem key={collector.id} value={collector.firstName + ' ' + collector.lastName}>
                  {collector.firstName} {collector.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoCalculate"
          checked={formData.autoCalculate}
          onChange={(e) => setFormData({...formData, autoCalculate: e.target.checked})}
        />
        <Label htmlFor="autoCalculate">Auto-calculate payment allocation</Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Total Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="card">Card Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!formData.autoCalculate && (
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="principalAmount">Principal</Label>
            <Input
              id="principalAmount"
              type="number"
              step="0.01"
              value={formData.principalAmount}
              onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="interestAmount">Interest</Label>
            <Input
              id="interestAmount"
              type="number"
              step="0.01"
              value={formData.interestAmount}
              onChange={(e) => setFormData({...formData, interestAmount: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="feesAmount">Fees</Label>
            <Input
              id="feesAmount"
              type="number"
              step="0.01"
              value={formData.feesAmount}
              onChange={(e) => setFormData({...formData, feesAmount: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="penaltyAmount">Penalty</Label>
            <Input
              id="penaltyAmount"
              type="number"
              step="0.01"
              value={formData.penaltyAmount}
              onChange={(e) => setFormData({...formData, penaltyAmount: e.target.value})}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentDate">Payment Date *</Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="collectionDate">Collection Date *</Label>
          <Input
            id="collectionDate"
            type="date"
            value={formData.collectionDate}
            onChange={(e) => setFormData({...formData, collectionDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about this repayment..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setFormData({
          loanId: '',
          amount: '',
          principalAmount: '',
          interestAmount: '',
          feesAmount: '',
          penaltyAmount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          collectionDate: new Date().toISOString().split('T')[0],
          paymentMethod: '',
          collector: '',
          notes: '',
          autoCalculate: true,
          customFields: {},
        })}>
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Repayment"}
        </Button>
      </div>
    </form>
  );
}

// Bulk Repayment Form Component
function BulkRepaymentForm({ loans, collectors, bulkCount, setBulkCount, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    loanId: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    collector: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, count: bulkCount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bulkCount">Number of Repayments</Label>
        <Input
          id="bulkCount"
          type="number"
          min="1"
          max="100"
          value={bulkCount}
          onChange={(e) => setBulkCount(parseInt(e.target.value) || 30)}
        />
        <p className="text-sm text-gray-500 mt-1">Generate up to 100 scheduled repayments</p>
      </div>

      <div>
        <Label htmlFor="loanId">Select Loan *</Label>
        <Select value={formData.loanId} onValueChange={(value) => setFormData({...formData, loanId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Choose loan for bulk repayments" />
          </SelectTrigger>
          <SelectContent>
            {loans.map((loan: any) => (
              <SelectItem key={loan.id} value={loan.id.toString()}>
                {loan.loanNumber} - {loan.borrowerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="collector">Default Collector</Label>
          <Select value={formData.collector} onValueChange={(value) => setFormData({...formData, collector: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select collector" />
            </SelectTrigger>
            <SelectContent>
              {collectors.map((collector: any) => (
                <SelectItem key={collector.id} value={collector.firstName + ' ' + collector.lastName}>
                  {collector.firstName} {collector.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="paymentMethod">Default Payment Method</Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="check">Check</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Notes for bulk repayments..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : `Generate ${bulkCount} Repayments`}
        </Button>
      </div>
    </form>
  );
}

// CSV Upload Form Component
function CsvUploadForm({ onSubmit, isLoading }: any) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj: any, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {});
        }).filter(row => Object.values(row).some(val => val));
        
        setCsvData(data);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (csvData.length > 0) {
      onSubmit({ csvData });
    }
  };

  const downloadTemplate = () => {
    const template = [
      'loan_number,amount,principal_amount,interest_amount,fees_amount,penalty_amount,payment_date,collection_date,payment_method,collector,notes',
      'LN-2025-01-0001,1000,800,200,0,0,2025-01-15,2025-01-15,cash,John Doe,Regular payment'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repayments_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <Button type="button" variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download CSV Template
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Download the template to see the required format for CSV uploads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="csvFile">Upload CSV File *</Label>
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
          />
        </div>

        {csvData.length > 0 && (
          <div>
            <p className="text-sm text-green-600 mb-2">
              Found {csvData.length} repayments in CSV file
            </p>
            <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
              <pre className="text-xs">
                {JSON.stringify(csvData.slice(0, 3), null, 2)}
                {csvData.length > 3 && '\n... and ' + (csvData.length - 3) + ' more rows'}
              </pre>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading || csvData.length === 0}>
            {isLoading ? "Uploading..." : `Upload ${csvData.length} Repayments`}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Analytics Component
function RepaymentAnalytics({ repayments }: { repayments: Repayment[] }) {
  const totalAmount = repayments.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
  const approvedAmount = repayments.filter(r => r.status === 'approved').reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900">Collection Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalAmount > 0 ? ((approvedAmount / totalAmount) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-500">K{approvedAmount.toLocaleString()} of K{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900">Average Payment</h3>
            <p className="text-2xl font-bold text-blue-600">
              K{repayments.length > 0 ? (totalAmount / repayments.length).toFixed(0) : 0}
            </p>
            <p className="text-sm text-gray-500">Per repayment</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900">This Month</h3>
            <p className="text-2xl font-bold text-purple-600">
              {repayments.filter(r => new Date(r.paymentDate).getMonth() === new Date().getMonth()).length}
            </p>
            <p className="text-sm text-gray-500">Repayments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['cash', 'bank_transfer', 'mobile_money', 'check', 'card'].map(method => {
              const count = repayments.filter(r => r.paymentMethod === method).length;
              const percentage = repayments.length > 0 ? (count / repayments.length) * 100 : 0;
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <span className="capitalize">{method.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-loansphere-green h-2 rounded-full" 
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Collection Management Component
function CollectionManagement({ repayments, collectors }: { repayments: Repayment[], collectors: any[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collector Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectors.map(collector => {
                const collectorName = `${collector.firstName} ${collector.lastName}`;
                const collectorRepayments = repayments.filter(r => r.collector === collectorName);
                const totalCollected = collectorRepayments.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
                
                return (
                  <div key={collector.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{collectorName}</p>
                      <p className="text-sm text-gray-500">{collectorRepayments.length} repayments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">K{totalCollected.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">collected</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {repayments.filter(r => r.status === 'pending').slice(0, 10).map(repayment => (
                <div key={repayment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{repayment.loanNumber}</p>
                    <p className="text-xs text-gray-500">{repayment.borrowerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">K{parseFloat(repayment.amount || '0').toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(repayment.collectionDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Settings Component
function RepaymentSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repayment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Payment Allocation Priority</Label>
            <Select defaultValue="fees_penalty_interest_principal">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fees_penalty_interest_principal">Fees → Penalty → Interest → Principal</SelectItem>
                <SelectItem value="penalty_fees_interest_principal">Penalty → Fees → Interest → Principal</SelectItem>
                <SelectItem value="interest_principal_fees_penalty">Interest → Principal → Fees → Penalty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Auto-approve Repayments</Label>
            <Select defaultValue="manual">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Approval Required</SelectItem>
                <SelectItem value="auto">Auto-approve All</SelectItem>
                <SelectItem value="threshold">Auto-approve Under K1,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Receipt Generation</Label>
            <Select defaultValue="automatic">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic for Approved</SelectItem>
                <SelectItem value="manual">Manual Generation</SelectItem>
                <SelectItem value="bulk">Bulk Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}