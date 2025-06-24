import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  User, 
  FileText, 
  DollarSign,
  Clock,
  X
} from "lucide-react";

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "application",
      title: "New Loan Application",
      message: "John Doe has submitted a new application for K50,000 personal loan",
      timestamp: "2024-01-15T10:30:00Z",
      isRead: false,
      priority: "high",
      actionRequired: true
    },
    {
      id: 2,
      type: "document",
      title: "Document Verification Required",
      message: "Jane Smith has uploaded additional documents for APP-2024-002",
      timestamp: "2024-01-15T09:15:00Z",
      isRead: false,
      priority: "medium",
      actionRequired: true
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Received",
      message: "Monthly subscription payment of K299 processed successfully",
      timestamp: "2024-01-14T14:22:00Z",
      isRead: true,
      priority: "low",
      actionRequired: false
    },
    {
      id: 4,
      type: "system",
      title: "Platform Update",
      message: "New enhanced analytics features are now available in your dashboard",
      timestamp: "2024-01-14T08:00:00Z",
      isRead: true,
      priority: "low",
      actionRequired: false
    },
    {
      id: 5,
      type: "application",
      title: "Application Status Update",
      message: "Application APP-2024-001 has been approved and disbursed",
      timestamp: "2024-01-13T16:45:00Z",
      isRead: false,
      priority: "medium",
      actionRequired: false
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application": return <User className="h-5 w-5" />;
      case "document": return <FileText className="h-5 w-5" />;
      case "payment": return <DollarSign className="h-5 w-5" />;
      case "system": return <Info className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") return "text-red-600 bg-red-50";
    if (priority === "medium") return "text-orange-600 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  const filteredNotifications = {
    all: notifications,
    unread: notifications.filter(n => !n.isRead),
    actionRequired: notifications.filter(n => n.actionRequired),
    applications: notifications.filter(n => n.type === "application"),
    documents: notifications.filter(n => n.type === "document"),
    system: notifications.filter(n => n.type === "system")
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">
            Stay updated with important events and required actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">New notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">Need your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="actionRequired">Action ({actionRequiredCount})</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {Object.entries(filteredNotifications).map(([key, notifs]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {notifs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No notifications in this category</p>
                </CardContent>
              </Card>
            ) : (
              notifs.map(notification => (
                <Card key={notification.id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h3>
                            <Badge className={getPriorityBadge(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {notification.actionRequired && (
                              <Badge variant="outline" className="border-orange-200 text-orange-800">
                                Action Required
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Read
                          </Button>
                        )}
                        {notification.actionRequired && (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            Take Action
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};