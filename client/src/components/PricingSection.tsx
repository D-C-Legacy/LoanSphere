import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { subscriptionPlans } from "@shared/subscriptionPlans";
import { Check, Users, Building, CreditCard, PiggyBank } from "lucide-react";

export const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const formatNumber = (num: number) => {
    if (num === -1) return "Unlimited";
    return num.toLocaleString();
  };

  const formatPrice = (plan: any) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getNumericPrice = (plan: any) => {
    return isAnnual ? plan.annualPriceZMW : plan.monthlyPriceZMW;
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the perfect plan for your lending institution. All plans include our complete feature set.
          </p>
          
          {/* Billing Toggle - Simple Button Style */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isAnnual
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
                  isAnnual
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 bg-loansphere-green text-white">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.isPopular ? 'border-loansphere-green border-2 shadow-lg' : ''} h-full flex flex-col`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-loansphere-green text-white px-3 py-1">
                    POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    {formatPrice(plan)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {isAnnual ? 'year' : 'month'}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Limits Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-loansphere-green" />
                      <span>{formatNumber(plan.maxUsers)} User{plan.maxUsers !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-loansphere-green" />
                      <span>{formatNumber(plan.maxBranches)} Branch{plan.maxBranches !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-loansphere-green" />
                      <span>{formatNumber(plan.maxLoans)} Loans</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <PiggyBank className="h-4 w-4 mr-2 text-loansphere-green" />
                      <span>{formatNumber(plan.maxSavings)} Savings</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6 flex-1">
                  {plan.features.slice(0, 4).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 text-loansphere-green mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <div className="text-sm text-muted-foreground">
                      + {plan.features.length - 4} more features
                    </div>
                  )}
                </div>

                <Button 
                  className={`w-full ${
                    plan.isPopular 
                      ? 'bg-loansphere-green hover:bg-loansphere-green/90' 
                      : 'border border-loansphere-green text-loansphere-green hover:bg-loansphere-green hover:text-white'
                  }`}
                  variant={plan.isPopular ? 'default' : 'outline'}
                  onClick={() => window.location.href = `/lender-signup?plan=${plan.name.toLowerCase()}`}
                >
                  Start 14-Day Free Trial
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include: Complete loan management • Borrower portal • Reporting & analytics • Email support
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-loansphere-green mr-2" />
              30-day free trial
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-loansphere-green mr-2" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-loansphere-green mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};