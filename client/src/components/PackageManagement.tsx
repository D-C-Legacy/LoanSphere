import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, Edit, Trash2, Users, Building, CreditCard, PiggyBank, 
  DollarSign, Check, X, Save, AlertTriangle 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { subscriptionPlans, type SubscriptionPlan } from "@shared/subscriptionPlans";

interface PackageFormData {
  name: string;
  description: string;
  monthlyPriceZMW: number;
  annualPriceZMW: number;
  maxBranches: number;
  maxUsers: number;
  maxLoans: number;
  maxSavings: number;
  isPopular: boolean;
  features: string[];
}

export const PackageManagement = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    description: "",
    monthlyPriceZMW: 0,
    annualPriceZMW: 0,
    maxBranches: 1,
    maxUsers: 1,
    maxLoans: 100,
    maxSavings: 50,
    isPopular: false,
    features: ["14-day free trial", "All core lending features included"]
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ["/api/admin/packages"],
  });

  const createPackageMutation = useMutation({
    mutationFn: async (packageData: PackageFormData) => {
      return await apiRequest("/api/admin/packages", {
        method: "POST",
        body: JSON.stringify({
          ...packageData,
          monthlyPrice: `ZMW ${packageData.monthlyPriceZMW.toLocaleString()}`,
          annualPrice: `ZMW ${packageData.annualPriceZMW.toLocaleString()}`,
          annualDiscount: "17%"
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Package Created",
        description: "New subscription package has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, packageData }: { id: string, packageData: PackageFormData }) => {
      return await apiRequest(`/api/admin/packages/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...packageData,
          monthlyPrice: `ZMW ${packageData.monthlyPriceZMW.toLocaleString()}`,
          annualPrice: `ZMW ${packageData.annualPriceZMW.toLocaleString()}`,
          annualDiscount: "17%"
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      resetForm();
      toast({
        title: "Package Updated",
        description: "Subscription package has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/packages/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      toast({
        title: "Package Deleted",
        description: "Subscription package has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      monthlyPriceZMW: 0,
      annualPriceZMW: 0,
      maxBranches: 1,
      maxUsers: 1,
      maxLoans: 100,
      maxSavings: 50,
      isPopular: false,
      features: ["14-day free trial", "All core lending features included"]
    });
  };

  const handleEdit = (pkg: SubscriptionPlan) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      monthlyPriceZMW: pkg.monthlyPriceZMW,
      annualPriceZMW: pkg.annualPriceZMW,
      maxBranches: pkg.maxBranches,
      maxUsers: pkg.maxUsers,
      maxLoans: pkg.maxLoans,
      maxSavings: pkg.maxSavings,
      isPopular: pkg.isPopular || false,
      features: pkg.features
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.name, packageData: formData });
    } else {
      createPackageMutation.mutate(formData);
    }
  };

  const formatNumber = (num: number) => {
    if (num === -1) return "Unlimited";
    return num.toLocaleString();
  };

  const currentPackages = packages || subscriptionPlans;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Packages</h2>
          <p className="text-muted-foreground">Manage pricing plans for lenders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
              <DialogDescription>
                Add a new subscription package for lenders
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Chipatala"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="For small community lenders"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyPrice">Monthly Price (ZMW)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={formData.monthlyPriceZMW}
                    onChange={(e) => setFormData({ ...formData, monthlyPriceZMW: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="annualPrice">Annual Price (ZMW)</Label>
                  <Input
                    id="annualPrice"
                    type="number"
                    value={formData.annualPriceZMW}
                    onChange={(e) => setFormData({ ...formData, annualPriceZMW: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="maxBranches">Max Branches</Label>
                  <Input
                    id="maxBranches"
                    type="number"
                    value={formData.maxBranches === -1 ? "" : formData.maxBranches}
                    onChange={(e) => setFormData({ ...formData, maxBranches: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers === -1 ? "" : formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoans">Max Loans</Label>
                  <Input
                    id="maxLoans"
                    type="number"
                    value={formData.maxLoans === -1 ? "" : formData.maxLoans}
                    onChange={(e) => setFormData({ ...formData, maxLoans: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSavings">Max Savings</Label>
                  <Input
                    id="maxSavings"
                    type="number"
                    value={formData.maxSavings === -1 ? "" : formData.maxSavings}
                    onChange={(e) => setFormData({ ...formData, maxSavings: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  id="isPopular"
                  type="button"
                  variant={formData.isPopular ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, isPopular: !formData.isPopular })}
                  className={formData.isPopular ? "bg-loansphere-green hover:bg-loansphere-green/90" : ""}
                >
                  {formData.isPopular ? "Popular" : "Standard"}
                </Button>
                <Label htmlFor="isPopular">Mark as Popular</Label>
              </div>

              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  rows={6}
                  placeholder="14-day free trial&#10;All core lending features included&#10;Loan management system"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPackageMutation.isPending}>
                  {createPackageMutation.isPending ? "Creating..." : "Create Package"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentPackages.map((pkg: SubscriptionPlan, index: number) => (
          <Card key={pkg.name} className={`relative ${pkg.isPopular ? 'border-loansphere-green border-2' : ''}`}>
            {pkg.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-loansphere-green text-white">POPULAR</Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => deletePackageMutation.mutate(pkg.name)}
                    disabled={deletePackageMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{pkg.description}</CardDescription>
              <div className="text-2xl font-bold">{pkg.monthlyPrice}/month</div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{formatNumber(pkg.maxBranches)} Branch{pkg.maxBranches !== 1 ? 'es' : ''}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-loansphere-green" />
                    <span>{formatNumber(pkg.maxUsers)} User{pkg.maxUsers !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{formatNumber(pkg.maxLoans)} Loans</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <PiggyBank className="h-4 w-4 mr-2 text-green-500" />
                    <span>{formatNumber(pkg.maxSavings)} Savings</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {pkg.features.slice(0, 3).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start text-sm">
                    <Check className="h-3 w-3 text-loansphere-green mr-2 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {pkg.features.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    + {pkg.features.length - 3} more features
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update the subscription package details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Package Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-monthlyPrice">Monthly Price (ZMW)</Label>
                <Input
                  id="edit-monthlyPrice"
                  type="number"
                  value={formData.monthlyPriceZMW}
                  onChange={(e) => setFormData({ ...formData, monthlyPriceZMW: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-annualPrice">Annual Price (ZMW)</Label>
                <Input
                  id="edit-annualPrice"
                  type="number"
                  value={formData.annualPriceZMW}
                  onChange={(e) => setFormData({ ...formData, annualPriceZMW: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="edit-maxBranches">Max Branches</Label>
                <Input
                  id="edit-maxBranches"
                  type="number"
                  value={formData.maxBranches === -1 ? "" : formData.maxBranches}
                  onChange={(e) => setFormData({ ...formData, maxBranches: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxUsers">Max Users</Label>
                <Input
                  id="edit-maxUsers"
                  type="number"
                  value={formData.maxUsers === -1 ? "" : formData.maxUsers}
                  onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxLoans">Max Loans</Label>
                <Input
                  id="edit-maxLoans"
                  type="number"
                  value={formData.maxLoans === -1 ? "" : formData.maxLoans}
                  onChange={(e) => setFormData({ ...formData, maxLoans: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxSavings">Max Savings</Label>
                <Input
                  id="edit-maxSavings"
                  type="number"
                  value={formData.maxSavings === -1 ? "" : formData.maxSavings}
                  onChange={(e) => setFormData({ ...formData, maxSavings: e.target.value === "" ? -1 : parseInt(e.target.value) })}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                id="edit-isPopular"
                type="button"
                variant={formData.isPopular ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData({ ...formData, isPopular: !formData.isPopular })}
                className={formData.isPopular ? "bg-loansphere-green hover:bg-loansphere-green/90" : ""}
              >
                {formData.isPopular ? "Popular" : "Standard"}
              </Button>
              <Label htmlFor="edit-isPopular">Mark as Popular</Label>
            </div>

            <div>
              <Label htmlFor="edit-features">Features (one per line)</Label>
              <Textarea
                id="edit-features"
                value={formData.features.join('\n')}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                rows={6}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePackageMutation.isPending}>
                {updatePackageMutation.isPending ? "Updating..." : "Update Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};