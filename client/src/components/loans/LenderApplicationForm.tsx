import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Building, Clock, CheckCircle, XCircle } from "lucide-react";

const lenderApplicationSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessRegistration: z.string().min(1, "Business registration number is required"),
  businessType: z.string().min(1, "Business type is required"),
  yearsInBusiness: z.number().min(0, "Years in business must be 0 or greater"),
  capitalAmount: z.number().min(10000, "Minimum capital amount is K10,000"),
  expectedMonthlyVolume: z.number().min(5000, "Minimum monthly volume is K5,000"),
  targetMarket: z.string().min(10, "Target market description is required"),
  businessPlan: z.string().min(50, "Business plan must be at least 50 characters"),
});

type LenderApplicationData = z.infer<typeof lenderApplicationSchema>;

export const LenderApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LenderApplicationData>({
    resolver: zodResolver(lenderApplicationSchema),
    defaultValues: {
      businessName: "",
      businessRegistration: "",
      businessType: "",
      yearsInBusiness: 0,
      capitalAmount: 0,
      expectedMonthlyVolume: 0,
      targetMarket: "",
      businessPlan: "",
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: LenderApplicationData) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      return apiRequest("/api/lender-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your lender application has been submitted for review",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: LenderApplicationData) => {
    setIsSubmitting(true);
    try {
      await submitApplicationMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypes = [
    { value: "microfinance", label: "Microfinance Institution" },
    { value: "bank", label: "Commercial Bank" },
    { value: "cooperative", label: "Credit Cooperative" },
    { value: "private_lender", label: "Private Lending Company" },
    { value: "fintech", label: "Fintech Company" },
    { value: "investment_firm", label: "Investment Firm" },
    { value: "other", label: "Other Financial Institution" },
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Apply to Become a Lender</CardTitle>
        <CardDescription>
          Join LoanSphere as a verified lending partner and expand your business reach
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Zambia Microfinance Ltd" {...field} />
                    </FormControl>
                    <FormDescription>
                      Legal name of your lending business
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123456789" {...field} />
                    </FormControl>
                    <FormDescription>
                      Official registration number with PACRA
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
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
                name="yearsInBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years in Business</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      How long have you been in lending business
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="capitalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Capital (ZMW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total capital available for lending
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
                    <FormLabel>Expected Monthly Volume (ZMW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Expected monthly lending volume
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetMarket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Market</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your target borrowers (e.g., civil servants, small business owners, urban professionals...)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the specific market segments you plan to serve
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
                  <FormLabel>Business Plan Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief summary of your lending business plan, including loan products, risk management approach, and growth strategy..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Outline your lending strategy and business objectives
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-6 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Application Process</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• Your application will be reviewed by our admin team</p>
                <p>• We may request additional documentation during review</p>
                <p>• Approval typically takes 2-3 business days</p>
                <p>• Once approved, you'll gain access to create loan products</p>
                <p>• All lenders must comply with Zambian financial regulations</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-loansphere-green hover:bg-loansphere-green/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};