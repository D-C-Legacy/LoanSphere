import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  X,
  Award,
  MapPin,
  Clock,
  Users,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  Phone,
  MessageSquare,
  Shield
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  module: string;
  icon: React.ReactNode;
  duration: string;
  keyFeatures: string[];
  actionText: string;
  route?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to LoanSphere",
    description: "Your complete lending management platform for the Zambian market. Let's take a quick tour to get you started.",
    module: "Getting Started",
    icon: <Award className="w-6 h-6" />,
    duration: "2 min",
    keyFeatures: [
      "Complete loan management system",
      "Zambian market focus with Kwacha currency",
      "Mobile money integration (MTN, Airtel, Zamtel)",
      "Multi-branch operations support"
    ],
    actionText: "Start Tour"
  },
  {
    id: "portfolio",
    title: "Portfolio Overview",
    description: "Monitor your loan portfolio performance across all 10 Zambian provinces with real-time analytics.",
    module: "Main Dashboard",
    icon: <BarChart3 className="w-6 h-6" />,
    duration: "3 min",
    keyFeatures: [
      "Total portfolio value tracking",
      "Regional performance analysis",
      "Loan product performance metrics",
      "Collection and default rate monitoring"
    ],
    actionText: "Explore Portfolio",
    route: "/dashboard"
  },
  {
    id: "borrowers",
    title: "Borrower Management",
    description: "Manage your customers with comprehensive profiles, KYC documentation, and loan history tracking.",
    module: "Customer Management",
    icon: <Users className="w-6 h-6" />,
    duration: "4 min",
    keyFeatures: [
      "Complete borrower profiles with photos",
      "KYC document management",
      "Loan application processing",
      "Credit scoring and risk assessment"
    ],
    actionText: "Manage Borrowers",
    route: "/dashboard"
  },
  {
    id: "loans",
    title: "Loan Products & Applications",
    description: "Create flexible loan products and process applications with automated approval workflows.",
    module: "Loan Management",
    icon: <FileText className="w-6 h-6" />,
    duration: "5 min",
    keyFeatures: [
      "Multiple loan product types",
      "Flexible interest calculation methods",
      "Automated approval workflows",
      "Custom loan terms and conditions"
    ],
    actionText: "Setup Loan Products",
    route: "/dashboard"
  },
  {
    id: "disbursement",
    title: "Disbursement Management",
    description: "Process loan disbursements through multiple channels including mobile money and bank transfers.",
    module: "Financial Operations",
    icon: <CreditCard className="w-6 h-6" />,
    duration: "4 min",
    keyFeatures: [
      "Mobile Money disbursements (MTN, Airtel, Zamtel)",
      "Bank transfer integration",
      "Cash and check disbursements",
      "Disbursement history tracking"
    ],
    actionText: "Process Disbursements",
    route: "/dashboard"
  },
  {
    id: "collections",
    title: "Collections & Recovery",
    description: "Manage collections with SMS reminders, payment rescheduling, and field agent coordination.",
    module: "Financial Operations",
    icon: <DollarSign className="w-6 h-6" />,
    duration: "4 min",
    keyFeatures: [
      "Automated SMS payment reminders",
      "Payment rescheduling options",
      "Field agent assignment",
      "Delinquency management tools"
    ],
    actionText: "Manage Collections",
    route: "/dashboard"
  },
  {
    id: "offline",
    title: "Offline-First Operations",
    description: "Bank the unbanked with USSD, WhatsApp, IVR, and field agent operations for zero-internet lending.",
    module: "Offline Channels",
    icon: <Phone className="w-6 h-6" />,
    duration: "6 min",
    keyFeatures: [
      "USSD short codes (*123*5#, *123*6#, *123*7#)",
      "WhatsApp Business automation",
      "IVR voice menu system",
      "Field agent mobile operations"
    ],
    actionText: "Setup Offline Channels",
    route: "/dashboard"
  },
  {
    id: "accounting",
    title: "Accounting Dashboard",
    description: "Comprehensive financial reporting with 20+ charts, KPI tracking, and expense management.",
    module: "Financial Management",
    icon: <BarChart3 className="w-6 h-6" />,
    duration: "5 min",
    keyFeatures: [
      "Revenue and expense tracking",
      "Profit & loss statements",
      "Cash flow management",
      "Financial KPI monitoring"
    ],
    actionText: "View Financial Reports",
    route: "/dashboard"
  },
  {
    id: "branches",
    title: "Branch Management",
    description: "Manage multiple branch locations with staff assignments and performance tracking.",
    module: "Operations Management",
    icon: <MapPin className="w-6 h-6" />,
    duration: "3 min",
    keyFeatures: [
      "Multi-branch operations",
      "Staff role assignments",
      "Branch performance metrics",
      "Location-based reporting"
    ],
    actionText: "Manage Branches",
    route: "/dashboard"
  },
  {
    id: "staff",
    title: "Staff & Security",
    description: "Advanced user roles, permissions, and security controls with comprehensive staff management.",
    module: "Security & Access",
    icon: <Shield className="w-6 h-6" />,
    duration: "4 min",
    keyFeatures: [
      "Role-based access control",
      "Staff photo and profile management",
      "Login restrictions and 2FA",
      "Activity logging and monitoring"
    ],
    actionText: "Setup Staff Roles",
    route: "/dashboard"
  },
  {
    id: "communications",
    title: "Communications Hub",
    description: "Automated SMS and email notifications for the entire loan lifecycle and customer engagement.",
    module: "Customer Engagement",
    icon: <MessageSquare className="w-6 h-6" />,
    duration: "3 min",
    keyFeatures: [
      "19 automated notification types",
      "SMS and email integration",
      "Custom message templates",
      "Delivery tracking and history"
    ],
    actionText: "Setup Communications",
    route: "/dashboard"
  },
  {
    id: "complete",
    title: "Tour Complete!",
    description: "You're now ready to start using LoanSphere. Access the Document Center for detailed manuals and guides.",
    module: "Congratulations",
    icon: <Award className="w-6 h-6" />,
    duration: "1 min",
    keyFeatures: [
      "Tour completed successfully",
      "All modules introduced",
      "Ready for live operations",
      "Support documentation available"
    ],
    actionText: "Start Using LoanSphere"
  }
];

