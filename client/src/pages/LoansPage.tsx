import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Container, Section } from "@/components/Layout";
import { SkeletonList } from "@/components/SkeletonLoader";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { useLocation } from "wouter";
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Filter,
  User,
  ArrowRight
} from "lucide-react";

interface LoanProduct {
  id: number;
  lenderId: number;
  lenderName: string;
  title: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  term: number;
  loanType: string;
  requirements: string[];
  features: string[];
  location: string;
  processingTime: string;
  isActive: boolean;
}

export const LoansPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoanType, setSelectedLoanType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user came from role selection
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
      setUserRole(selectedRole);
    }
  }, []);

  const { data: loanProducts = [], isLoading } = useQuery<LoanProduct[]>({
    queryKey: ['/api/loan-products'],
  });

  const filteredLoans = loanProducts.filter(loan => {
    const matchesSearch = loan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.lenderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedLoanType === "all" || loan.loanType === selectedLoanType;
    const matchesLocation = selectedLocation === "all" || loan.location === selectedLocation;
    
    return matchesSearch && matchesType && matchesLocation && loan.isActive;
  });

  const handleApplyForLoan = (loanId: number) => {
    if (!user) {
      localStorage.setItem('pendingLoanApplication', loanId.toString());
      setAuthMode("signup");
      setIsAuthModalOpen(true);
    } else {
      setLocation(`/loan-application/${loanId}`);
    }
  };

  const loanTypes = ["all", "personal", "business", "property", "vehicle", "education"];
  const locations = ["all", "Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <Section id="loans-hero" className="bg-gradient-to-br from-loansphere-green via-green-600 to-green-700 text-white pt-24">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Perfect Loan
            </h1>
            {userRole === 'borrower' && (
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full mb-4">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Looking for loans as a Borrower</span>
              </div>
            )}
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Compare competitive loan offers from verified lenders across Zambia
            </p>
          </div>
        </Container>
      </Section>

      {/* Search and Filters */}
      <Section className="bg-white border-b">
        <Container>
          <div className="bg-white rounded-2xl shadow-lg p-6 -mt-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search loans, lenders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedLoanType} onValueChange={setSelectedLoanType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Loan Type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location === "all" ? "All Locations" : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="btn-primary">
                <Search className="h-4 w-4 mr-2" />
                Search Loans
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Loan Results */}
      <Section className="section-spacing">
        <Container>
          {isLoading ? (
            <SkeletonList count={6} />
          ) : filteredLoans.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Available Loans ({filteredLoans.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLoans.map((loan) => (
                  <Card key={loan.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-green-100 text-loansphere-green">
                          {loan.loanType}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {loan.location}
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl group-hover:text-loansphere-green transition-colors">
                        {loan.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        by {loan.lenderName}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {loan.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500">Amount Range</p>
                            <p className="font-semibold text-sm">
                              K{loan.minAmount.toLocaleString()} - K{loan.maxAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-loansphere-green" />
                          <div>
                            <p className="text-xs text-gray-500">Interest Rate</p>
                            <p className="font-semibold text-sm">{loan.interestRate}% p.a.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{loan.processingTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>Verified Lender</span>
                        </div>
                      </div>

                      <div className="btn-group">
                        <Button 
                          onClick={() => handleApplyForLoan(loan.id)}
                          className="w-full btn-primary"
                        >
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or check back later for new loan products.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLoanType("all");
                    setSelectedLocation("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};