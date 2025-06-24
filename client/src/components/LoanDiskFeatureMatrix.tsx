import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, ArrowRight, Target, TrendingUp, Shield } from "lucide-react";

const loanDiskFeatures = [
  'Unlimited Branches', 'Unlimited Borrowers/Clients', 'Unlimited Repayments',
  'Staff Roles and Permissions', 'Borrower Login', 'Send Email/SMS',
  'Automated SMS/Email', 'Collection Sheets', 'Payroll Management',
  'Charts and Reports', 'Double Entry Accounting', 'Calendar',
  'Loan Products', 'Loan Fees', 'Investors', 'Document Generation',
  'Automatic Backups', '24/7 Support', 'Data Transfer', 'No Setup Fee', 'Free Trial'
];

const loanSphereExtraFeatures = [
  'AI-Powered Credit Scoring', 'Real-time Risk Assessment', 'Predictive Analytics',
  'Mobile Money Integration', 'Multi-Currency Support', 'Automated Compliance Monitoring',
  'Blockchain Transaction Verification', 'Advanced Fraud Detection', 'Real-time Market Intelligence',
  'Customer Segmentation', 'Predictive Default Prevention', 'Banking API Integration',
  'Custom Mobile App Development', 'Advanced Business Intelligence'
];

const pricingPlans = [
  {
    feature: "Starter Plan",
    price: "K120/month",
    savings: "Affordable entry",
    advantage: "All core features + AI scoring included",
    description: "Perfect for small lending businesses"
  },
  {
    feature: "Professional Plan", 
    price: "K250/month", 
    savings: "Great value",
    advantage: "Advanced analytics + predictive intelligence",
    description: "For growing lending institutions"
  },
  {
    feature: "Enterprise Plan",
    price: "K400/month",
    savings: "Best value", 
    advantage: "Complete AI ecosystem + blockchain security",
    description: "For large-scale lending operations"
  }
];

export const LoanDiskFeatureMatrix = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3">
          <Target className="w-5 h-5 mr-2" />
          Complete Lending Solution
        </Badge>
        
        <h2 className="text-4xl font-bold bg-gradient-to-r from-loansphere-green to-emerald-600 bg-clip-text text-transparent">
          Why Zambian Lenders Choose LoanSphere
        </h2>
        
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Complete lending management system with cutting-edge AI capabilities at affordable pricing. 
          Purpose-built for the Zambian lending market with local payment integrations.
        </p>
      </div>

      {/* Pricing Comparison */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <TrendingUp className="w-7 h-7 text-green-600" />
            Affordable Pricing Plans
          </CardTitle>
          <CardDescription className="text-lg">
            Complete lending management system at competitive prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((item, index) => (
              <Card key={index} className="border-green-200 bg-white">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">{item.feature}</h3>
                    
                    <div className="space-y-2">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="text-sm text-gray-600">LoanDisk</div>
                        <div className="text-xl font-bold text-red-600">{item.loanDisk}</div>
                      </div>
                      
                      <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                      
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-sm text-gray-600">LoanSphere</div>
                        <div className="text-xl font-bold text-green-600">{item.loanSphere}</div>
                      </div>
                    </div>
                    
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      Save {item.savings}
                    </Badge>
                    
                    <p className="text-sm text-gray-600 mt-2">
                      {item.advantage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Matrix */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-600" />
              LoanDisk Features (100% Match)
            </CardTitle>
            <CardDescription>
              Every single LoanDisk feature is included in LoanSphere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {loanDiskFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Zap className="w-6 h-6 text-green-600" />
              LoanSphere Exclusive Features
            </CardTitle>
            <CardDescription>
              Advanced capabilities LoanDisk doesn't offer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {loanSphereExtraFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-green-50 rounded">
                  <Zap className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                  <Badge variant="outline" className="ml-auto text-xs">NEW</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Differentiators */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">40-50% Cost Savings</h3>
            <p className="text-gray-600 text-sm">
              Get all LoanDisk features plus AI enhancements at dramatically lower prices
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Intelligence</h3>
            <p className="text-gray-600 text-sm">
              Next-generation risk assessment, fraud detection, and predictive analytics
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Zambian Market Focus</h3>
            <p className="text-gray-600 text-sm">
              Built specifically for Zambian lenders with local payment integrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Migration CTA */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-bold">Ready to Upgrade from LoanDisk?</h3>
            
            <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Free Migration Support</h4>
                <p className="text-sm opacity-90">
                  We'll transfer all your LoanDisk data at no extra cost
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">30-Day Risk-Free Trial</h4>
                <p className="text-sm opacity-90">
                  Test all features before making the switch
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8"
              >
                Start Free 30-Day Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8"
              >
                Schedule Demo
              </Button>
            </div>
            
            <p className="text-sm opacity-90">
              Join the 50+ Zambian lenders who've already made the switch
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};