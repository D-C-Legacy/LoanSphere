import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Phone, 
  Mail, 
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export const LenderSignupTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: lenderApplications = [], isLoading } = useQuery({
    queryKey: ['/api/admin/lender-applications'],
    queryFn: () => {
      const token = localStorage.getItem("token");
      return apiRequest('/api/admin/lender-applications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    refetchInterval: 30000,
  });

  const today = new Date().toDateString();
  const todaysSignups = lenderApplications.filter((app: any) => {
    const appDate = new Date(app.submittedAt || app.createdAt).toDateString();
    return appDate === today;
  });

  const pendingToday = todaysSignups.filter((app: any) => app.status === 'pending');
  const approvedToday = todaysSignups.filter((app: any) => app.status === 'approved');
  const totalTarget = 3;
  const progressPercentage = Math.min((todaysSignups.length / totalTarget) * 100, 100);

  const getTimeRemaining = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const remaining = endOfDay.getTime() - currentTime.getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getUrgencyStatus = () => {
    const achieved = todaysSignups.length;
    const remaining = totalTarget - achieved;
    
    if (achieved >= totalTarget) {
      return { 
        level: "success", 
        message: "🎉 Target Achieved!", 
        color: "bg-green-100 text-green-800 border-green-200" 
      };
    }
    
    if (remaining === 1) {
      return { 
        level: "warning", 
        message: "⚡ 1 More Needed!", 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200" 
      };
    }
    
    return { 
      level: "danger", 
      message: `🔥 ${remaining} More Needed`, 
      color: "bg-red-100 text-red-800 border-red-200" 
    };
  };

  const urgencyStatus = getUrgencyStatus();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loansphere-green mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading signup data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Goal Dashboard */}
      <Card className="border-2 border-loansphere-green/30 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-loansphere-green/5 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900">Today's Lender Acquisition Goal</CardTitle>
              <CardDescription className="text-lg">Target: 3 new lenders by end of day</CardDescription>
            </div>
            <Badge className={`px-4 py-2 text-lg font-semibold ${urgencyStatus.color}`}>
              <Target className="h-5 w-5 mr-2" />
              {urgencyStatus.message}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Progress Visualization */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Progress: {todaysSignups.length} of {totalTarget}</span>
              <span className="text-2xl font-bold text-loansphere-green">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-4" />
            <div className="text-sm text-gray-600 text-center">
              {progressPercentage >= 100 ? "🎯 Goal achieved! Keep the momentum going!" : 
               progressPercentage >= 66 ? "🔥 Almost there! One final push!" :
               progressPercentage >= 33 ? "⚡ Good progress! Keep going!" :
               "🚀 Let's get started! Time to accelerate!"}
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">{todaysSignups.length}</div>
                <div className="text-sm text-blue-700 font-medium">Total Signups</div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{approvedToday.length}</div>
                <div className="text-sm text-green-700 font-medium">Approved</div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-600">{pendingToday.length}</div>
                <div className="text-sm text-yellow-700 font-medium">Pending Review</div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">{getTimeRemaining()}</div>
                <div className="text-sm text-purple-700 font-medium">Time Remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Center */}
          {todaysSignups.length < totalTarget && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-bold text-red-800">Immediate Action Required</h4>
                </div>
                <p className="text-red-700 mb-4">
                  {totalTarget - todaysSignups.length} more lender{totalTarget - todaysSignups.length > 1 ? 's' : ''} needed to reach today's goal
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    className="bg-loansphere-green hover:bg-loansphere-green/90 font-semibold"
                    onClick={() => window.open("tel:+260123456789", "_self")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Hot Prospects
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    onClick={() => window.location.href = "/lender-signup"}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Review Signup Flow
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => window.open("mailto:prospects@loansphere.zm?subject=Urgent: LoanSphere Lender Opportunity&body=Limited time offer expires today!", "_blank")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Urgent Follow-ups
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Today's Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Today's Lender Applications
          </CardTitle>
          <CardDescription>Live feed of applications received today ({currentTime.toLocaleDateString()})</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysSignups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No applications received today yet</h3>
              <p className="text-gray-500 mb-4">Share the signup link and start making calls!</p>
              <Button 
                onClick={() => window.location.href = "/lender-signup"}
                className="bg-loansphere-green hover:bg-loansphere-green/90"
              >
                <Zap className="h-4 w-4 mr-2" />
                View Signup Page
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysSignups
                .sort((a: any, b: any) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())
                .map((application: any, index: number) => (
                <Card key={application.id} className="border-l-4 border-loansphere-green">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-loansphere-green to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                            #{todaysSignups.length - index}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900">{application.businessName}</h4>
                            <p className="text-gray-600">{application.businessType}</p>
                          </div>
                          <Badge 
                            className={
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded">
                          <div>
                            <span className="font-semibold text-gray-700">Capital:</span>
                            <div className="font-bold text-green-600">K{application.capitalAmount?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Monthly Volume:</span>
                            <div className="font-bold text-blue-600">K{application.expectedMonthlyVolume?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Contact:</span>
                            <div className="font-bold">{application.contactPhone}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Time:</span>
                            <div className="font-bold">{new Date(application.submittedAt || application.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>

                        {application.targetMarket && (
                          <div className="text-sm">
                            <span className="font-semibold">Target Market:</span> {application.targetMarket}
                          </div>
                        )}
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Quick Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`tel:${application.contactPhone}`, "_self")}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Impact Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Impact from Today's Signups
          </CardTitle>
          <CardDescription>Financial impact of today's lender acquisitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-600">
                  K{(todaysSignups.reduce((sum: number, app: any) => sum + (app.capitalAmount || 0), 0)).toLocaleString()}
                </div>
                <div className="text-sm text-green-700 font-medium">Total Capital Onboarded</div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-600">
                  K{(todaysSignups.reduce((sum: number, app: any) => sum + (app.expectedMonthlyVolume || 0), 0)).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700 font-medium">Monthly Volume Potential</div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <Building className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-600">
                  K{(approvedToday.length * 2500).toLocaleString()}
                </div>
                <div className="text-sm text-purple-700 font-medium">Monthly Subscription Revenue</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};