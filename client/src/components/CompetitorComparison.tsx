import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Star, TrendingUp } from "lucide-react";
import { subscriptionPlans } from "@shared/subscriptionPlans";

interface ComparisonFeature {
  feature: string;
  loanSphere: boolean | string;
  loanDisk: boolean | string;
  advantage: 'loansphere' | 'loandisk' | 'equal';
}

const featureComparison: ComparisonFeature[] = [
  { feature: "Unlimited Branches", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Unlimited Borrowers/Clients", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Unlimited Repayments", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Staff Roles & Permissions", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Borrower Login Portal", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Email & SMS Notifications", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Automated Triggers", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Collection Sheets", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Payroll Management", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Charts & Reports", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Double Entry Accounting", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Calendar View", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Loan Products Management", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Investor Management", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Document Generation", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Automatic Backups", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "24/7 Support", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Bulk Data Import", loanSphere: true, loanDisk: true, advantage: 'equal' },
  { feature: "Free Trial", loanSphere: "30 days", loanDisk: "30 days", advantage: 'equal' },
  { feature: "Setup Fee", loanSphere: "None", loanDisk: "None", advantage: 'equal' },
  
  // LoanSphere Advantages
  { feature: "AI-Powered Credit Scoring", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Real-time Risk Assessment", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Predictive Analytics", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Mobile Money Integration", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Multi-Currency Support", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Automated Compliance", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Blockchain Verification", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Advanced Fraud Detection", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Market Intelligence", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Customer Segmentation", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Default Prevention", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Banking API Integration", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Custom Mobile App", loanSphere: true, loanDisk: false, advantage: 'loansphere' },
  { feature: "Business Intelligence Suite", loanSphere: true, loanDisk: false, advantage: 'loansphere' }
];

const pricingComparison = [
  {
    tier: "Basic/Starter",
    loanSphere: { price: "K120/month", features: "All core features + AI scoring" },
    loanDisk: { price: "K200+/month", features: "Core features only" },
    savings: "K80/month (40% cheaper)"
  },
  {
    tier: "Professional",
    loanSphere: { price: "K250/month", features: "Advanced features + AI analytics" },
    loanDisk: { price: "K400+/month", features: "Advanced features" },
    savings: "K150/month (38% cheaper)"
  },
  {
    tier: "Enterprise",
    loanSphere: { price: "K400/month", features: "Complete ecosystem + AI suite" },
    loanDisk: { price: "K800+/month", features: "Enterprise features" },
    savings: "K400/month (50% cheaper)"
  }
];

export const CompetitorComparison = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-loansphere-green text-white px-4 py-2">
          <Star className="w-4 h-4 mr-2" />
          Superior to LoanDisk
        </Badge>
        <h2 className="text-3xl font-bold">Why Choose LoanSphere Over LoanDisk?</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get all of LoanDisk's features PLUS cutting-edge AI capabilities at significantly lower prices.
          Built specifically for the Zambian market with local payment integrations.
        </p>
      </div>

      {/* Pricing Comparison */}
      <Card className="border-2 border-loansphere-green">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-loansphere-green" />
            Pricing Comparison - Save Up to 50%
          </CardTitle>
          <CardDescription>
            LoanSphere offers superior features at dramatically lower prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingComparison.map((tier, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">{tier.tier}</h3>
                <div className="space-y-2">
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-semibold text-loansphere-green">LoanSphere</div>
                    <div className="text-sm">{tier.loanSphere.price}</div>
                    <div className="text-xs text-gray-600">{tier.loanSphere.features}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="font-semibold text-red-600">LoanDisk</div>
                    <div className="text-sm">{tier.loanDisk.price}</div>
                    <div className="text-xs text-gray-600">{tier.loanDisk.features}</div>
                  </div>
                </div>
                <Badge className="bg-loansphere-green text-white w-full justify-center">
                  Save {tier.savings}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Feature Comparison</CardTitle>
          <CardDescription>
            Side-by-side comparison of all features between LoanSphere and LoanDisk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-center p-3 font-semibold text-loansphere-green">LoanSphere</th>
                  <th className="text-center p-3 font-semibold text-gray-600">LoanDisk</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((item, index) => (
                  <tr key={index} className={`border-b ${item.advantage === 'loansphere' ? 'bg-green-50' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {item.advantage === 'loansphere' && <Zap className="w-4 h-4 text-loansphere-green" />}
                        {item.feature}
                      </div>
                    </td>
                    <td className="text-center p-3">
                      {typeof item.loanSphere === 'boolean' ? (
                        item.loanSphere ? (
                          <Check className="w-5 h-5 text-loansphere-green mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-loansphere-green">{item.loanSphere}</span>
                      )}
                    </td>
                    <td className="text-center p-3">
                      {typeof item.loanDisk === 'boolean' ? (
                        item.loanDisk ? (
                          <Check className="w-5 h-5 text-gray-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-gray-600">{item.loanDisk}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Unique Advantages */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-loansphere-green border-2">
          <CardHeader>
            <CardTitle className="text-loansphere-green">LoanSphere Exclusive Features</CardTitle>
            <CardDescription>
              Advanced capabilities you won't find in LoanDisk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {featureComparison
                .filter(f => f.advantage === 'loansphere')
                .map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-loansphere-green flex-shrink-0" />
                    <span className="text-sm">{feature.feature}</span>
                  </li>
                ))
              }
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why LoanSphere Wins</CardTitle>
            <CardDescription>
              The clear choice for modern lending institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-loansphere-green flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">40-50% Lower Costs</div>
                  <div className="text-sm text-gray-600">Same features, better pricing</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-loansphere-green flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">AI-Powered Intelligence</div>
                  <div className="text-sm text-gray-600">Next-generation risk assessment</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-loansphere-green flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Local Market Focus</div>
                  <div className="text-sm text-gray-600">Built for Zambian lenders</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-loansphere-green flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Future-Ready Technology</div>
                  <div className="text-sm text-gray-600">Blockchain, AI, and modern integrations</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-loansphere-green to-green-600 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Switch from LoanDisk?</h3>
          <p className="text-lg mb-6 opacity-90">
            Get all their features plus exclusive AI capabilities for less than half the price
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-loansphere-green hover:bg-gray-100">
              Start 30-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-loansphere-green">
              Compare Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};