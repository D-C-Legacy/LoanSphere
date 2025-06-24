import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, Users, TrendingUp, CreditCard, Settings, 
  BarChart3, AlertTriangle, CheckCircle, Clock,
  DollarSign, Building, Target, Zap, Globe,
  Database, Activity, Wifi, Eye, Edit, Trash2,
  Plus, Search, Filter, Download, Upload,
  MessageSquare, Bell, Mail, Phone, MapPin,
  Briefcase, UserCheck, UserX, RefreshCw,
  PieChart, LineChart, Calendar, Archive
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LenderSignupTracker } from "@/components/LenderSignupTracker";

interface PlatformStats {
  totalUsers: number;
  totalLenders: number;
  totalBorrowers: number;
  todayLenderSignups: number;
  targetLenderSignups: number;
  pendingPayments: number;
  approvedPayments: number;
  totalRevenue: number;
  platformUsers: any[];
}

interface SystemMetrics {
  serverStatus: 'online' | 'maintenance' | 'offline';
  responseTime: number;
  uptime: string;
  activeConnections: number;
  databaseStatus: 'healthy' | 'warning' | 'critical';
  errorRate: number;
  totalTransactions: number;
}

export const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const { toast } = useToast();

  // Real-time platform stats
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Recent signups
  const { data: recentSignups = [] } = useQuery({
    queryKey: ['/api/admin/recent-signups'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // All platform users
  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/admin/all-users'],
  });

  // Payment submissions
  const { data: paymentSubmissions = [] } = useQuery({
    queryKey: ['/api/admin/payment-submissions'],
    refetchInterval: 15000,
  });

  // Mock system metrics (would be real in production)
  const systemMetrics: SystemMetrics = {
    serverStatus: 'online',
    responseTime: 120,
    uptime: '7 days, 14 hours',
    activeConnections: 1247,
    databaseStatus: 'healthy',
    errorRate: 0.02,
    totalTransactions: 15847
  };

  const userStatusMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: 'activate' | 'deactivate' | 'verify' }) => {
      return apiRequest(`/api/admin/users/${userId}/${action}`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-users'] });
      toast({ title: "User status updated successfully" });
    }
  });

  const broadcastMutation = useMutation({
    mutationFn: async ({ message, recipients }: { message: string; recipients: string[] }) => {
      return apiRequest('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message, recipients })
      });
    },
    onSuccess: () => {
      toast({ title: "Message broadcasted successfully" });
    }
  });

  const filteredUsers = allUsers.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    lenders: allUsers.filter((u: any) => u.role === 'lender').length,
    borrowers: allUsers.filter((u: any) => u.role === 'borrower').length,
    investors: allUsers.filter((u: any) => u.role === 'investor').length,
    distributors: allUsers.filter((u: any) => u.role === 'distributor').length,
  };

  const pendingPayments = paymentSubmissions.filter((p: any) => p.status === 'pending');
  const approvedPayments = paymentSubmissions.filter((p: any) => p.status === 'approved');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-600" />
            Super Admin Control Center
          </h1>
          <p className="text-gray-600 mt-2">Complete platform oversight and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lenders">Lender Hub</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Control</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Platform Users</p>
                    <p className="text-3xl font-bold">{platformStats?.totalUsers || 0}</p>
                    <p className="text-xs text-green-600 mt-1">+12% this month</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Lenders</p>
                    <p className="text-2xl font-bold text-green-600">{roleStats.lenders}</p>
                  </div>
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Borrowers</p>
                    <p className="text-2xl font-bold text-purple-600">{roleStats.borrowers}</p>
                  </div>
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Goal</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {platformStats?.todayLenderSignups || 0}/3
                    </p>
                  </div>
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      K{platformStats?.totalRevenue || 0}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Today's Lender Acquisition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LenderSignupTracker />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-loansphere-green" />
                  Payment Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Pending Approvals</span>
                    <Badge variant="secondary">{pendingPayments.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved Today</span>
                    <Badge variant="default">{approvedPayments.length}</Badge>
                  </div>
                  <Button className="w-full" size="sm">
                    Review Payments
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Server Status</span>
                    <Badge className="bg-green-600">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-semibold">{systemMetrics.activeConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="font-semibold">{systemMetrics.responseTime}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>Latest platform registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSignups.slice(0, 5).map((signup: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{signup.businessName || 'New Application'}</p>
                        <p className="text-sm text-gray-600">
                          {signup.contactEmail} • {new Date(signup.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{signup.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database
                    </span>
                    <Badge className="bg-green-600">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      API Response
                    </span>
                    <Badge variant="outline">120ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Error Rate
                    </span>
                    <Badge variant="outline">0.02%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Uptime
                    </span>
                    <Badge variant="outline">{systemMetrics.uptime}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lender Hub Tab */}
        <TabsContent value="lenders" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Lender Acquisition Dashboard</CardTitle>
                <CardDescription>Real-time tracking of lender onboarding progress</CardDescription>
              </CardHeader>
              <CardContent>
                <LenderSignupTracker />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lender Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Lenders</span>
                    <span className="font-bold text-green-600">{roleStats.lenders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Applications</span>
                    <span className="font-bold text-orange-600">{pendingPayments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month Revenue</span>
                    <span className="font-bold text-blue-600">K{platformStats?.totalRevenue || 0}</span>
                  </div>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Lender
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform User Management</CardTitle>
              <CardDescription>Complete oversight of all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="lender">Lenders</SelectItem>
                      <SelectItem value="borrower">Borrowers</SelectItem>
                      <SelectItem value="investor">Investors</SelectItem>
                      <SelectItem value="distributor">Distributors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-semibold">
                    <span>User</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span>Subscription</span>
                    <span>Joined</span>
                    <span>Actions</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {filteredUsers.map((user: any) => (
                      <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="w-fit capitalize">
                          {user.role}
                        </Badge>
                        <Badge variant={user.isVerified ? "default" : "secondary"} className="w-fit">
                          {user.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        <span className="text-sm capitalize">
                          {user.subscriptionPlan || "None"}
                        </span>
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={user.isVerified ? "destructive" : "default"}
                            onClick={() => userStatusMutation.mutate({
                              userId: user.id,
                              action: user.isVerified ? 'deactivate' : 'verify'
                            })}
                          >
                            {user.isVerified ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Control Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 rounded">
                    <p className="text-3xl font-bold text-green-600">
                      K{platformStats?.totalRevenue || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Platform Revenue</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <p className="text-xl font-bold">{approvedPayments.length}</p>
                      <p className="text-xs text-gray-600">Approved Payments</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <p className="text-xl font-bold">{pendingPayments.length}</p>
                      <p className="text-xs text-gray-600">Pending Reviews</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Starter Plans</span>
                    <span className="font-semibold">
                      {allUsers.filter((u: any) => u.subscriptionPlan === 'starter').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Plans</span>
                    <span className="font-semibold">
                      {allUsers.filter((u: any) => u.subscriptionPlan === 'professional').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise Plans</span>
                    <span className="font-semibold">
                      {allUsers.filter((u: any) => u.subscriptionPlan === 'enterprise').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Communications</CardTitle>
              <CardDescription>Broadcast messages and manage user communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Broadcast Message</Label>
                  <textarea 
                    className="w-full p-3 border rounded-lg"
                    rows={4}
                    placeholder="Enter message to broadcast to all users..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send to All Users
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Lenders Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>User Registration</Label>
                      <p className="text-sm text-gray-600">Allow new user signups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-approve Lenders</Label>
                      <p className="text-sm text-gray-600">Automatically approve lender applications</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Put platform in maintenance mode</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Platform Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Old Records
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Shutdown
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};