
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { PlatformStats, OnlineUsersResponse } from "@shared/types";

export const HeroSection = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [onlineUsers, setOnlineUsers] = useState(0);

  // Fetch live platform statistics
  const { data: platformStats } = useQuery<PlatformStats>({
    queryKey: ["/api/platform/stats"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Update system time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Real-time online user tracking via polling
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch('/api/platform/online-users');
        if (response.ok) {
          const data: OnlineUsersResponse = await response.json();
          setOnlineUsers(data.onlineUsers);
        }
      } catch (error) {
        // Silently handle connection errors
        setOnlineUsers(1); // Default to showing at least current user
      }
    };

    // Initial fetch
    fetchOnlineUsers();

    // Update online users every 3 seconds for real-time tracking
    const timer = setInterval(fetchOnlineUsers, 3000);

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

  const handleGetStarted = () => {
    setLocation("/lender-signup");
  };

  const handleFindLoans = () => {
    setLocation("/loans");
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-loansphere-light via-white to-loansphere-yellow/10 pt-16 pb-20 sm:pt-20 sm:pb-32">
        <div className="container relative px-4 sm:px-6 mx-auto">
          <div className="mx-auto max-w-4xl text-center flex flex-col items-center justify-center">
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-yellow-800 border border-yellow-200 shadow-sm">
                <span className="mr-2">🇿🇲</span>
                <span className="hidden xs:inline">Now Live in Zambia</span>
                <span className="xs:hidden">Live in Zambia</span>
              </div>
            </div>

            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              The Future of{" "}
              <span className="text-loansphere-green block sm:inline">
                Loan Marketplace
              </span>
            </h1>

            <p className="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600 px-4 sm:px-0">
              Connect borrowers with verified lenders, enable smart investments, and build a 
              thriving financial ecosystem. LoanSphere makes lending accessible, transparent, 
              and profitable for everyone.
            </p>

            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row items-center justify-center w-full max-w-md sm:max-w-none mx-auto">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-loansphere-green text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto hover:bg-loansphere-green/90 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="hidden sm:inline">Start as Lender →</span>
                <span className="sm:hidden">Start Lending →</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleFindLoans}
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Find Loans
              </Button>
            </div>

            {/* Live Platform Statistics */}
            <div className="mt-12 sm:mt-16 w-full">
              <div className="bg-gradient-to-r from-loansphere-green/5 to-green-50 rounded-xl p-4 sm:p-6 border border-loansphere-green/20 shadow-lg">
                <h3 className="text-center text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Live Platform Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 justify-items-center">
                  <div className="text-center p-2 sm:p-0">
                    <div className="text-lg sm:text-xl font-bold text-loansphere-green" id="system-time">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-xs text-gray-600">System Time</div>
                  </div>
                  <div className="text-center p-2 sm:p-0">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      {platformStats ? platformStats.totalBorrowers : '0'}
                    </div>
                    <div className="text-xs text-gray-600">Borrowers</div>
                  </div>
                  <div className="text-center p-2 sm:p-0">
                    <div className="text-lg sm:text-xl font-bold text-purple-600">
                      {platformStats ? platformStats.activeLoans : '0'}
                    </div>
                    <div className="text-xs text-gray-600">Active Loans</div>
                  </div>
                  <div className="text-center p-2 sm:p-0">
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      {platformStats ? platformStats.totalLenders : '0'}
                    </div>
                    <div className="text-xs text-gray-600">Lenders</div>
                  </div>
                  <div className="text-center p-2 sm:p-0">
                    <div className="text-lg sm:text-xl font-bold text-orange-600">
                      {platformStats ? platformStats.totalInvestors : '0'}
                    </div>
                    <div className="text-xs text-gray-600">Investors</div>
                  </div>
                  <div className="text-center p-2 sm:p-0">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      {onlineUsers}
                    </div>
                    <div className="text-xs text-gray-600">Users Online</div>
                  </div>
                </div>
                <div className="flex justify-center mt-3 sm:mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">Live updates in real-time</span>
                    <span className="sm:hidden">Live updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-loansphere-yellow/20 animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 h-24 w-24 rounded-full bg-loansphere-green/20 animate-float"></div>
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