export const LenderTourGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour before
    const tourCompleted = localStorage.getItem('loanSphere_tour_completed');
    if (!tourCompleted) {
      setIsOpen(true);
    }
  }, []);

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const nextStep = () => {
    markStepComplete(tourSteps[currentStep].id);
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTour = () => {
    setTourStarted(true);
    setCurrentStep(0);
  };

  const completeTour = () => {
    localStorage.setItem('loanSphere_tour_completed', 'true');
    setIsOpen(false);
    setTourStarted(false);
  };

  const skipTour = () => {
    localStorage.setItem('loanSphere_tour_completed', 'true');
    setIsOpen(false);
  };

  const restartTour = () => {
    localStorage.removeItem('loanSphere_tour_completed');
    setCurrentStep(0);
    setCompletedSteps([]);
    setTourStarted(true);
    setIsOpen(true);
  };

  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const currentTourStep = tourSteps[currentStep];

  if (!isOpen) {
    return (
      <Button
        onClick={restartTour}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 bg-loansphere-green text-white hover:bg-loansphere-green/90"
      >
        <PlayCircle className="w-4 h-4 mr-2" />
        Take Tour
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentTourStep.icon}
              LoanSphere Guided Tour
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {tourSteps.length} • {currentTourStep.duration} to complete
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-loansphere-green/10 rounded-lg">
                    {currentTourStep.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{currentTourStep.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {currentTourStep.module}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{currentTourStep.duration}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {currentTourStep.description}
              </p>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Key Features:</h4>
                <div className="grid gap-2">
                  {currentTourStep.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-loansphere-green" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentTourStep.id === "welcome" && !tourStarted && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Welcome to LoanSphere!</h4>
                  <p className="text-sm text-yellow-700">
                    This guided tour will help you understand all the features and modules available in your 
                    lending platform. Each step includes practical examples and tips for the Zambian market.
                  </p>
                </div>
              )}

              {currentTourStep.id === "complete" && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🎉 Congratulations!</h4>
                  <p className="text-sm text-green-700">
                    You've completed the LoanSphere tour. You can now access the Document Center for 
                    detailed manuals and start managing your lending operations effectively.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentTourStep.id === "welcome" && !tourStarted ? (
                <Button
                  onClick={startTour}
                  className="bg-loansphere-green hover:bg-loansphere-green/90 flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {currentTourStep.actionText}
                </Button>
              ) : currentTourStep.id === "complete" ? (
                <Button
                  onClick={completeTour}
                  className="bg-loansphere-green hover:bg-loansphere-green/90 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  {currentTourStep.actionText}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-loansphere-green hover:bg-loansphere-green/90 flex items-center gap-2"
                >
                  {currentTourStep.actionText}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {tourSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    index === currentStep
                      ? "bg-loansphere-green text-white"
                      : completedSteps.includes(step.id)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {completedSteps.includes(step.id) && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  <span>{index + 1}. {step.module}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};