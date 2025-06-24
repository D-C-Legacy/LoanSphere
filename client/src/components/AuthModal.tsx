
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/clerk";
import { useToast } from "@/hooks/use-toast";
import { ManualPaymentModal } from "@/components/payments/ManualPaymentModal";
import { subscriptionPlans } from "@shared/subscriptionPlans";
import { Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  onModeChange: (mode: "login" | "signup") => void;
}

export const AuthModal = ({ isOpen, onClose, mode, onModeChange }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"borrower" | "lender" | "investor" | "distributor">("borrower");
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, period: string} | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{score: number, feedback: string[]}>({ score: 0, feedback: [] });
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Auto-fill role from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const selectedRole = localStorage.getItem('selectedRole');
      if (selectedRole && ['borrower', 'lender', 'investor', 'distributor'].includes(selectedRole)) {
        setRole(selectedRole as "borrower" | "lender" | "investor" | "distributor");
      }
    }
  }, [isOpen]);

  // Password strength validation
  const validatePassword = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push("Password must be at least 8 characters long");
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push("Password must contain lowercase letters");
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push("Password must contain uppercase letters");
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push("Password must contain numbers");
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push("Password must contain special characters");
    } else {
      score += 1;
    }

    return { score, feedback };
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === "signup") {
      setPasswordStrength(validatePassword(value));
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return "bg-red-500";
    if (score < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 2) return "Weak";
    if (score < 4) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation for signup
    if (mode === "signup") {
      if (!email || !password || !confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      if (passwordStrength.score < 3) {
        toast({
          title: "Weak Password",
          description: "Please create a stronger password for your financial account security.",
          variant: "destructive",
        });
        return;
      }
    }

    // Store the selected role for after authentication
    localStorage.setItem('selectedRole', role);
    
    // Close the modal and redirect to Clerk's authentication
    onClose();
    
    if (mode === "login") {
      window.location.href = '/sign-in';
    } else {
      window.location.href = '/sign-up';
    }
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan({
      name: plan.name,
      price: `K${plan.monthlyPrice}`,
      period: "month"
    });
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setShowPaymentSelection(false);
    onClose();
    setEmail("");
    setPassword("");
    toast({
      title: "Registration Complete!",
      description: "Your payment has been submitted for approval. You can now log in to your account.",
    });
  };

  return (
    <>
      <Dialog open={isOpen && !showPaymentSelection} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {mode === "login" ? "Welcome Back" : "Join LoanSphere"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-600">
              {mode === "login" ? "Sign in to your account" : "Create your account to get started"}
            </DialogDescription>
          </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            
            {mode === "signup" && password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Password Strength:</span>
                  <span className={`text-sm font-medium ${passwordStrength.score < 2 ? 'text-red-600' : passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-red-600 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        <span>{feedback}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrower">Borrower - Looking for loans</SelectItem>
                    <SelectItem value="lender">Lender - Offering loans</SelectItem>
                    <SelectItem value="investor">Investor - Funding opportunities</SelectItem>
                    <SelectItem value="distributor">Distributor - Partner with us</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="w-full bg-loansphere-green hover:bg-loansphere-green/90"
            disabled={isLoading || (mode === "signup" && passwordStrength.score < 3)}
          >
            {isLoading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => onModeChange(mode === "login" ? "signup" : "login")}
              className="text-loansphere-green"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>

      {/* Subscription Plan Selection for Lenders */}
      <Dialog open={showPaymentSelection} onOpenChange={() => setShowPaymentSelection(false)}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-center text-lg">Choose Your Plan</DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-600">
              Select a subscription plan to start offering loans on LoanSphere
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-h-[60vh] overflow-y-auto px-1">
            {subscriptionPlans.map((plan) => (
              <div key={plan.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="text-center mb-3">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="text-2xl font-bold text-loansphere-green mt-1">
                    K{plan.monthlyPrice}
                    <span className="text-xs font-normal text-gray-600">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-1 mb-4 max-h-32 overflow-y-auto">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start text-xs">
                      <svg className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="text-xs text-gray-500 font-medium">
                      +{plan.features.length - 6} more features
                    </li>
                  )}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full bg-loansphere-green hover:bg-loansphere-green/90 text-sm py-2"
                  size="sm"
                >
                  Select Plan
                </Button>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              All plans include 14-day free trial • Cancel anytime • Secure payment processing
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <ManualPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};
