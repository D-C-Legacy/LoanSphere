export interface DistributorCommission {
  id: number;
  distributorId: number;
  lenderId: number;
  subscriptionPlan: string;
  monthlyAmount: number;
  commissionRate: number;
  commissionAmount: number;
  periodStart: Date;
  periodEnd: Date;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
}

export interface CommissionSummary {
  totalEarned: number;
  pendingAmount: number;
  paidAmount: number;
  totalReferrals: number;
  activeReferrals: number;
  averageCommissionPerReferral: number;
  monthlyRecurring: number;
}

export class CommissionService {
  static calculateCommission(subscriptionAmount: number, plan: string): number {
    const commissionRates = {
      'starter': 0.20,    // 20% commission
      'professional': 0.25, // 25% commission  
      'enterprise': 0.30   // 30% commission
    };
    
    const rate = commissionRates[plan as keyof typeof commissionRates] || 0.20;
    return subscriptionAmount * rate;
  }

  static getCommissionRate(plan: string): number {
    const rates = {
      'starter': 20,
      'professional': 25,
      'enterprise': 30
    };
    return rates[plan as keyof typeof rates] || 20;
  }

  static calculateAnnualCommission(monthlyCommission: number): number {
    return monthlyCommission * 12;
  }

  static getCommissionTier(totalEarned: number): { tier: string; bonus: number; nextTierTarget: number } {
    if (totalEarned >= 100000) {
      return { tier: 'Diamond', bonus: 0.05, nextTierTarget: 0 };
    } else if (totalEarned >= 50000) {
      return { tier: 'Platinum', bonus: 0.03, nextTierTarget: 100000 };
    } else if (totalEarned >= 25000) {
      return { tier: 'Gold', bonus: 0.02, nextTierTarget: 50000 };
    } else if (totalEarned >= 10000) {
      return { tier: 'Silver', bonus: 0.01, nextTierTarget: 25000 };
    } else {
      return { tier: 'Bronze', bonus: 0, nextTierTarget: 10000 };
    }
  }

  static calculateProjectedEarnings(referrals: number, averageSubscription: number): {
    monthly: number;
    annual: number;
    breakdown: { plan: string; count: number; commission: number }[];
  } {
    // Assume distribution: 40% starter, 40% professional, 20% enterprise
    const starter = Math.floor(referrals * 0.4);
    const professional = Math.floor(referrals * 0.4);
    const enterprise = referrals - starter - professional;

    const breakdown = [
      { plan: 'starter', count: starter, commission: starter * this.calculateCommission(150, 'starter') },
      { plan: 'professional', count: professional, commission: professional * this.calculateCommission(300, 'professional') },
      { plan: 'enterprise', count: enterprise, commission: enterprise * this.calculateCommission(500, 'enterprise') }
    ];

    const monthly = breakdown.reduce((sum, item) => sum + item.commission, 0);

    return {
      monthly,
      annual: monthly * 12,
      breakdown
    };
  }
}