import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const testUsers = [
  { email: "lender@example.com", password: "admin123", role: "lender", name: "Test Lender" },
  { email: "admin@loansphere.com", password: "admin123", role: "admin", name: "Super Admin" },
  { email: "borrower@example.com", password: "admin123", role: "borrower", name: "Test Borrower" },
  { email: "investor@example.com", password: "admin123", role: "investor", name: "Test Investor" },
  { email: "distributor@example.com", password: "admin123", role: "distributor", name: "Test Distributor" },
];

export const TemporaryLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = () => {
    const user = testUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Store auth in localStorage for temporary system
      const authData = {
        isAuthenticated: true,
        user: {
          id: user.email,
          email: user.email,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ')[1] || '',
          unsafeMetadata: {
            role: user.role,
            onboardingComplete: true
          }
        },
        userId: user.email,
        token: 'temp_token_' + Date.now()
      };
      
      localStorage.setItem('loansphere_auth', JSON.stringify(authData));
      
      // Redirect based on role
      const dashboards = {
        lender: "/lender-dashboard",
        admin: "/admin/dashboard", 
        borrower: "/borrower-dashboard",
        investor: "/investor-dashboard",
        distributor: "/distributor-dashboard"
      };
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${user.name}! Redirecting to your dashboard...`
      });
      
      setTimeout(() => {
        setLocation(dashboards[user.role as keyof typeof dashboards]);
      }, 1000);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Try the test credentials.",
        variant: "destructive"
      });
    }
  };

  const handleQuickLogin = (user: typeof testUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(user.role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="h-12 w-12 bg-gradient-to-br from-loansphere-green to-loansphere-yellow rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">LS</span>
          </div>
          <CardTitle className="text-2xl font-bold">LoanSphere Login</CardTitle>
          <CardDescription>
            Temporary login system while Clerk is being configured
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!email || !password}
          >
            Sign In
          </Button>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3 text-center">Quick Login (Test Accounts)</p>
            <div className="grid grid-cols-1 gap-2">
              {testUsers.map((user) => (
                <Button
                  key={user.email}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin(user)}
                  className="text-xs justify-start"
                >
                  <span className="font-medium">{user.role}</span>
                  <span className="ml-2 text-gray-500">{user.email}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Test password for all accounts: <code>admin123</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};