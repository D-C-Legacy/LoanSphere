
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Shield,
  Database,
  TrendingUp,
  DollarSign,
  UserCheck,
  Calendar,
  MessageSquare,
  Briefcase,
  PieChart,
  Activity,
  Target,
  Package,
  Wallet,
  Handshake,
  Receipt,
} from "lucide-react";

interface LenderSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
      { id: "portfolio", label: "Portfolio Overview", icon: PieChart },
      { id: "offline-lending", label: "Offline-First Lending OS", icon: TrendingUp },
      { id: "lms", label: "Full LMS Suite", icon: Database },
    ]
  },
  {
    label: "Loan Management",
    items: [
      { id: "applications", label: "Loans", icon: FileText },
    ]
  },
  {
    label: "Customer Management",
    items: [
      { id: "borrowers", label: "Borrower Management", icon: Users },
      { id: "documents", label: "Document Center", icon: FileText },
      { id: "communications", label: "Communications", icon: MessageSquare },
    ]
  },
  {
    label: "Organization",
    items: [
      { id: "branches", label: "Branch Management", icon: Briefcase },
      { id: "user-roles", label: "User Roles & Staff", icon: UserCheck },
    ]
  },
  {
    label: "Financial Operations",
    items: [
      { id: "disbursement", label: "Disbursement", icon: CreditCard },
      { id: "payments", label: "Payment Processing", icon: CreditCard },
      { id: "collections", label: "Collections & Delinquency", icon: Target },
      { id: "accounting", label: "Accounting", icon: DollarSign },
      { id: "collateral", label: "Collateral Management", icon: Package },
      { id: "savings", label: "Savings Management", icon: Wallet },
      { id: "investors", label: "Investor Management", icon: Handshake },
      { id: "expenses", label: "Expenses Management", icon: Receipt },
    ]
  },
  {
    label: "Advanced AI & Automation",
    items: [
      { id: "ai-underwriting", label: "AI Cash Flow Underwriting", icon: TrendingUp },
      { id: "field-agents", label: "Field Agent Toolkit", icon: Users },
      { id: "voice-kyc", label: "Voice-Based KYC", icon: MessageSquare },
      { id: "crypto-investment", label: "Crypto Investment", icon: DollarSign },
    ]
  },
  {
    label: "Analytics & Reports",
    items: [
      { id: "analytics", label: "Portfolio Analytics", icon: BarChart3 },
      { id: "reports", label: "Reports & Insights", icon: PieChart },
      { id: "performance", label: "Performance Metrics", icon: Activity },
    ]
  },
  {
    label: "Communications",
    items: [
      { id: "communications", label: "SMS & Email Setup", icon: MessageSquare },
      { id: "notifications", label: "Notifications", icon: Bell },
    ]
  },
  {
    label: "Support & Guidance",
    items: [
      { id: "documents", label: "Document Center", icon: FileText },
    ]
  },
  {
    label: "System",
    items: [
      { id: "compliance", label: "Compliance", icon: Shield },
      { id: "settings", label: "Settings", icon: Settings },
    ]
  }
];

export const LenderSidebar: React.FC<LenderSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">LoanSphere</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Financial Management Platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {menuItems.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {index < menuItems.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
