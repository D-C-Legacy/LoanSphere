import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Zap, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Phone,
  Sparkles
} from "lucide-react";

export const LenderCTASection = () => {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live platform statistics
  const { data: platformStats } = useQuery({
    queryKey: ["/api/platform/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update system time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const benefits = [
    {
      icon: Clock,
      title: "Same-Day Approval",
      description: "Get approved and start lending within 2 hours",
      highlight: "Fast-Track Process"
    },
    {
      icon: DollarSign,
      title: "Immediate Revenue",
      description: "Start generating income from day one",
      highlight: "No Waiting Period"
    },
    {
      icon: Users,
      title: "Pre-Verified Borrowers",
      description: "Access to qualified, screened borrowers",
      highlight: "Quality Guaranteed"
    },
    {
      icon: Shield,
      title: "Risk Management Tools",
      description: "Advanced analytics and risk assessment",
      highlight: "Built-In Protection"
    }
  ];

  const urgencyFactors = [
    "Limited-time zero setup fees (normally K2,500)",
    "Priority onboarding for first 10 lenders this month",
    "Exclusive access to high-value borrower segments",
    "Personal account manager assignment"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-loansphere-green/5 via-white to-yellow-50">
      <div className="container mx-auto px-6">
        {/* Urgency Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Badge className="bg-red-100 text-red-800 px-4 py-2 text-sm font-semibold animate-pulse">
              <Sparkles className="h-4 w-4 mr-1" />
              TODAY ONLY - Special Launch Offer
            </Badge>
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              2-Hour Approval
            </Badge>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Zambia's Premier <span className="text-loansphere-green">Lending Platform</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Don't miss this exclusive opportunity to be among the first lenders on LoanSphere. 
            Start generating revenue immediately with our fast-track approval process.
          </p>

          <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full text-yellow-800 text-sm font-medium">
            <Zap className="h-4 w-4" />
            Only {10 - 3} spots remaining for priority onboarding
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center p-6 border-2 hover:border-loansphere-green/30 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-0 space-y-4">
                <div className="mx-auto w-12 h-12 bg-loansphere-green/10 rounded-full flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-loansphere-green" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2 text-xs">
                    {benefit.highlight}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main CTA Card */}
        <Card className="max-w-4xl mx-auto border-2 border-loansphere-green/20 shadow-2xl bg-gradient-to-r from-white to-green-50">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Offer Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Launch Special: Start Lending Today
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Join now and enjoy exclusive benefits worth over K5,000 in value
                  </p>
                </div>

                <div className="space-y-3">
                  {urgencyFactors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{factor}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-yellow-800 text-sm font-medium">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Limited time: This offer expires at midnight today ({currentTime.toLocaleDateString()})
                  </p>
                </div>
              </div>

              {/* Right Side - Action Items */}
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-loansphere-green mb-2">
                    K0 Setup Fee
                  </div>
                  <div className="text-gray-500 line-through text-lg">
                    Regular price: K2,500
                  </div>
                  <div className="text-green-600 font-medium">
                    Save K2,500 today only
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setLocation("/lender-signup")}
                    className="w-full bg-loansphere-green hover:bg-loansphere-green/90 text-white py-4 text-lg font-semibold transition-all transform hover:scale-105"
                    size="lg"
                  >
                    Start Lending Now - Free Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open("tel:+260123456789", "_self")}
                    className="w-full border-2 border-loansphere-green text-loansphere-green hover:bg-loansphere-green hover:text-white py-4 text-lg font-semibold"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call for Instant Approval
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    No commitment required • 2-minute application • Instant approval call
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </section>
  );
};