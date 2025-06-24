import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Clock, DollarSign, Filter, TrendingUp } from "lucide-react";
import { LoanApplicationForm } from "./LoanApplicationForm";

interface LoanProduct {
  id: number;
  lenderId: number;
  title: string;
  description: string;
  loanType: string;
  minAmount: string;
  maxAmount: string;
  interestRate: string;
  minTerm: number;
  maxTerm: number;
  requirements: string;
  isActive: boolean;
  createdAt: string;
  lender?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const LoanBrowser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loanType, setLoanType] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxInterestRate, setMaxInterestRate] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<LoanProduct | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: loanProducts = [], isLoading } = useQuery({
    queryKey: ['/api/loan-products/active'],
  });

  const filteredLoans = Array.isArray(loanProducts) ? loanProducts.filter((loan: LoanProduct) => {
    const matchesSearch = loan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.loanType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !loanType || loan.loanType === loanType;
    const matchesAmount = !minAmount || parseInt(loan.maxAmount) >= parseInt(minAmount);
    const matchesRate = !maxInterestRate || parseFloat(loan.interestRate) <= parseFloat(maxInterestRate);
    
    return matchesSearch && matchesType && matchesAmount && matchesRate;
  }) : [];

  const loanTypes = [...new Set(loanProducts.map((loan: LoanProduct) => loan.loanType))];

  const handleApplyForLoan = (loan: LoanProduct) => {
    setSelectedLoan(loan);
    setShowApplicationForm(true);
  };

  if (showApplicationForm && selectedLoan) {
    return (
      <LoanApplicationForm
        loanId={selectedLoan.id.toString()}
        loanTitle={selectedLoan.title}
        lender={`${selectedLoan.lender?.firstName} ${selectedLoan.lender?.lastName}`}
        onSuccess={() => {
          setShowApplicationForm(false);
          setSelectedLoan(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Loans</h1>
          <p className="text-gray-600">Find the perfect loan for your needs</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredLoans.length} loans available
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search loans, lenders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loan Type</label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {loanTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Amount (K)</label>
              <Input
                type="number"
                placeholder="e.g., 10000"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Interest Rate (%)</label>
              <Input
                type="number"
                placeholder="e.g., 15"
                value={maxInterestRate}
                onChange={(e) => setMaxInterestRate(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || loanType || minAmount || maxInterestRate) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setLoanType("");
                setMinAmount("");
                setMaxInterestRate("");
              }}
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Loan Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No loans found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || loanType || minAmount || maxInterestRate
                ? "Try adjusting your search criteria"
                : "No active loan products are currently available"}
            </p>
            {(searchTerm || loanType || minAmount || maxInterestRate) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setLoanType("");
                  setMinAmount("");
                  setMaxInterestRate("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLoans.map((loan: LoanProduct) => (
            <Card key={loan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{loan.title}</CardTitle>
                    <CardDescription>
                      by {loan.lender?.firstName} {loan.lender?.lastName}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{loan.loanType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {loan.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">Amount</p>
                      <p className="text-gray-600">K{parseInt(loan.minAmount).toLocaleString()} - K{parseInt(loan.maxAmount).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Interest Rate</p>
                      <p className="text-gray-600">{loan.interestRate}% p.a.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="font-medium">Term</p>
                      <p className="text-gray-600">{loan.minTerm}-{loan.maxTerm} months</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-medium">Available</p>
                      <p className="text-gray-600">Nationwide</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Requirements:</p>
                  <p className="text-sm text-gray-600">{loan.requirements}</p>
                </div>

                <Button 
                  onClick={() => handleApplyForLoan(loan)}
                  className="w-full"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};