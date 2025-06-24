import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Search,
  BookOpen,
  Video,
  HelpCircle,
  ExternalLink,
  Clock,
  Star,
  Users,
  DollarSign,
  BarChart3,
  Phone,
  MessageSquare,
  Shield,
  Settings,
  Zap
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "pdf" | "video" | "guide";
  fileSize?: string;
  duration?: string;
  lastUpdated: string;
  downloadUrl: string;
  isPopular?: boolean;
  icon: React.ReactNode;
}

const documents: Document[] = [
  {
    id: "quick-start",
    title: "LoanSphere Quick Start Guide",
    description: "Complete setup guide for new lenders including account configuration, first loan product setup, and basic operations.",
    category: "Getting Started",
    type: "pdf",
    fileSize: "2.4 MB",
    lastUpdated: "2025-06-16",
    downloadUrl: "/docs/loansphere-quick-start-guide.pdf",
    isPopular: true,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: "user-manual",
    title: "Complete User Manual",
    description: "Comprehensive 150+ page manual covering all features, modules, and best practices for lending operations in Zambia.",
    category: "Complete Guide",
    type: "pdf",
    fileSize: "12.8 MB",
    lastUpdated: "2025-06-16",
    downloadUrl: "/docs/loansphere-complete-manual.pdf",
    isPopular: true,
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: "borrower-management",
    title: "Borrower Management Guide",
    description: "Step-by-step guide for customer onboarding, KYC processes, and maintaining borrower relationships.",
    category: "Customer Management",
    type: "pdf",
    fileSize: "3.1 MB",
    lastUpdated: "2025-06-15",
    downloadUrl: "/docs/borrower-management-guide.pdf",
    icon: <Users className="w-5 h-5" />
  },
  {
    id: "loan-products",
    title: "Loan Products Configuration",
    description: "Guide to creating and managing loan products, interest calculations, and approval workflows.",
    category: "Loan Management",
    type: "pdf",
    fileSize: "2.8 MB",
    lastUpdated: "2025-06-15",
    downloadUrl: "/docs/loan-products-guide.pdf",
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: "mobile-money",
    title: "Mobile Money Integration Setup",
    description: "Complete guide for integrating MTN, Airtel, and Zamtel mobile money services for disbursements and collections.",
    category: "Financial Operations",
    type: "pdf",
    fileSize: "4.2 MB",
    lastUpdated: "2025-06-14",
    downloadUrl: "/docs/mobile-money-integration.pdf",
    isPopular: true,
    icon: <DollarSign className="w-5 h-5" />
  },
  {
    id: "offline-operations",
    title: "Offline-First Operations Manual",
    description: "Comprehensive guide for USSD, WhatsApp, IVR, and field agent operations for banking the unbanked.",
    category: "Offline Channels",
    type: "pdf",
    fileSize: "6.7 MB",
    lastUpdated: "2025-06-16",
    downloadUrl: "/docs/offline-operations-manual.pdf",
    isPopular: true,
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: "accounting-reports",
    title: "Financial Reporting & Analytics",
    description: "Guide to generating financial reports, understanding KPIs, and using the accounting dashboard effectively.",
    category: "Financial Management",
    type: "pdf",
    fileSize: "3.9 MB",
    lastUpdated: "2025-06-13",
    downloadUrl: "/docs/financial-reporting-guide.pdf",
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: "staff-security",
    title: "Staff Management & Security",
    description: "Complete guide for user roles, permissions, staff management, and security best practices.",
    category: "Security & Access",
    type: "pdf",
    fileSize: "2.6 MB",
    lastUpdated: "2025-06-12",
    downloadUrl: "/docs/staff-security-guide.pdf",
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: "communications",
    title: "Communications & Notifications",
    description: "Setup guide for SMS, email notifications, and automated customer communications throughout the loan lifecycle.",
    category: "Customer Engagement",
    type: "pdf",
    fileSize: "2.3 MB",
    lastUpdated: "2025-06-11",
    downloadUrl: "/docs/communications-guide.pdf",
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    id: "api-integration",
    title: "API Integration Documentation",
    description: "Technical documentation for integrating with external systems, webhooks, and third-party services.",
    category: "Technical",
    type: "pdf",
    fileSize: "5.1 MB",
    lastUpdated: "2025-06-10",
    downloadUrl: "/docs/api-integration-docs.pdf",
    icon: <Settings className="w-5 h-5" />
  }
];

const categories = [
  "All Documents",
  "Getting Started",
  "Complete Guide",
  "Customer Management",
  "Loan Management", 
  "Financial Operations",
  "Offline Channels",
  "Financial Management",
  "Security & Access",
  "Customer Engagement",
  "Technical"
];

export const DocumentCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [activeTab, setActiveTab] = useState("documents");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Documents" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularDocuments = documents.filter(doc => doc.isPopular);

  const handleDownload = (doc: Document) => {
    // In a real implementation, this would trigger the PDF download
    window.open(doc.downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
          <p className="text-gray-600 mt-2">
            Access comprehensive guides, manuals, and documentation for LoanSphere
          </p>
        </div>
        <Badge variant="secondary" className="bg-loansphere-green/10 text-loansphere-green">
          {documents.length} Documents Available
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">All Documents</TabsTrigger>
          <TabsTrigger value="popular">Popular Guides</TabsTrigger>
          <TabsTrigger value="quick-help">Quick Help</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-loansphere-green hover:bg-loansphere-green/90" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-loansphere-green/10 rounded-lg">
                        {doc.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{doc.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                          {doc.isPopular && (
                            <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      {doc.fileSize && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {doc.fileSize}
                        </span>
                      )}
                      {doc.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.duration}
                        </span>
                      )}
                    </div>
                    <span>Updated {doc.lastUpdated}</span>
                  </div>
                  <Button 
                    onClick={() => handleDownload(doc)}
                    className="w-full bg-loansphere-green hover:bg-loansphere-green/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {doc.type.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {popularDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-loansphere-green/10 rounded-lg">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{doc.title}</CardTitle>
                      <Badge variant="default" className="mt-2 bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Most Downloaded
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{doc.category}</Badge>
                    <span className="text-sm text-gray-500">{doc.fileSize}</span>
                  </div>
                  <Button 
                    onClick={() => handleDownload(doc)}
                    className="w-full bg-loansphere-green hover:bg-loansphere-green/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quick-help" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Quick Start Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-loansphere-green rounded-full"></div>
                    <span className="text-sm">Complete lender profile setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-loansphere-green rounded-full"></div>
                    <span className="text-sm">Configure first loan product</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-loansphere-green rounded-full"></div>
                    <span className="text-sm">Set up branch information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Add staff members and roles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Configure mobile money integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Video Tutorials (Coming Soon)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Community Forum
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    API Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-loansphere-green pl-4">
                  <h4 className="font-medium">How do I add my first borrower?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Navigate to Borrower Management, click "Add New Borrower", and follow the step-by-step KYC process.
                  </p>
                </div>
                <div className="border-l-4 border-loansphere-green pl-4">
                  <h4 className="font-medium">Can I integrate with mobile money services?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Yes, LoanSphere supports MTN, Airtel, and Zamtel mobile money for both disbursements and collections.
                  </p>
                </div>
                <div className="border-l-4 border-loansphere-green pl-4">
                  <h4 className="font-medium">How do offline operations work?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Use USSD codes, WhatsApp Business, IVR systems, and field agents to serve customers without internet access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};