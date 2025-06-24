import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, MapPin, Clock, Percent, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

interface LoanProduct {
  id: number;
  title: string;
  description: string;
  loanType: string;
  minAmount: string;
  maxAmount: string;
  interestRate: string;
  minTerm: number;
  maxTerm: number;
  requirements: string;
  lenderId: number;
  lenderName: string;
  lenderRating: number;
  processingTime: string;
  isActive: boolean;
}

export default function LoanMarketplace() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [loanType, setLoanType] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [maxRate, setMaxRate] = useState("");

  const { data: loanProducts, isLoading } = useQuery<LoanProduct[]>({
    queryKey: ["/api/loan-products", { search: searchTerm, type: loanType, maxAmount, maxRate }],
  });

  const filteredProducts = loanProducts?.filter(product => {
    if (!product.isActive) return false;
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (loanType && product.loanType !== loanType) return false;
    if (maxAmount && parseInt(product.maxAmount.replace(/[^\d]/g, '')) > parseInt(maxAmount)) return false;
    if (maxRate && parseFloat(product.interestRate.replace('%', '')) > parseFloat(maxRate)) return false;
    return true;
  }) || [];

  const loanTypes = [
    "Personal Loan", "Business Loan", "Civil Servant Loan", "Plot/Land Loan", 
    "Vehicle Loan", "Education Loan", "Agricultural Loan", "Emergency Loan"
  ];

  const handleApply = (productId: number) => {
    setLocation(`/loan-application/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loansphere-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading loan products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-loansphere-green to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Loan</h1>
            <p className="text-xl mb-8 opacity-90">
              Compare offers from verified lenders across Zambia. Fast approval, competitive rates.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search loans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loan Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {loanTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Max Amount (ZMW)"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  type="number"
                />
                
                <Input
                  placeholder="Max Rate (%)"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  type="number"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Loans</h2>
            <p className="text-muted-foreground">
              {filteredProducts.length} loan{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-muted-foreground">Filtered results</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No loans found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all available loans.
                </p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setLoanType("");
                  setMaxAmount("");
                  setMaxRate("");
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{product.title}</CardTitle>
                      <CardDescription className="text-sm">
                        by {product.lenderName || 'Verified Lender'}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {product.loanType}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-loansphere-green" />
                      <div>
                        <p className="font-medium">{product.minAmount} - {product.maxAmount}</p>
                        <p className="text-muted-foreground">Amount Range</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Percent className="h-4 w-4 text-loansphere-green" />
                      <div>
                        <p className="font-medium">{product.interestRate}</p>
                        <p className="text-muted-foreground">Interest Rate</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-loansphere-green" />
                      <div>
                        <p className="font-medium">{product.minTerm} - {product.maxTerm} months</p>
                        <p className="text-muted-foreground">Repayment Term</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-loansphere-green" />
                      <div>
                        <p className="font-medium">2-24 hours</p>
                        <p className="text-muted-foreground">Processing Time</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Requirements:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.requirements || 'Standard documentation required'}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => handleApply(product.id)}
                    className="w-full bg-loansphere-green hover:bg-loansphere-green/90"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}