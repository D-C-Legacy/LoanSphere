import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Building, DollarSign, UserCheck, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: any;
  redirectPath: string;
}

const roleOptions: RoleOption[] = [
  {
    value: "borrower",
    label: "Borrower",
    description: "Apply for loans and manage applications",
    icon: Users,
    redirectPath: "/borrower-dashboard"
  },
  {
    value: "lender",
    label: "Lender",
    description: "Offer loans and manage lending business",
    icon: Building,
    redirectPath: "/lender-dashboard"
  },
  {
    value: "investor",
    label: "Investor",
    description: "Fund loan opportunities and earn returns",
    icon: DollarSign,
    redirectPath: "/investor-dashboard"
  },
  {
    value: "distributor",
    label: "Distributor",
    description: "Partner with LoanSphere for distribution",
    icon: UserCheck,
    redirectPath: "/distributor-dashboard"
  },
  {
    value: "admin",
    label: "Super Admin",
    description: "Full platform administration access",
    icon: Crown,
    redirectPath: "/admin/dashboard"
  }
];

export const ClerkRoleSelector = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [selectedRole, setSelectedRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already has a role assigned
    const currentRole = user?.unsafeMetadata?.role as string;
    if (currentRole) {
      // User already has a role, redirect to appropriate dashboard
      const roleOption = roleOptions.find(r => r.value === currentRole);
      if (roleOption) {
        setLocation(roleOption.redirectPath);
      }
    }
  }, [user, setLocation]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) {
      toast({
        title: "Error",
        description: "Please select a role to continue",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      // Update user metadata with selected role using unsafeMetadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole,
          onboardingComplete: true,
          joinedAt: new Date().toISOString()
        }
      });

      // Find the role option and redirect
      const roleOption = roleOptions.find(r => r.value === selectedRole);
      if (roleOption) {
        toast({
          title: "Welcome to LoanSphere!",
          description: `You've been set up as a ${roleOption.label}. Redirecting to your dashboard...`
        });
        
        // Redirect after a brief delay to show the success message
        setTimeout(() => {
          setLocation(roleOption.redirectPath);
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsUpdating(false);
  };

  const handleSignOut = () => {
    signOut();
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="h-12 w-12 bg-gradient-to-br from-loansphere-green to-loansphere-yellow rounded-xl flex items-center justify-center mx-auto">
              <div className="h-6 w-6 bg-white rounded-md"></div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to LoanSphere, {user.firstName || user.emailAddresses[0].emailAddress}!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please select your role to complete your account setup
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">I am a...</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role on LoanSphere" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-3">
                        <role.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === role.value 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${
                      selectedRole === role.value ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <role.icon className={`h-4 w-4 ${
                        selectedRole === role.value ? "text-green-600" : "text-gray-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{role.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      {role.value === "admin" && (
                        <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-800">
                          Admin Access Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleRoleSelection}
                disabled={!selectedRole || isUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? "Setting up your account..." : "Continue to Dashboard"}
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                disabled={isUpdating}
              >
                Sign Out
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                You can change your role later in account settings
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium mb-2">Quick Access for Testing:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <strong>Super Admin:</strong> Full platform access
                </div>
                <div>
                  <strong>Lender:</strong> Advanced lending tools
                </div>
                <div>
                  <strong>Borrower:</strong> Loan applications
                </div>
                <div>
                  <strong>Investor:</strong> Investment opportunities
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};