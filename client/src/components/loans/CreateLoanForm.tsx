import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const loanFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  loanType: z.string().min(1, "Loan type is required"),
  minAmount: z.string().min(1, "Minimum amount is required"),
  maxAmount: z.string().min(1, "Maximum amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  minTerm: z.number().min(1, "Minimum term is required"),
  maxTerm: z.number().min(1, "Maximum term is required"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  isActive: z.boolean().default(true),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

interface CreateLoanFormProps {
  onSuccess?: () => void;
}

export const CreateLoanForm = ({ onSuccess }: CreateLoanFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      loanType: "",
      minAmount: "",
      maxAmount: "",
      interestRate: "",
      minTerm: 6,
      maxTerm: 36,
      requirements: "",
      isActive: true,
    },
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanFormData) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      return apiRequest("/api/loan-products", {
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
        title: "Success",
        description: "Loan product created successfully",
      });
      
      // Invalidate and refetch loan products
      queryClient.invalidateQueries({ queryKey: ["/api/loan-products/lender"] });
      
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    try {
      await createLoanMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanTypes = [
    { value: "personal", label: "Personal Loan" },
    { value: "civil_servant", label: "Civil Servant Loan" },
    { value: "business", label: "Business Loan" },
    { value: "plot", label: "Plot Purchase Loan" },
    { value: "vehicle", label: "Vehicle Loan" },
    { value: "education", label: "Education Loan" },
    { value: "home", label: "Home Loan" },
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Loan Product</CardTitle>
        <CardDescription>
          Add a new loan product to your lending portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Product Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quick Personal Loan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loanTypes.map((type) => (
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your loan product, target audience, and key benefits..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description that will help borrowers understand your offer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Amount (ZMW)</FormLabel>
                    <FormControl>
                      <Input placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Amount (ZMW)</FormLabel>
                    <FormControl>
                      <Input placeholder="100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="15.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Term (months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="6"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Term (months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="36"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the requirements for this loan (e.g., employment letter, salary slip, NRC, etc.)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify what documents and criteria borrowers need to meet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Product</FormLabel>
                    <FormDescription>
                      Make this loan product available to borrowers immediately
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-loansphere-green hover:bg-loansphere-green/90"
              >
                {isSubmitting ? "Creating..." : "Create Loan Product"}
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