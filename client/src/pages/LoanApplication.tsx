import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, FileText, Upload, User, DollarSign, Calendar, CheckCircle } from "lucide-react";
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
}

interface ApplicationForm {
  requestedAmount: string;
  requestedTerm: number;
  purpose: string;
  employment: {
    status: string;
    employer: string;
    position: string;
    monthlyIncome: string;
    workYears: string;
  };
  personal: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    nationalId: string;
    dateOfBirth: string;
    address: string;
    maritalStatus: string;
  };
  financial: {
    bankName: string;
    accountNumber: string;
    monthlyExpenses: string;
    otherLoans: string;
    collateral: string;
  };
  documents: File[];
  agreeToTerms: boolean;
}

export default function LoanApplication() {
  const [, params] = useRoute("/loan-application/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const productId = params?.id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationForm>({
    requestedAmount: "",
    requestedTerm: 12,
    purpose: "",
    employment: {
      status: "",
      employer: "",
      position: "",
      monthlyIncome: "",
      workYears: ""
    },
    personal: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
      nationalId: "",
      dateOfBirth: "",
      address: "",
      maritalStatus: ""
    },
    financial: {
      bankName: "",
      accountNumber: "",
      monthlyExpenses: "",
      otherLoans: "",
      collateral: ""
    },
    documents: [],
    agreeToTerms: false
  });

  const { data: product, isLoading } = useQuery<LoanProduct>({
    queryKey: [`/api/loan-products/${productId}`],
    enabled: !!productId,
  });

  const submitApplication = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/loan-applications`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully. You'll receive updates via email and SMS.",
      });
      setLocation("/borrower-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateFormData = (section: keyof ApplicationForm, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...(prev[section] as any), [field]: value }
        : { [field]: value }
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your application.",
        variant: "destructive",
      });
      return;
    }

    const applicationData = {
      loanProductId: parseInt(productId!),
      borrowerId: user.id,
      requestedAmount: formData.requestedAmount,
      requestedTerm: formData.requestedTerm,
      purpose: formData.purpose,
      employmentInfo: formData.employment,
      personalInfo: formData.personal,
      financialInfo: formData.financial,
      status: "pending"
    };

    submitApplication.mutate(applicationData);
  };

  const steps = [
    { number: 1, title: "Loan Details", icon: DollarSign },
    { number: 2, title: "Personal Info", icon: User },
    { number: 3, title: "Employment", icon: FileText },
    { number: 4, title: "Financial Info", icon: Calendar },
    { number: 5, title: "Documents", icon: Upload },
    { number: 6, title: "Review", icon: CheckCircle },
  ];

  const progress = (currentStep / steps.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loansphere-green"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Loan Product Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested loan product could not be found.</p>
              <Button onClick={() => setLocation("/loans")}>
                Browse Available Loans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/loans")}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Loans
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Apply for {product.title}</h1>
              <p className="text-muted-foreground mt-2">
                Complete your application in {steps.length} simple steps
              </p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {product.loanType}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            <div className="flex items-center justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.number === currentStep;
                const isCompleted = step.number < currentStep;
                
                return (
                  <div
                    key={step.number}
                    className={`flex flex-col items-center ${
                      isActive ? "text-loansphere-green" : 
                      isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <div className={`rounded-full p-2 ${
                      isActive ? "bg-loansphere-green/10" : 
                      isCompleted ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-2 hidden sm:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
                <CardDescription>
                  Please provide accurate information for faster processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Loan Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Requested Amount (ZMW)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={formData.requestedAmount}
                          onChange={(e) => updateFormData("requestedAmount", "", e.target.value)}
                          placeholder={`${product.minAmount} - ${product.maxAmount}`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Range: {product.minAmount} - {product.maxAmount}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="term">Repayment Term (months)</Label>
                        <Select
                          value={formData.requestedTerm.toString()}
                          onValueChange={(value) => updateFormData("requestedTerm", "", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: product.maxTerm - product.minTerm + 1 },
                              (_, i) => product.minTerm + i
                            ).map((term) => (
                              <SelectItem key={term} value={term.toString()}>
                                {term} months
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="purpose">Loan Purpose</Label>
                      <Textarea
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => updateFormData("purpose", "", e.target.value)}
                        placeholder="Describe how you plan to use this loan..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.personal.firstName}
                          onChange={(e) => updateFormData("personal", "firstName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.personal.lastName}
                          onChange={(e) => updateFormData("personal", "lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.personal.phone}
                          onChange={(e) => updateFormData("personal", "phone", e.target.value)}
                          placeholder="+260..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.personal.email}
                          onChange={(e) => updateFormData("personal", "email", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nationalId">National ID</Label>
                        <Input
                          id="nationalId"
                          value={formData.personal.nationalId}
                          onChange={(e) => updateFormData("personal", "nationalId", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.personal.dateOfBirth}
                          onChange={(e) => updateFormData("personal", "dateOfBirth", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.personal.address}
                        onChange={(e) => updateFormData("personal", "address", e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select
                        value={formData.personal.maritalStatus}
                        onValueChange={(value) => updateFormData("personal", "maritalStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  {currentStep === steps.length ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitApplication.isPending || !formData.agreeToTerms}
                      className="bg-loansphere-green hover:bg-loansphere-green/90"
                    >
                      {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                      className="bg-loansphere-green hover:bg-loansphere-green/90"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Product</p>
                  <p className="text-sm text-muted-foreground">{product.title}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium">Interest Rate</p>
                  <p className="text-sm text-muted-foreground">{product.interestRate}</p>
                </div>
                
                {formData.requestedAmount && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Requested Amount</p>
                      <p className="text-sm text-muted-foreground">ZMW {formData.requestedAmount}</p>
                    </div>
                  </>
                )}
                
                {formData.requestedTerm && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Repayment Term</p>
                      <p className="text-sm text-muted-foreground">{formData.requestedTerm} months</p>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-2">Requirements:</p>
                  <p>{product.requirements}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}