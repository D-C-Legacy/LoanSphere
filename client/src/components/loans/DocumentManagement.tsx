import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter
} from "lucide-react";

export const DocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock document data
  const documents = [
    {
      id: 1,
      borrowerName: "John Doe",
      applicationId: "APP-2024-001",
      documentType: "Employment Letter",
      fileName: "employment_letter_john_doe.pdf",
      uploadedAt: "2024-01-15T10:30:00Z",
      status: "verified",
      fileSize: "245 KB"
    },
    {
      id: 2,
      borrowerName: "John Doe",
      applicationId: "APP-2024-001",
      documentType: "Salary Slip",
      fileName: "salary_slip_december_2023.pdf",
      uploadedAt: "2024-01-15T10:32:00Z",
      status: "pending",
      fileSize: "189 KB"
    },
    {
      id: 3,
      borrowerName: "Jane Smith",
      applicationId: "APP-2024-002",
      documentType: "NRC Copy",
      fileName: "nrc_jane_smith.jpg",
      uploadedAt: "2024-01-14T15:45:00Z",
      status: "verified",
      fileSize: "1.2 MB"
    },
    {
      id: 4,
      borrowerName: "Jane Smith",
      applicationId: "APP-2024-002",
      documentType: "Bank Statement",
      fileName: "bank_statement_3months.pdf",
      uploadedAt: "2024-01-14T15:47:00Z",
      status: "rejected",
      fileSize: "3.5 MB"
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(doc => doc.status === "pending").length,
    verified: documents.filter(doc => doc.status === "verified").length,
    rejected: documents.filter(doc => doc.status === "rejected").length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Management</h2>
        <p className="text-muted-foreground">
          Review and manage borrower documents for loan applications
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">All Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All uploaded documents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting verification</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verified}</div>
                <p className="text-xs text-muted-foreground">Successfully verified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Need replacement</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest document submissions requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents
                  .filter(doc => doc.status === "pending")
                  .slice(0, 3)
                  .map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.documentType}</p>
                          <p className="text-sm text-muted-foreground">{doc.borrowerName} • {doc.applicationId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(doc.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            {doc.status}
                          </div>
                        </Badge>
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by borrower name, document type, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <Card key={doc.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <FileText className="h-8 w-8 text-muted-foreground mt-1" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{doc.documentType}</h3>
                          <Badge className={getStatusColor(doc.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(doc.status)}
                              {doc.status}
                            </div>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Borrower:</span> {doc.borrowerName}
                          </div>
                          <div>
                            <span className="font-medium">Application:</span> {doc.applicationId}
                          </div>
                          <div>
                            <span className="font-medium">File Size:</span> {doc.fileSize}
                          </div>
                          <div>
                            <span className="font-medium">Uploaded:</span> {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {doc.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};