
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, useClerk } from "@/lib/clerk";

import { useLocation } from "wouter";
import { useScrollSpy } from "@/hooks/useScrollSpy";

export const Header = () => {

  const { user, isAuthenticated } = useAuth();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  
  // Scroll spy for active navigation states
  const activeSection = useScrollSpy(['hero', 'how-it-works', 'comparison', 'pricing', 'contact']);

  const handleAuth = (mode: "login" | "signup") => {
    // Redirect to Clerk's authentication pages instead of custom modal
    if (mode === "login") {
      setLocation("/sign-in");
    } else {
      setLocation("/sign-up");
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'comparison', label: 'All Features' },
    { id: 'pricing', label: 'Pricing' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <button 
            onClick={() => setLocation('/')} 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-loansphere-green to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm sm:text-base">LS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">LoanSphere</span>
              <span className="text-xs text-gray-600 dark:text-gray-300 leading-none hidden sm:block">Financial Platform</span>
            </div>
          </button>

          {/* Desktop Navigation with Active States */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className={`text-sm font-medium transition-colors py-2 px-3 rounded-md ${
                  activeSection === item.id
                    ? 'text-loansphere-green bg-green-50'
                    : 'text-gray-700 hover:text-loansphere-green hover:bg-green-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => setLocation('/loans')} 
              className="text-sm font-medium text-gray-700 hover:text-loansphere-green hover:bg-green-50 transition-colors py-2 px-3 rounded-md"
            >
              Find Loans
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Welcome, {user?.primaryEmailAddress?.emailAddress}</span>
                <Button variant="outline" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleAuth("login")}
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleAuth("signup")}
                  className="bg-loansphere-green hover:bg-loansphere-green/90"
                >
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <span className="sr-only">Toggle menu</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => scrollToSection(item.id)} 
                      className="text-sm font-medium hover:text-loansphere-green transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button onClick={() => setLocation('/loans')} className="text-sm font-medium hover:text-loansphere-green transition-colors text-left">
                    Find Loans
                  </button>
                  {!user && (
                    <>
                      <Button variant="ghost" onClick={() => handleAuth("login")}>
                        Login
                      </Button>
                      <Button
                        onClick={() => handleAuth("signup")}
                        className="bg-loansphere-green hover:bg-loansphere-green/90"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>


    </>
  );
};
