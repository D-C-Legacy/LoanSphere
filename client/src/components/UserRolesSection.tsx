
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { Users, DollarSign, TrendingUp, Share2, Check } from "lucide-react";
import { useLocation } from "wouter";

export const UserRolesSection = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [, setLocation] = useLocation();

  // Store selected role for intelligent navigation
  const handleRoleSelection = (role: string) => {
    // Store the selected role in localStorage for persistent navigation
    localStorage.setItem('selectedRole', role);
    
    // Navigate based on role selection
    switch (role) {
      case 'borrower':
        setLocation('/loans'); // Direct to find loans page
        break;
      case 'lender':
        setAuthMode("signup");
        setIsAuthModalOpen(true);
        break;
      case 'investor':
        setLocation('/investments'); // Direct to investment opportunities
        break;
      case 'distributor':
        setAuthMode("signup");
        setIsAuthModalOpen(true);
        break;
      default:
        setAuthMode("signup");
        setIsAuthModalOpen(true);
    }
  };

  const handleJoinRole = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const roles = [
    {
      title: "Borrowers",
      description: "Find and compare the best loan offers",
      icon: Users,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      role: "borrower",
      features: [
        "Civil servant loans",
        "Plot & property loans",
        "Collateral-based loans",
        "Quick applications"
      ],
      cta: "Find Loans"
    },
    {
      title: "Lenders",
      description: "Grow your lending business with our platform",
      icon: DollarSign,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      role: "lender",
      features: [
        "Verified borrowers",
        "Risk assessment tools",
        "Automated workflows",
        "Analytics dashboard"
      ],
      cta: "Start Lending"
    },
    {
      title: "Investors",
      description: "Invest in lenders or platform growth",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      role: "investor",
      features: [
        "Lender investments",
        "Platform equity",
        "Performance tracking",
        "Automated returns"
      ],
      cta: "Start Investing"
    },
    {
      title: "Distributors",
      description: "Earn commissions by onboarding lenders",
      icon: Share2,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      role: "distributor",
      features: [
        "20% commission",
        "Affiliate tracking",
        "Marketing tools",
        "Performance analytics"
      ],
      cta: "Become Partner"
    }
  ];

  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four distinct platforms, one powerful ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {roles.map((role, index) => {
              const IconComponent = role.icon;
              return (
                <Card
                  key={index}
                  className="group relative bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 hover:border-loansphere-green transition-all duration-500 hover:shadow-xl hover:shadow-green-100/50 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative pb-4 z-10">
                    <div className={`w-14 h-14 ${role.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-7 h-7 ${role.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-loansphere-green transition-colors">
                      {role.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">{role.description}</p>
                  </CardHeader>

                  <CardContent className="relative space-y-6 pt-0 z-10">
                    <ul className="space-y-3">
                      {role.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="btn-group mt-6">
                      <Button
                        onClick={() => handleRoleSelection(role.role)}
                        className="w-full btn-primary"
                      >
                        {role.cta}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};
