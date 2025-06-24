import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Settings, 
  Bell, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  FileText,
  PiggyBank,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  category: 'loan' | 'borrower' | 'investor' | 'savings';
  icon: React.ReactNode;
  smsEnabled: boolean;
  emailEnabled: boolean;
  template: string;
}

export const CommunicationsManagement = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'processing_loan',
      name: 'Processing Loan Added In System',
      description: 'Notify when a loan application enters processing status',
      category: 'loan',
      icon: <Clock className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Your loan application for ZMW {amount} is now being processed. Reference: {loanNumber}'
    },
    {
      id: 'open_loan',
      name: 'Open Loan Added In System',
      description: 'Notify when a new loan is opened and available',
      category: 'loan',
      icon: <CreditCard className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Your loan for ZMW {amount} has been approved and is now active. Reference: {loanNumber}'
    },
    {
      id: 'payment_reminder',
      name: 'Loan Remind Payment Before Due Date',
      description: 'Send payment reminders before due dates',
      category: 'loan',
      icon: <Bell className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: false,
      template: 'Payment reminder: ZMW {amount} is due on {dueDate} for loan {loanNumber}'
    },
    {
      id: 'missed_payment',
      name: 'Loan Missed Repayment or Arrears',
      description: 'Alert when payments are missed or overdue',
      category: 'loan',
      icon: <AlertTriangle className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Payment overdue: ZMW {amount} was due on {dueDate} for loan {loanNumber}. Please pay immediately.'
    },
    {
      id: 'past_maturity',
      name: 'Loan Past Maturity',
      description: 'Notify when loans go past their maturity date',
      category: 'loan',
      icon: <XCircle className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Your loan {loanNumber} has passed its maturity date. Outstanding balance: ZMW {balance}'
    },
    {
      id: 'before_maturity',
      name: 'Loan Before Maturity',
      description: 'Remind borrowers before loan maturity',
      category: 'loan',
      icon: <Calendar className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'Your loan {loanNumber} matures on {maturityDate}. Final payment: ZMW {amount}'
    },
    {
      id: 'fully_paid',
      name: 'Loan Fully Paid Confirmation',
      description: 'Confirm when loans are fully paid off',
      category: 'loan',
      icon: <CheckCircle className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Congratulations! Your loan {loanNumber} has been fully paid. Thank you for your business.'
    },
    {
      id: 'default_loan',
      name: 'Default Loan Set In System',
      description: 'Notify when loans are marked as defaulted',
      category: 'loan',
      icon: <XCircle className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Your loan {loanNumber} has been marked as defaulted. Please contact us immediately.'
    },
    {
      id: 'denied_loan',
      name: 'Denied Loan Set In System',
      description: 'Notify when loan applications are denied',
      category: 'loan',
      icon: <XCircle className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Your loan application {applicationNumber} has been declined. Contact us for more information.'
    },
    {
      id: 'not_taken_loan',
      name: 'Not Taken Up Loan Set In System',
      description: 'Notify when approved loans are not taken up',
      category: 'loan',
      icon: <Clock className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'Your approved loan {loanNumber} expires on {expiryDate}. Please collect it soon.'
    },
    {
      id: 'repayment_confirmation',
      name: 'Add Repayment Confirmation',
      description: 'Confirm when repayments are received',
      category: 'loan',
      icon: <DollarSign className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: false,
      template: 'Payment received: ZMW {amount} for loan {loanNumber}. Remaining balance: ZMW {balance}'
    },
    {
      id: 'savings_transaction',
      name: 'Add Savings Transaction Confirmation',
      description: 'Confirm savings account transactions',
      category: 'savings',
      icon: <PiggyBank className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: false,
      template: 'Savings transaction: ZMW {amount}. New balance: ZMW {balance}'
    },
    {
      id: 'borrower_birthday',
      name: 'Borrower Birthdays',
      description: 'Send birthday wishes to borrowers',
      category: 'borrower',
      icon: <Calendar className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Happy Birthday {firstName}! Wishing you a wonderful year ahead from LoanSphere.'
    },
    {
      id: 'investor_loan_added',
      name: 'Investor - Open Loan Investment Added',
      description: 'Notify investors when new loans are available',
      category: 'investor',
      icon: <TrendingUp className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'New investment opportunity: Loan {loanNumber} for ZMW {amount} at {interestRate}% interest'
    },
    {
      id: 'investor_transaction',
      name: 'Investor - Add Investor Account Transaction Confirmation',
      description: 'Confirm investor account transactions',
      category: 'investor',
      icon: <DollarSign className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'Investment transaction: ZMW {amount}. Portfolio balance: ZMW {balance}'
    },
    {
      id: 'borrower_added',
      name: 'Add Borrower Confirmation',
      description: 'Welcome new borrowers to the system',
      category: 'borrower',
      icon: <Users className="h-4 w-4" />,
      smsEnabled: true,
      emailEnabled: true,
      template: 'Welcome to LoanSphere, {firstName}! Your account has been created successfully.'
    },
    {
      id: 'monthly_loan_statement',
      name: 'Send Monthly Individual Loan Statement',
      description: 'Monthly loan statements for borrowers',
      category: 'loan',
      icon: <FileText className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'Your monthly loan statement for {month} is ready. Outstanding balance: ZMW {balance}'
    },
    {
      id: 'monthly_savings_balance',
      name: 'Send Monthly Savings Balance',
      description: 'Monthly savings account balance updates',
      category: 'savings',
      icon: <PiggyBank className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'Your savings balance for {month}: ZMW {balance}. Interest earned: ZMW {interest}'
    },
    {
      id: 'monthly_investor_balance',
      name: 'Send Monthly Investor Account Balance',
      description: 'Monthly investor portfolio updates',
      category: 'investor',
      icon: <TrendingUp className="h-4 w-4" />,
      smsEnabled: false,
      emailEnabled: true,
      template: 'Your investment portfolio for {month}: ZMW {balance}. Returns: ZMW {returns}'
    }
  ]);

  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: true
  });

  const [emailSettings, setEmailSettings] = useState({
    provider: 'sendgrid',
    apiKey: '',
    fromEmail: 'notifications@loansphere.world',
    fromName: 'LoanSphere',
    enabled: true
  });

  const toggleNotification = (id: string, type: 'sms' | 'email') => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, [`${type}Enabled`]: !setting[`${type}Enabled`] }
          : setting
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'loan': return 'bg-blue-100 text-blue-800';
      case 'borrower': return 'bg-green-100 text-green-800';
      case 'investor': return 'bg-purple-100 text-purple-800';
      case 'savings': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loan': return <CreditCard className="h-4 w-4" />;
      case 'borrower': return <Users className="h-4 w-4" />;
      case 'investor': return <TrendingUp className="h-4 w-4" />;
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const groupedSettings = notificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communications Management</h2>
          <p className="text-gray-600">Manage automated SMS and email notifications for your lending platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-gray-500" />
          <MessageSquare className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sms">SMS Settings</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Categories</CardTitle>
              <CardDescription>
                Configure which events trigger SMS and email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedSettings).map(([category, settings]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <h3 className="text-lg font-semibold capitalize">{category} Notifications</h3>
                    <Badge variant="outline" className={getCategoryColor(category)}>
                      {settings.length} events
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {settings.map((setting) => (
                      <Card key={setting.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {setting.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{setting.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                <Label htmlFor={`sms-${setting.id}`} className="text-sm font-medium">SMS</Label>
                                <button
                                  onClick={() => toggleNotification(setting.id, 'sms')}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    setting.smsEnabled ? 'bg-green-600' : 'bg-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      setting.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <Label htmlFor={`email-${setting.id}`} className="text-sm font-medium">Email</Label>
                                <button
                                  onClick={() => toggleNotification(setting.id, 'email')}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    setting.emailEnabled ? 'bg-green-600' : 'bg-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      setting.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>
                Configure your SMS provider settings for automated messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                <button
                  onClick={() => setSmsSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    smsSettings.enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      smsSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-provider">SMS Provider</Label>
                  <Select value={smsSettings.provider} onValueChange={(value) => setSmsSettings(prev => ({ ...prev, provider: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                      <SelectItem value="africas_talking">Africa's Talking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-number">From Number</Label>
                  <Input
                    id="from-number"
                    placeholder="+260123456789"
                    value={smsSettings.fromNumber}
                    onChange={(e) => setSmsSettings(prev => ({ ...prev, fromNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-sid">Account SID</Label>
                  <Input
                    id="account-sid"
                    placeholder="Your Twilio Account SID"
                    value={smsSettings.accountSid}
                    onChange={(e) => setSmsSettings(prev => ({ ...prev, accountSid: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auth-token">Auth Token</Label>
                  <Input
                    id="auth-token"
                    type="password"
                    placeholder="Your Twilio Auth Token"
                    value={smsSettings.authToken}
                    onChange={(e) => setSmsSettings(prev => ({ ...prev, authToken: e.target.value }))}
                  />
                </div>
              </div>

              <Button className="bg-green-600 hover:bg-green-700">
                Save SMS Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure your email provider settings for automated messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                <button
                  onClick={() => setEmailSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailSettings.enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-provider">Email Provider</Label>
                  <Select value={emailSettings.provider} onValueChange={(value) => setEmailSettings(prev => ({ ...prev, provider: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Your SendGrid API Key"
                    value={emailSettings.apiKey}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    placeholder="notifications@loansphere.world"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    placeholder="LoanSphere"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
              </div>

              <Button className="bg-green-600 hover:bg-green-700">
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Customize notification templates with dynamic variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Available Variables</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
                  <span>{'{firstName}'}</span>
                  <span>{'{lastName}'}</span>
                  <span>{'{amount}'}</span>
                  <span>{'{loanNumber}'}</span>
                  <span>{'{dueDate}'}</span>
                  <span>{'{balance}'}</span>
                  <span>{'{interestRate}'}</span>
                  <span>{'{maturityDate}'}</span>
                </div>
              </div>

              {notificationSettings.slice(0, 3).map((setting) => (
                <Card key={setting.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      {setting.icon}
                      <CardTitle className="text-base">{setting.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`template-${setting.id}`}>Message Template</Label>
                      <Textarea
                        id={`template-${setting.id}`}
                        placeholder="Enter your message template..."
                        value={setting.template}
                        onChange={(e) => {
                          setNotificationSettings(prev =>
                            prev.map(s => s.id === setting.id ? { ...s, template: e.target.value } : s)
                          );
                        }}
                        rows={3}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Save Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};