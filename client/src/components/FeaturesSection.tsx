
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FeaturesSection = () => {
  const features = [
    {
      title: "Smart Loan Matching",
      description: "AI-powered matching connects borrowers with the best lenders based on their needs and profile.",
      icon: "🎯",
      category: "For Borrowers"
    },
    {
      title: "Subscription Management",
      description: "Flexible subscription plans for lenders with comprehensive dashboard and analytics.",
      icon: "📊",
      category: "For Lenders"
    },
    {
      title: "Investment Opportunities",
      description: "Invest in high-performing lenders or platform growth with transparent returns.",
      icon: "💰",
      category: "For Investors"
    },
    {
      title: "Distributor Network",
      description: "Earn commissions by onboarding lenders and growing the marketplace ecosystem.",
      icon: "🤝",
      category: "For Distributors"
    },
    {
      title: "Geolocation Services",
      description: "Find nearby lenders and services with our integrated mapping and location features.",
      icon: "📍",
      category: "Location-Based"
    },
    {
      title: "Secure Transactions",
      description: "Bank-grade security with KYC verification and document management systems.",
      icon: "🔒",
      category: "Security"
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-loansphere-light">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-loansphere-dark">
            Powerful Features for Every User
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Comprehensive tools and services designed to make lending, borrowing, and investing seamless and profitable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-white/90 backdrop-blur-sm cursor-pointer"
            >
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-loansphere flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform animate-float">
                  <span className="text-xl sm:text-2xl">{feature.icon}</span>
                </div>
                <div className="text-xs font-medium text-loansphere-green mb-2 inline-block px-2 py-1 bg-loansphere-green/10 rounded-full">
                  {feature.category}
                </div>
                <CardTitle className="text-lg sm:text-xl text-loansphere-dark leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6">
                <CardDescription className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
