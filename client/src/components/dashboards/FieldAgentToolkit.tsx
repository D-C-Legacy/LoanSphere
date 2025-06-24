import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Camera, MapPin, Users, Upload, Scan, Download, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FieldAgent {
  id: string;
  name: string;
  phoneNumber: string;
  region: string;
  activeLoans: number;
  collectionsToday: number;
  documentsScanToday: number;
  lastSync: string;
  gpsLocation: {
    lat: number;
    lng: number;
  };
  isOnline: boolean;
}

interface DocumentScan {
  id: string;
  agentId: string;
  agentName: string;
  documentType: string;
  borrowerName: string;
  extractedData: {
    income?: string;
    employer?: string;
    date?: string;
    amount?: string;
  };
  confidence: number;
  status: "processed" | "reviewing" | "approved" | "rejected";
  scanTime: string;
}

interface CashCollectionZone {
  id: string;
  name: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  marketDays: string[];
  averageCashAvailability: number;
  successfulCollections: number;
  totalAttempts: number;
  lastUpdated: string;
}

export const FieldAgentToolkit = () => {
  const [activeTab, setActiveTab] = useState("agents");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch field agents data
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["/api/field-agents", selectedRegion],
  });

  // Fetch document scans data
  const { data: documentScans = [], isLoading: loadingScans } = useQuery({
    queryKey: ["/api/field-agents/document-scans"],
  });

  // Fetch cash collection zones data
  const { data: collectionZones = [], isLoading: loadingZones } = useQuery({
    queryKey: ["/api/field-agents/cash-zones"],
  });

  // Sync agent data mutation
  const syncAgentMutation = useMutation({
    mutationFn: (agentId: string) => apiRequest(`/api/field-agents/${agentId}/sync`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/field-agents"] });
      toast({ title: "Success", description: "Agent data synchronized successfully" });
    },
  });

  // Approve document scan mutation
  const approveDocumentMutation = useMutation({
    mutationFn: (scanId: string) => apiRequest(`/api/field-agents/document-scans/${scanId}/approve`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/field-agents/document-scans"] });
      toast({ title: "Success", description: "Document scan approved" });
    },
  });

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "text-green-600" : "text-gray-400";
  };

  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? 
      <Badge className="bg-green-100 text-green-800">Online</Badge> : 
      <Badge variant="secondary">Offline</Badge>;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const zambian_regions = [
    "Lusaka", "Copperbelt", "Central", "Eastern", "Northern", 
    "North-Western", "Southern", "Western", "Luapula", "Muchinga"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Field Agent Toolkit</h2>
          <p className="text-muted-foreground">
            AR document scanning, cash collection mapping, and offline operations
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Camera className="h-4 w-4 mr-1" />
          AR-Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Field Agents
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            AR Document Scan
          </TabsTrigger>
          <TabsTrigger value="cash-zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Cash Collection Map
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Agent Management</CardTitle>
              <CardDescription>
                Monitor field agents across Zambian provinces with real-time GPS tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="region-filter">Filter by Region</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {zambian_regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="space-y-4">
                {agents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Field Agents Configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Set up field agents to enable offline loan origination and document collection.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Users className="h-4 w-4 mr-2" />
                      Add Field Agent
                    </Button>
                  </div>
                ) : (
                  agents.map((agent: FieldAgent) => (
                    <div key={agent.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold">{agent.name}</h4>
                            <p className="text-sm text-muted-foreground">{agent.phoneNumber}</p>
                          </div>
                          <Badge variant="outline">{agent.region}</Badge>
                          {getStatusBadge(agent.isOnline)}
                        </div>
                        <div className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncAgentMutation.mutate(agent.id)}
                            disabled={syncAgentMutation.isPending}
                          >
                            {syncAgentMutation.isPending ? "Syncing..." : "Sync Data"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Active Loans</p>
                          <p className="font-semibold text-lg">{agent.activeLoans}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Collections Today</p>
                          <p className="font-semibold text-green-600">K{agent.collectionsToday.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Documents Scanned</p>
                          <p className="font-semibold text-blue-600">{agent.documentsScanToday}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Last Sync</p>
                          <p className="font-semibold text-sm">{new Date(agent.lastSync).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        GPS: {agent.gpsLocation.lat.toFixed(4)}, {agent.gpsLocation.lng.toFixed(4)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AR Document Scanner</CardTitle>
              <CardDescription>
                AI-powered document scanning with automatic data extraction from paper documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentScans.length === 0 ? (
                  <div className="text-center py-12">
                    <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Document Scans Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Field agents can use the mobile app to scan payslips, bank statements, and ID documents.
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Automatic text extraction from paper documents</p>
                      <p>• Real-time income verification from payslips</p>
                      <p>• Offline scanning with cloud sync when connected</p>
                    </div>
                  </div>
                ) : (
                  documentScans.map((scan: DocumentScan) => (
                    <div key={scan.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Camera className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-semibold">{scan.borrowerName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {scan.documentType} • Scanned by {scan.agentName}
                            </p>
                          </div>
                          <Badge variant="outline" className={getConfidenceColor(scan.confidence)}>
                            {scan.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={scan.status === "approved" ? "default" : "secondary"}>
                            {scan.status}
                          </Badge>
                          {scan.status === "reviewing" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveDocumentMutation.mutate(scan.id)}
                              disabled={approveDocumentMutation.isPending}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded space-y-2">
                        <h5 className="font-medium text-sm">Extracted Data:</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {scan.extractedData.income && (
                            <div>
                              <span className="text-muted-foreground">Monthly Income:</span>
                              <span className="ml-2 font-semibold">K{scan.extractedData.income}</span>
                            </div>
                          )}
                          {scan.extractedData.employer && (
                            <div>
                              <span className="text-muted-foreground">Employer:</span>
                              <span className="ml-2 font-semibold">{scan.extractedData.employer}</span>
                            </div>
                          )}
                          {scan.extractedData.date && (
                            <div>
                              <span className="text-muted-foreground">Pay Date:</span>
                              <span className="ml-2 font-semibold">{scan.extractedData.date}</span>
                            </div>
                          )}
                          {scan.extractedData.amount && (
                            <div>
                              <span className="text-muted-foreground">Net Pay:</span>
                              <span className="ml-2 font-semibold">K{scan.extractedData.amount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        Scanned: {new Date(scan.scanTime).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-zones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Collection Heatmap</CardTitle>
              <CardDescription>
                Optimal cash collection zones based on market days and borrower availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectionZones.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Collection Zones Mapped</h3>
                    <p className="text-muted-foreground mb-4">
                      Map high-cash-availability zones based on market days and borrower locations.
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Market day scheduling for optimal collection timing</p>
                      <p>• GPS-based route optimization for field agents</p>
                      <p>• Historical success rates by location and time</p>
                    </div>
                  </div>
                ) : (
                  collectionZones.map((zone: CashCollectionZone) => (
                    <div key={zone.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-8 w-8 text-green-600" />
                          <div>
                            <h4 className="font-semibold">{zone.name}</h4>
                            <p className="text-sm text-muted-foreground">{zone.region}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {((zone.successfulCollections / zone.totalAttempts) * 100).toFixed(1)}% success
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Cash Availability</p>
                          <div className="flex items-center gap-2">
                            <Progress value={zone.averageCashAvailability} className="flex-1" />
                            <span className="text-sm font-medium">{zone.averageCashAvailability}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Successful Collections</p>
                          <p className="font-semibold text-green-600">{zone.successfulCollections}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Total Attempts</p>
                          <p className="font-semibold">{zone.totalAttempts}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-2">Market Days:</h5>
                        <div className="flex gap-2">
                          {zone.marketDays.map(day => (
                            <Badge key={day} variant="outline" className="bg-blue-100 text-blue-800">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        GPS: {zone.coordinates.lat.toFixed(4)}, {zone.coordinates.lng.toFixed(4)} • 
                        Updated: {new Date(zone.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Field Agents</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">23</div>
                <p className="text-xs text-muted-foreground">Across 8 provinces</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Scanned Today</CardTitle>
                <Scan className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">127</div>
                <p className="text-xs text-muted-foreground">98% accuracy rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Collections</CardTitle>
                <MapPin className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">K84.2k</div>
                <p className="text-xs text-muted-foreground">+15% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline Operations</CardTitle>
                <Navigation className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">156</div>
                <p className="text-xs text-muted-foreground">Pending sync operations</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Regional Performance Overview</CardTitle>
              <CardDescription>Field agent productivity across Zambian provinces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium border-b pb-2">
                  <div>Province</div>
                  <div>Active Agents</div>
                  <div>Documents Scanned</div>
                  <div>Collections (K)</div>
                  <div>Success Rate</div>
                  <div>Offline Sync</div>
                </div>
                
                {zambian_regions.slice(0, 5).map((region, index) => (
                  <div key={region} className="grid grid-cols-6 gap-4 text-sm py-2">
                    <div className="font-medium">{region}</div>
                    <div>{Math.floor(Math.random() * 8) + 2}</div>
                    <div>{Math.floor(Math.random() * 50) + 10}</div>
                    <div>{(Math.random() * 20 + 5).toFixed(1)}k</div>
                    <div className="text-green-600">{(Math.random() * 20 + 75).toFixed(1)}%</div>
                    <div>{Math.floor(Math.random() * 30)} pending</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};