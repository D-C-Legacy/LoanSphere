import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building, Clock, DollarSign, TrendingUp, ArrowRight, Zap, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { subscriptionPlans, getSubscriptionPlan } from "@shared/subscriptionPlans";

const quickOnboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Valid email required"),
  capitalAmount: z.number().min(50000, "Minimum capital is K50,000"),
  expectedMonthlyVolume: z.number().min(20000, "Minimum monthly volume is K20,000"),
  targetMarket: z.string().min(20, "Target market description required"),
  businessPlan: z.string().min(100, "Business plan summary required"),
  agreedToTerms: z.boolean().refine(val => val === true, "You must agree to terms"),
});

type QuickOnboardingData = z.infer<typeof quickOnboardingSchema>;

export const QuickLenderOnboarding = ({ onClose }: { onClose?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { toast } = useToast();

  // Detect plan from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam) {
      const plan = getSubscriptionPlan(planParam);
      if (plan) {
        setSelectedPlan(plan.name);
      }
    }
  }, []);

  const form = useForm<QuickOnboardingData>({
    resolver: zodResolver(quickOnboardingSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      capitalAmount: 0,
      expectedMonthlyVolume: 0,
      targetMarket: "",
      businessPlan: "",
      agreedToTerms: false,
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: QuickOnboardingData) => {
      const token = localStorage.getItem("token");
      return apiRequest("/api/lender-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          businessRegistration: "PENDING_VERIFICATION",
          yearsInBusiness: 1,
          riskTolerance: "moderate",
          marketingStrategy: "Platform-based customer acquisition",
          competitiveAdvantage: "LoanSphere platform integration",
          growthProjections: "Platform-enabled growth strategy",
          quickOnboarding: true,
          submittedAt: new Date(),
          status: "pending",
        }),
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setIsSubmitting(false);
      toast({
        title: "Application Submitted Successfully!",
        description: "Welcome to LoanSphere! Your application is being fast-tracked for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please contact our support team for immediate assistance",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: QuickOnboardingData) => {
    setIsSubmitting(true);
    await submitApplicationMutation.mutateAsync(data);
  };

  const businessTypes = [
    { value: "microfinance", label: "Microfinance Institution" },
    { value: "private_lender", label: "Private Lending Company" },
    { value: "fintech", label: "Fintech Company" },
    { value: "cooperative", label: "Credit Cooperative" },
    { value: "investment_firm", label: "Investment Firm" },
    { value: "bank", label: "Commercial Bank" },
    { value: "other", label: "Other Financial Institution" },
  ];

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-pulse">
              <Zap className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-green-600">Welcome to LoanSphere!</h3>
          <p className="text-xl">You're now part of Zambia's premier lending marketplace</p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Fast-Track Benefits Activated</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <span>Priority review within 2 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <span>Immediate loan product setup</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <span>Dedicated account manager</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Building className="h-4 w-4 text-orange-600" />
                </div>
                <span>Full platform access today</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
            <h5 className="font-semibold text-yellow-800 mb-2">What happens next?</h5>
            <ul className="space-y-1 text-yellow-700 text-sm">
              <li>• Our team will call you within 30 minutes</li>
              <li>• Account approval and setup completed within 2 hours</li>
              <li>• Personalized onboarding session scheduled</li>
              <li>• Start creating loan products immediately after approval</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-loansphere-green hover:bg-loansphere-green/90"
            >
              Return to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("tel:+260123456789", "_self")}
            >
              Call Support Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedPlanDetails = selectedPlan ? getSubscriptionPlan(selectedPlan) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with plan selection and trial info */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Gift className="h-3 w-3" />
            14-Day Free Trial
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            Same-Day Approval
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            Zero Setup Fees
          </Badge>
        </div>
        
        {selectedPlanDetails && (
          <div className="bg-loansphere-green/10 border border-loansphere-green/20 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-loansphere-green mb-2">
              Selected Plan: {selectedPlanDetails.name}
            </h2>
            <p className="text-gray-700 mb-2">{selectedPlanDetails.description}</p>
            <div className="flex justify-center items-center gap-4 text-sm">
              <span className="font-medium">{selectedPlanDetails.monthlyPrice}/month</span>
              <span className="text-gray-500">•</span>
              <span>14-day free trial included</span>
              <span className="text-gray-500">•</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-gray-900">
          Start Your 14-Day Free Trial
        </h1>
        <p className="text-xl text-gray-600">
          Get instant access to LoanSphere with complete lending platform features
        </p>
      </div>

      <Card className="shadow-xl border-2 border-loansphere-green/20">
        <CardHeader className="bg-gradient-to-r from-loansphere-green/5 to-green-50">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Express Lender Application
          </CardTitle>
          <CardDescription className="text-lg">
            Complete this form in under 5 minutes and start lending today
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Business Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-loansphere-green" />
                  <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business/Institution Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Zambia Microfinance Ltd" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision Maker Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+260 xxx xxx xxx" {...field} />
                        </FormControl>
                        <FormDescription>We'll call within 30 minutes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Business Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="business@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Financial Capacity */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-loansphere-green" />
                  <h3 className="text-lg font-semibold text-gray-900">Financial Capacity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="capitalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Lending Capital (ZMW) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum K50,000 required
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedMonthlyVolume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Monthly Volume (ZMW) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="200000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Projected monthly lending
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Business Strategy */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-loansphere-green" />
                  <h3 className="text-lg font-semibold text-gray-900">Target Market & Strategy</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Borrowers *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Civil servants, small business owners, professionals in Lusaka and Copperbelt..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe who you want to lend to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lending Strategy Summary *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Focus on secured loans with 15-20% interest rates, target civil servants with collateral, use LoanSphere for borrower verification..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief overview of your lending approach
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="agreedToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-lg">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          I agree to the LoanSphere Terms of Service and Lender Agreement
                        </FormLabel>
                        <FormDescription>
                          By checking this box, you confirm agreement to our platform terms and commitment to responsible lending practices.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Plan Selection (if not pre-selected) */}
              {!selectedPlan && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-loansphere-green" />
                    <h3 className="text-lg font-semibold text-gray-900">Choose Your Plan</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPlan === plan.name
                            ? 'border-loansphere-green bg-loansphere-green/5'
                            : 'border-gray-200 hover:border-loansphere-green/50'
                        }`}
                        onClick={() => setSelectedPlan(plan.name)}
                      >
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <div className="text-xl font-bold text-loansphere-green">
                          {plan.monthlyPrice}/month
                        </div>
                        <p className="text-xs text-gray-500 mt-1">14-day free trial</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || (!selectedPlan && !selectedPlanDetails)}
                  className="bg-loansphere-green hover:bg-loansphere-green/90 px-12 py-4 text-lg font-semibold"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing Application...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-5 w-5" />
                      Start 14-Day Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  Free trial • No payment required • 2-hour approval • Cancel anytime
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};