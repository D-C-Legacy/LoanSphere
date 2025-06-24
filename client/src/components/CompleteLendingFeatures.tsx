import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Building, Users, Calculator, FileText, Shield, BarChart3, Calendar, Bell, CreditCard, Target } from "lucide-react";

const coreFeatures = [
  'Unlimited Branches & Multi-Location Management',
  'Unlimited Borrowers, Guarantors & Clients',
  'Unlimited Loan Repayments & Bulk Processing',
  'Staff Roles, Permissions & Access Control',
  'White-label Borrower Login Portal',
  'Email & SMS Notification System',
  'Automated Payment Reminders & Triggers',
  'Collection Sheets & Field Officer Tools',
  'Comprehensive Payroll Management',
  'Advanced Charts & Business Reports',
  'Double Entry Accounting System',
  'Calendar View & Event Management',
  'Flexible Loan Products Configuration',
  'Loan Fees & Interest Management',
  'Investor Account Management',
  'Document Generation & Templates',
  'Automatic Cloud Backups',
  '24/7 Customer Support',
  'Bulk Data Import/Export Tools',
  'No Setup Fees',
  'Free 30-Day Trial'
];

const advancedFeatures = [
  'AI-Powered Credit Scoring Engine',
  'Real-time Risk Assessment',
  'Predictive Default Analytics',
  'Mobile Money Integration (MTN, Airtel)',
  'Multi-Currency Support (ZMW, USD)',
  'Automated Compliance Monitoring',
  'Blockchain Transaction Security',
  'Advanced Fraud Detection',
  'Real-time Market Intelligence',
  'Customer Behavioral Segmentation',
  'Predictive Business Forecasting',
  'Banking API Integrations',
  'Custom Mobile App Development',
  'Advanced Business Intelligence Suite'
];

const pricingPlans = [
  {
    name: "Starter",
    price: "K120",
    period: "month",
    description: "Perfect for small lending businesses",
    value: "Great for startups",
    features: "All core features + AI scoring"
  },
  {
    name: "Professional",
    price: "K250",
    period: "month",
    description: "For growing lending institutions",
    value: "Best for growth",
    features: "Advanced analytics + automation"
  },
  {
    name: "Enterprise",
    price: "K400",
    period: "month",
    description: "For large-scale operations",
    value: "Maximum power",
    features: "Complete AI ecosystem + custom development"
  }
];

const businessModules = [
  {
    icon: Building,
    title: "Branch Management",
    description: "Multi-branch operations with centralized control and local autonomy"
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Complete borrower profiles with guarantors, documents, and credit history"
  },
  {
    icon: Calculator,
    title: "Loan Processing",
    description: "Flexible loan products, automated calculations, and approval workflows"
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Multiple payment methods, bulk processing, and automated reconciliation"
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Digital document storage, automated generation, and template management"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive business intelligence and regulatory reporting"
  }
];

export const CompleteLendingFeatures = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 px-4 sm:px-0">
        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="hidden sm:inline">Complete Lending Management System</span>
          <span className="sm:hidden">Complete System</span>
        </Badge>
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          Everything Your Lending Business Needs
        </h2>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Comprehensive lending platform with all essential features plus cutting-edge AI capabilities. 
          Purpose-built for Zambian lending institutions with local payment integrations.
        </p>
      </div>

      {/* Business Modules */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
        {businessModules.map((module, index) => (
          <Card key={index} className="border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 animate-float">
                  <module.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 leading-tight text-gray-900 dark:text-white">{module.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{module.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Feature Categories */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Core Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Check className="w-6 h-6 text-green-600" />
              Core Lending Features
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              Essential features every lending business needs for daily operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {coreFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Zap className="w-6 h-6 text-green-600" />
              Advanced AI Features
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              Next-generation capabilities that give you competitive advantage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {advancedFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-green-50 rounded">
                  <Zap className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{feature}</span>
                  <Badge variant="outline" className="ml-auto text-xs">AI</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Benefits */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Secure & Compliant</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Bank-level security with automated compliance monitoring
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-loansphere-yellow" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">AI-Powered</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Smart risk assessment and predictive analytics
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-loansphere-green" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Fully Automated</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Automated workflows and intelligent notifications
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-loansphere-yellow" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Easy to Use</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Intuitive interface with comprehensive training
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-bold">Ready to Transform Your Lending Business?</h3>
            
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Free Setup</h4>
                <p className="text-sm opacity-90">
                  No setup fees or hidden costs
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">30-Day Trial</h4>
                <p className="text-sm opacity-90">
                  Test all features risk-free
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Expert Support</h4>
                <p className="text-sm opacity-90">
                  24/7 support and training
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8"
              >
                Start Free Trial
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
              Join 100+ Zambian lending institutions already using LoanSphere
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};