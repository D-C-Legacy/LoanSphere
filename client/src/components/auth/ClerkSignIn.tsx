import { SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ClerkSignIn = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="h-12 w-12 bg-gradient-to-br from-loansphere-green to-loansphere-yellow rounded-xl flex items-center justify-center mx-auto">
              <div className="h-6 w-6 bg-white rounded-md"></div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to LoanSphere</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your lending platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn 
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                  formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
                  footerActionLink: "text-green-600 hover:text-green-700",
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};