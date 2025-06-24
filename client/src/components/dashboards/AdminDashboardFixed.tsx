import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LenderSignupTracker } from "@/components/LenderSignupTracker";
import { Check, X, Eye, Clock, CreditCard, Users, Target } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentSubmission {
  id: number;
  userId: number;
  planName: string;
  amount: string;
  paymentMethod: string;
  paymentProofPath: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  notes?: string;
}

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("signups");
  const { toast } = useToast();

  const { data: paymentSubmissions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/payment-submissions'],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/payment-submissions/${id}/approve`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Approved",
        description: "User account has been activated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-submissions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return apiRequest(`/api/admin/payment-submissions/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Rejected",
        description: "User has been notified",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-submissions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      });
    }
  });

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: number) => {
    const notes = prompt("Enter rejection reason (optional):");
    rejectMutation.mutate({ id, notes: notes || "" });
  };

  const pendingSubmissions = Array.isArray(paymentSubmissions) 
    ? paymentSubmissions.filter((sub: PaymentSubmission) => sub.status === "pending")
    : [];

  const approvedSubmissions = Array.isArray(paymentSubmissions)
    ? paymentSubmissions.filter((sub: PaymentSubmission) => sub.status === "approved")
    : [];

  const rejectedSubmissions = Array.isArray(paymentSubmissions)
    ? paymentSubmissions.filter((sub: PaymentSubmission) => sub.status === "rejected")
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor lender acquisition and platform operations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="signups" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Lender Signups
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payment Submissions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="signups">
          <LenderSignupTracker />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedSubmissions.length}</div>
                <p className="text-xs text-muted-foreground">Accounts activated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  K{approvedSubmissions.reduce((sum: number, sub: PaymentSubmission) => 
                    sum + parseInt(sub.amount.replace('K', '')), 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{approvedSubmissions.length}</div>
                <p className="text-xs text-muted-foreground">Paid subscribers</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Summary of platform performance and key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-loansphere-green mb-2">
                      {pendingSubmissions.length + approvedSubmissions.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round((approvedSubmissions.length / Math.max(pendingSubmissions.length + approvedSubmissions.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Approval Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
                    <div className="text-sm text-gray-600">Avg Review Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Submissions</CardTitle>
              <CardDescription>Review and approve payment submissions for account activation</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejectedSubmissions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {pendingSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No Pending Submissions</h3>
                      <p>All payment submissions have been reviewed.</p>
                    </div>
                  ) : (
                    pendingSubmissions.map((submission: PaymentSubmission) => (
                      <div key={submission.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="capitalize">{submission.planName} Plan</Badge>
                              <Badge variant="outline">{submission.paymentMethod}</Badge>
                              <span className="text-sm text-gray-500">Amount: {submission.amount}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              User ID: {submission.userId} • Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(submission.id)}
                              disabled={approveMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(submission.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                  {approvedSubmissions.map((submission: PaymentSubmission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="capitalize">{submission.planName} Plan</Badge>
                          <span className="ml-2 text-sm text-gray-600">{submission.amount}</span>
                        </div>
                        <Badge variant="default">Approved</Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                  {rejectedSubmissions.map((submission: PaymentSubmission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="capitalize">{submission.planName} Plan</Badge>
                          <span className="ml-2 text-sm text-gray-600">{submission.amount}</span>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">User Administration</h3>
                <p>User management tools available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};