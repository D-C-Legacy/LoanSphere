import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Upload, FileText, CheckCircle, Calculator } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const applicationSchema = z.object({
  loanProductId: z.number(),
  requestedAmount: z.string().min(1, "Amount is required"),
  requestedTerm: z.string().min(1, "Term is required"),
  purpose: z.string().min(10, "Please provide a detailed purpose (min 10 characters)"),
  employmentStatus: z.string().min(1, "Employment status is required"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  creditScore: z.string().optional(),
  documents: z.array(z.string()).default([]),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface LoanApplicationFormProps {
  loanId?: string;
  loanTitle?: string;
  lender?: string;
  onSuccess?: () => void;
}

export const LoanApplicationForm = ({ loanId, loanTitle, lender, onSuccess }: LoanApplicationFormProps) => {
  const [step, setStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      loanProductId: loanId ? parseInt(loanId) : 0,
      requestedAmount: "",
      requestedTerm: "",
      purpose: "",
      employmentStatus: "",
      monthlyIncome: "",
      creditScore: "",
      documents: [],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return apiRequest("/api/loan-applications", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          borrowerId: parseInt(user?.id || "0"),
          requestedAmount: parseFloat(data.requestedAmount),
          requestedTerm: parseInt(data.requestedTerm),
          monthlyIncome: parseFloat(data.monthlyIncome),
          creditScore: data.creditScore ? parseInt(data.creditScore) : null,
          documents: uploadedDocuments,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully. The lender will review it soon.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateEstimatedPayment = (amount: string, term: string, rate: number = 15) => {
    if (!amount || !term) return 0;
    const principal = parseFloat(amount);
    const months = parseInt(term);
    const monthlyRate = rate / 100 / 12;
    
    if (monthlyRate === 0) return principal / months;
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files).map(file => file.name);
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
    }
  };

  const onSubmit = (data: ApplicationFormData) => {
    submitMutation.mutate(data);
  };

  const watchedAmount = form.watch("requestedAmount");
  const watchedTerm = form.watch("requestedTerm");
  const estimatedPayment = calculateEstimatedPayment(watchedAmount, watchedTerm);

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your loan application for <strong>{loanTitle}</strong> has been submitted to <strong>{lender}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive updates via email and can track your application status in your dashboard.
            </p>
            <Button onClick={onSuccess}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onSuccess}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Apply for Loan</h1>
            <p className="text-gray-600">{loanTitle} by {lender}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Specify the loan amount and term you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="requestedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Amount (K)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestedTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Term (months)</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">6 months</SelectItem>
                              <SelectItem value="12">12 months</SelectItem>
                              <SelectItem value="18">18 months</SelectItem>
                              <SelectItem value="24">24 months</SelectItem>
                              <SelectItem value="36">36 months</SelectItem>
                              <SelectItem value="48">48 months</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe how you plan to use this loan (e.g., home improvement, business expansion, debt consolidation...)"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedAmount && watchedTerm && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-blue-900">Payment Estimate</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      Estimated monthly payment: <strong>K{estimatedPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      *Based on 15% annual interest rate. Actual rate may vary.
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Personal & Financial Information</CardTitle>
                <CardDescription>Help us understand your financial situation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employed_civil_servant">Civil Servant</SelectItem>
                              <SelectItem value="employed_private">Private Employee</SelectItem>
                              <SelectItem value="self_employed">Self Employed</SelectItem>
                              <SelectItem value="business_owner">Business Owner</SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                              <SelectItem value="unemployed">Unemployed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (K)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 8000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="creditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Score (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 650" {...field} />
                      </FormControl>
                      <p className="text-sm text-gray-500">If you know your credit score, please provide it</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>Upload required documents to support your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                  <p className="text-gray-600 mb-4">
                    Upload supporting documents (ID, payslips, bank statements, etc.)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </label>
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents:</h4>
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Required Documents:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Valid National ID or Passport</li>
                    <li>• Latest 3 months payslips (for employed)</li>
                    <li>• Bank statements (last 3 months)</li>
                    <li>• Employment letter or business registration</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
};