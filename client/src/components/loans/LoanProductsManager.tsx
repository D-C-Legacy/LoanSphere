import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, ToggleLeft, ToggleRight } from "lucide-react";
import { SimpleLoanProductForm } from "./SimpleLoanProductForm";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPlanLimits } from "@shared/subscriptionPlans";
import { useToast } from "@/hooks/use-toast";

interface LoanProduct {
  id: number;
  title: string;
  description: string;
  loanType: string;
  minAmount: string;
  maxAmount: string;
  interestRate: string;
  minTerm: number;
  maxTerm: number;
  requirements: string;
  isActive: boolean;
  createdAt: string;
}

export const LoanProductsManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get user's subscription plan limits
  const userPlan = user?.subscriptionPlan || 'starter';
  const planLimits = getPlanLimits(userPlan);

  const { data: loanProducts = [], isLoading } = useQuery({
    queryKey: ['/api/loan-products/lender', user?.id],
    enabled: !!user?.id,
  });

  const toggleProductMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/loan-products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loan-products/lender', user?.id] });
    },
  });

  const handleToggleProduct = (id: number, currentStatus: boolean) => {
    toggleProductMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleProductCreated = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/loan-products/lender', user?.id] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Loan Products</h2>
          <p className="text-gray-600">
            Manage your loan offerings ({Array.isArray(loanProducts) ? loanProducts.length : 0}
            {planLimits?.maxLoanProducts !== -1 ? `/${planLimits?.maxLoanProducts}` : ''} used)
          </p>
        </div>
        <Button 
          onClick={() => {
            if (planLimits && planLimits.maxLoanProducts !== -1 && Array.isArray(loanProducts) && loanProducts.length >= planLimits.maxLoanProducts) {
              toast({
                title: "Plan Limit Reached",
                description: `You've reached the maximum of ${planLimits.maxLoanProducts} loan products for your ${userPlan} plan. Upgrade to create more.`,
                variant: "destructive",
              });
              return;
            }
            setShowCreateForm(true);
          }} 
          className="bg-loansphere-green hover:bg-loansphere-green/90"
          disabled={planLimits && planLimits.maxLoanProducts !== -1 && Array.isArray(loanProducts) && loanProducts.length >= planLimits.maxLoanProducts}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Product
        </Button>
      </div>

      {showCreateForm && (
        <SimpleLoanProductForm
          lenderId={user?.id || 0}
          onSuccess={handleProductCreated}
        />
      )}

      {loanProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No loan products yet</h3>
              <p>Create your first loan product to start accepting applications</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-loansphere-green hover:bg-loansphere-green/90"
            >
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {loanProducts.map((product: LoanProduct) => (
            <Card key={product.id} className={`transition-all ${product.isActive ? 'border-green-200' : 'border-gray-200 opacity-75'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {product.title}
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleProduct(product.id, product.isActive)}
                      disabled={toggleProductMutation.isPending}
                    >
                      {product.isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount Range</span>
                    <div className="font-medium">K{product.minAmount} - K{product.maxAmount}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Interest Rate</span>
                    <div className="font-medium">{product.interestRate}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Term Range</span>
                    <div className="font-medium">{product.minTerm} - {product.maxTerm} months</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Type</span>
                    <div className="font-medium capitalize">{product.loanType.replace('_', ' ')}</div>
                  </div>
                </div>
                
                {product.requirements && (
                  <div>
                    <span className="text-gray-500 text-sm">Requirements:</span>
                    <p className="text-sm mt-1">{product.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};