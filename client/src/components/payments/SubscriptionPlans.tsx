
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    period: "month",
    features: [
      "Up to 10 loan products",
      "Basic borrower management",
      "Email support",
      "Standard analytics"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 249,
    period: "month",
    features: [
      "Unlimited loan products",
      "Advanced borrower management", 
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom branding"
    ],
    popular: true,
    current: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    period: "month",
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "Custom integrations",
      "White-label solution",
      "Advanced compliance tools",
      "24/7 phone support"
    ]
  }
];

export const SubscriptionPlans = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Subscription Updated!",
        description: "Your subscription has been successfully updated.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-loansphere-dark">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your lending business. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-loansphere-green shadow-lg' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-loansphere-green text-white">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-loansphere-dark">
                  K{plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                </div>
                {plan.current && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-loansphere-green flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular 
                    ? 'bg-loansphere-green hover:bg-loansphere-green/90' 
                    : ''
                }`}
                variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || plan.current}
              >
                {loading === plan.id ? "Processing..." : 
                 plan.current ? "Current Plan" : 
                 "Choose Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4 pt-8">
        <h3 className="text-lg font-semibold">Need a custom solution?</h3>
        <p className="text-muted-foreground">
          Contact our sales team for enterprise pricing and custom features.
        </p>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </div>
  );
};
