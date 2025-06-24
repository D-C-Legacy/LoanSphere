import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Building2, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/clerk";
import { apiRequest } from "@/lib/queryClient";

interface PaymentMethod {
  id: string;
  type: "bank" | "mobile";
  name: string;
  icon: React.ReactNode;
  details: {
    label: string;
    value: string;
  }[];
}

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    name: string;
    price: string;
    period: string;
  } | null;
  onPaymentComplete?: () => void;
}

export const ManualPaymentModal = ({ isOpen, onClose, selectedPlan, onPaymentComplete }: ManualPaymentModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "access_bank",
      type: "bank",
      name: "Access Bank Zambia",
      icon: <Building2 className="w-6 h-6" />,
      details: [
        { label: "Bank Name", value: "ACCESS BANK ZAMBIA LIMITED" },
        { label: "Account Holder", value: "HOKMA INCS ZAMBIA LIMITED" },
        { label: "Account Number", value: "0080110000051" },
        { label: "Sort Code", value: "350012" },
        { label: "Swift Code", value: "AZAMZMLU" },
        { label: "Currency", value: "ZMW" }
      ]
    },
    {
      id: "airtel_money",
      type: "mobile",
      name: "Airtel Money",
      icon: <Smartphone className="w-6 h-6 text-red-600" />,
      details: [
        { label: "Number", value: "0973588838" },
        { label: "Name", value: "Collins Chapusha" }
      ]
    },
    {
      id: "mtn_money",
      type: "mobile",
      name: "MTN Money",
      icon: <Smartphone className="w-6 h-6 text-yellow-600" />,
      details: [
        { label: "Number", value: "0966485301" },
        { label: "Name", value: "Belinda Chapusa" }
      ]
    }
  ];

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast({
        title: "Copied!",
        description: "Payment details copied to clipboard",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      setPaymentProof(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setPaymentProof(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handlePaymentSubmitted = async () => {
    if (!user || !selectedPlan || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    if (!paymentProof) {
      toast({
        title: "Payment Proof Required",
        description: "Please upload a screenshot of your payment for faster approval",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id.toString());
      formData.append('planName', selectedPlan.name.toLowerCase());
      formData.append('amount', selectedPlan.price);
      formData.append('paymentMethod', selectedPaymentMethod);
      formData.append('paymentProof', paymentProof);

      await apiRequest("/api/payment-submissions", {
        method: "POST",
        body: formData,
      });

      toast({
        title: "Payment Submitted",
        description: "Your payment is under review. We'll activate your account within 24 hours.",
      });
      
      if (onPaymentComplete) {
        onPaymentComplete();
      } else {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method for the {selectedPlan.name} plan ({selectedPlan.price}{selectedPlan.period})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="border-loansphere-green">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{selectedPlan.name} Plan</CardTitle>
                <Badge variant="secondary" className="bg-loansphere-green text-white">
                  {selectedPlan.price}{selectedPlan.period}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Choose a payment method below</li>
              <li>2. Send the exact amount: <strong>{selectedPlan.price}</strong></li>
              <li>3. Include your email in the payment reference</li>
              <li>4. Click "I've Made Payment" button</li>
              <li>5. We'll verify and activate your account within 24 hours</li>
            </ol>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <Card 
                key={method.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === method.id 
                    ? 'border-loansphere-green bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {method.icon}
                    {method.name}
                    {selectedPaymentMethod === method.id && (
                      <Check className="w-5 h-5 text-loansphere-green ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {method.details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">{detail.label}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{detail.value}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(detail.value, `${method.id}-${index}`)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedField === `${method.id}-${index}` ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Proof Upload */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Upload Payment Proof
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload a screenshot of your payment for faster approval (within 5 minutes)
              </p>
            </CardHeader>
            <CardContent>
              {!paymentProof ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label htmlFor="payment-proof" className="cursor-pointer">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Click to upload payment screenshot</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {previewUrl && (
                        <img src={previewUrl} alt="Payment proof" className="w-16 h-16 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{paymentProof.name}</p>
                        <p className="text-xs text-gray-500">{(paymentProof.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFile}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentSubmitted} 
              disabled={!selectedPaymentMethod || isSubmitting}
              className="flex-1 bg-loansphere-green hover:bg-loansphere-green/90"
            >
              {isSubmitting ? "Submitting..." : "I've Made Payment"}
            </Button>
          </div>

          {/* Support Contact */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t">
            Need help? Contact support or WhatsApp us for assistance
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};