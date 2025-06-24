
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft, Play, CheckCircle } from "lucide-react";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: string;
  nextTab?: string;
}

interface InteractiveGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const guideSteps: GuideStep[] = [
  {
    id: "welcome",
    title: "Welcome to LoanSphere LMS",
    description: "Let's take a quick tour of your comprehensive loan management system. This guide will walk you through all the key features.",
    action: "Get Started"
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "Your main dashboard provides real-time insights into your loan portfolio, pending applications, and key metrics.",
    target: "overview",
    nextTab: "overview"
  },
  {
    id: "applications",
    title: "Managing Applications",
    description: "Review, approve, or reject loan applications. Use our AI-powered credit scoring to make informed decisions.",
    target: "applications",
    nextTab: "applications"
  },
  {
    id: "products",
    title: "Loan Products",
    description: "Create and manage your loan products with different terms, rates, and eligibility criteria.",
    target: "products",
    nextTab: "products"
  },
  {
    id: "lms",
    title: "Full LMS Suite",
    description: "Access comprehensive loan management tools including origination, servicing, collections, and reporting.",
    target: "lms",
    nextTab: "lms"
  },
  {
    id: "documents",
    title: "Document Management",
    description: "Manage borrower documents with automated verification and compliance tracking.",
    target: "documents",
    nextTab: "documents"
  },
  {
    id: "analytics",
    title: "AI & Analytics",
    description: "Leverage AI-powered insights for credit scoring, loan matching, and portfolio optimization.",
    target: "enhanced",
    nextTab: "enhanced"
  },
  {
    id: "complete",
    title: "Tour Complete!",
    description: "You're now ready to manage your loan portfolio effectively. Explore each section to discover more features.",
    action: "Start Managing Loans"
  }
];

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStepData = guideSteps[currentStep];
  const isLastStep = currentStep === guideSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStepData.nextTab) {
      onNavigate(currentStepData.nextTab);
    }
    
    if (!completedSteps.includes(currentStepData.id)) {
      setCompletedSteps([...completedSteps, currentStepData.id]);
    }

    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    const step = guideSteps[stepIndex];
    if (step.nextTab) {
      onNavigate(step.nextTab);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-loansphere-green" />
              Interactive Guide
            </CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {guideSteps.length}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {guideSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleSkipToStep(index)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                  index === currentStep
                    ? 'bg-loansphere-green text-white'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {completedSteps.includes(step.id) && <CheckCircle className="h-3 w-3" />}
                <span className="whitespace-nowrap">{step.title}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-loansphere-dark mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {currentStepData.target && (
              <div className="p-4 bg-loansphere-light/50 rounded-lg border border-loansphere-green/20">
                <Badge variant="outline" className="mb-2">
                  Navigation Target
                </Badge>
                <p className="text-sm">
                  This step will navigate you to the <strong>{currentStepData.target}</strong> section.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {guideSteps.length}
              </span>
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-loansphere-green hover:bg-loansphere-green/90"
            >
              {isLastStep ? (
                currentStepData.action || "Complete"
              ) : (
                <>
                  {currentStepData.action || "Next"}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
