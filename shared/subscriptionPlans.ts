export interface SubscriptionPlan {
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyPriceZMW: number;
  annualPriceZMW: number;
  maxBranches: number;
  maxUsers: number;
  maxLoans: number;
  maxSavings: number;
  isPopular?: boolean;
  features: string[];
  annualDiscount: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Starter",
    description: "Perfect for new lending institutions",
    monthlyPrice: "ZMW 450",
    annualPrice: "ZMW 4,500",
    monthlyPriceZMW: 450,
    annualPriceZMW: 4500,
    maxBranches: 1,
    maxUsers: 2,
    maxLoans: 150,
    maxSavings: 100,
    features: [
      "14-day free trial",
      "Quick self-signup process",
      "All core lending features included",
      "Loan management system",
      "Borrower profiles & credit scoring",
      "Payment tracking & collections",
      "Basic reporting & analytics",
      "SMS & email notifications"
    ],
    annualDiscount: "17%"
  },
  {
    name: "Growth",
    description: "For growing microfinance institutions",
    monthlyPrice: "ZMW 950",
    annualPrice: "ZMW 9,500",
    monthlyPriceZMW: 950,
    annualPriceZMW: 9500,
    maxBranches: 2,
    maxUsers: 5,
    maxLoans: 350,
    maxSavings: 250,
    isPopular: true,
    features: [
      "14-day free trial",
      "Quick self-signup process",
      "All core lending features included",
      "Multi-branch management",
      "Staff role management",
      "Advanced reporting suite",
      "Automated loan calculations",
      "Guarantor management"
    ],
    annualDiscount: "17%"
  },
  {
    name: "Wealth",
    description: "For established lending businesses",
    monthlyPrice: "ZMW 1,800",
    annualPrice: "ZMW 18,000",
    monthlyPriceZMW: 1800,
    annualPriceZMW: 18000,
    maxBranches: 5,
    maxUsers: 15,
    maxLoans: 750,
    maxSavings: 500,
    features: [
      "14-day free trial",
      "Quick self-signup process",
      "All core lending features included",
      "Multi-location management",
      "Advanced user permissions",
      "Comprehensive analytics",
      "API integrations",
      "Custom reporting"
    ],
    annualDiscount: "17%"
  },
  {
    name: "Fortune",
    description: "Enterprise solution for major institutions",
    monthlyPrice: "ZMW 5,000",
    annualPrice: "ZMW 50,000",
    monthlyPriceZMW: 5000,
    annualPriceZMW: 50000,
    maxBranches: -1,
    maxUsers: -1,
    maxLoans: -1,
    maxSavings: -1,
    features: [
      "14-day free trial",
      "White-glove onboarding",
      "All core lending features included",
      "Unlimited everything",
      "Complete customization",
      "24/7 dedicated support",
      "On-premise deployment options",
      "Custom development"
    ],
    annualDiscount: "17%"
  }
];

export const getSubscriptionPlan = (planName: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.name.toLowerCase() === planName.toLowerCase());
};

export const getPlanLimits = (planName: string) => {
  const plan = getSubscriptionPlan(planName);
  if (!plan) return null;
  
  return {
    maxBranches: plan.maxBranches,
    maxUsers: plan.maxUsers,
    maxLoans: plan.maxLoans,
    maxSavings: plan.maxSavings
  };
};

export const calculateAnnualSavings = (plan: SubscriptionPlan): number => {
  const monthlyCost = plan.monthlyPriceZMW * 12;
  const annualCost = plan.annualPriceZMW;
  return monthlyCost - annualCost;
};