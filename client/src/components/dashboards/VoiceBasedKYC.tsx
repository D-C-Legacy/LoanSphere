import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Phone, Mic, CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoiceKYCSession {
  id: string;
  borrowerId: string;
  borrowerName: string;
  phoneNumber: string;
  sessionType: "NRC_VERIFICATION" | "INCOME_VERIFICATION" | "EMPLOYMENT_VERIFICATION";
  status: "pending" | "in_progress" | "completed" | "failed";
  completionPercentage: number;
  verificationData: {
    nrcNumber?: string;
    voicePrint?: boolean;
    incomeConfirmed?: boolean;
    employerConfirmed?: boolean;
    documentMatch?: boolean;
  };
  startTime: string;
  completionTime?: string;
  language: "English" | "Nyanja" | "Bemba" | "Tonga";
}

interface ChamaLoan {
  id: string;
  chamaName: string;
  totalMembers: number;
  loanAmount: string;
  contributionPerMember: string;
  completedContributions: number;
  status: "forming" | "funding" | "active" | "completed";
  memberContributions: Array<{
    memberName: string;
    phoneNumber: string;
    contributionAmount: string;
    status: "pending" | "confirmed" | "late";
    lastPayment: string;
  }>;
  createdAt: string;
  targetCompletionDate: string;
}

export const VoiceBasedKYC = () => {
  const [activeTab, setActiveTab] = useState("voice-kyc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: voiceSessions = [], isLoading: loadingVoice } = useQuery({
    queryKey: ["/api/voice-kyc/sessions"],
  });

  const { data: chamaLoans = [], isLoading: loadingChama } = useQuery({
    queryKey: ["/api/chama-loans"],
  });

  const initiateVoiceKYCMutation = useMutation({
    mutationFn: (data: { phoneNumber: string; sessionType: string; language: string }) => 
      apiRequest("/api/voice-kyc/initiate", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-kyc/sessions"] });
      toast({ title: "Success", description: "Voice KYC session initiated. Please check your phone." });
    },
  });

  const checkChamaStatusMutation = useMutation({
    mutationFn: (chamaId: string) => apiRequest(`/api/chama-loans/${chamaId}/status`, "GET"),
    onSuccess: (data) => {
      toast({ 
        title: "Chama Status Updated", 
        description: `${data.completedContributions}/${data.totalMembers} members have contributed` 
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in_progress": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress": return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice KYC & Chama Loans</h2>
          <p className="text-muted-foreground">
            Voice-based verification and group lending for Zambian borrowers
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Phone className="h-4 w-4 mr-1" />
          0800-LOANSPHERE
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice KYC Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-600" />
              Voice-Based KYC Verification
            </CardTitle>
            <CardDescription>
              Call 0800-LOANSPHERE to verify your identity using voice recognition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How Voice KYC Works:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Call 0800-LOANSPHERE from your registered number</li>
                <li>Press 1 to verify your NRC number</li>
                <li>Follow voice prompts in English, Nyanja, Bemba, or Tonga</li>
                <li>Speak clearly when prompted for voice verification</li>
                <li>Your data will appear in lender dashboard automatically</li>
              </ol>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => initiateVoiceKYCMutation.mutate({
                phoneNumber: "+260977123456", // Would use actual user phone
                sessionType: "NRC_VERIFICATION",
                language: "English"
              })}
              disabled={initiateVoiceKYCMutation.isPending}
            >
              <Phone className="h-4 w-4 mr-2" />
              {initiateVoiceKYCMutation.isPending ? "Initiating Call..." : "Start Voice KYC"}
            </Button>

            {voiceSessions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No voice verification sessions yet</p>
                <p className="text-sm">Call 0800-LOANSPHERE to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recent Verification Sessions:</h4>
                {voiceSessions.slice(0, 3).map((session: VoiceKYCSession) => (
                  <div key={session.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{session.sessionType.replace('_', ' ')}</span>
                        {getStatusBadge(session.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">{session.language}</span>
                    </div>
                    
                    {session.status === "in_progress" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span>{session.completionPercentage}%</span>
                        </div>
                        <Progress value={session.completionPercentage} className="h-2" />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Started: {new Date(session.startTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chama Loans Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Chama (Group) Loans
            </CardTitle>
            <CardDescription>
              Group lending with collective responsibility - check status via USSD *123*GROUP#
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">USSD Group Loan Commands:</h4>
              <div className="text-sm space-y-1">
                <p><code className="bg-white px-2 py-1 rounded">*123*GROUP#</code> - Check collective loan status</p>
                <p><code className="bg-white px-2 py-1 rounded">*123*GROUP*PAY#</code> - Make group contribution</p>
                <p><code className="bg-white px-2 py-1 rounded">*123*GROUP*MEMBERS#</code> - View member contributions</p>
              </div>
            </div>

            {chamaLoans.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active Chama loans</p>
                <p className="text-sm">Join a group or start a new Chama</p>
                <Button variant="outline" className="mt-3">
                  Find Chama Groups
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {chamaLoans.map((chama: ChamaLoan) => (
                  <div key={chama.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{chama.chamaName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {chama.totalMembers} members • K{chama.loanAmount} total
                        </p>
                      </div>
                      <Badge variant={chama.status === "active" ? "default" : "secondary"}>
                        {chama.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Contribution Progress</span>
                        <span>{chama.completedContributions}/{chama.totalMembers} completed</span>
                      </div>
                      <Progress 
                        value={(chama.completedContributions / chama.totalMembers) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Your Contribution:</span>
                        <p className="font-semibold">K{chama.contributionPerMember}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Date:</span>
                        <p className="font-semibold">
                          {new Date(chama.targetCompletionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => checkChamaStatusMutation.mutate(chama.id)}
                      disabled={checkChamaStatusMutation.isPending}
                    >
                      {checkChamaStatusMutation.isPending ? "Checking..." : "Check Group Status"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Contribution Timeline */}
      {chamaLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Member Contribution Timeline</CardTitle>
            <CardDescription>Track individual member contributions in your Chama groups</CardDescription>
          </CardHeader>
          <CardContent>
            {chamaLoans[0]?.memberContributions?.length > 0 ? (
              <div className="space-y-3">
                {chamaLoans[0].memberContributions.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {member.memberName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.memberName}</p>
                        <p className="text-sm text-muted-foreground">{member.phoneNumber}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">K{member.contributionAmount}</span>
                        <Badge variant={
                          member.status === "confirmed" ? "default" :
                          member.status === "pending" ? "secondary" : 
                          "destructive"
                        }>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last payment: {new Date(member.lastPayment).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No member contribution data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};