export interface Investment {
  id: number;
  investorId: number;
  lenderId: number;
  amount: number;
  expectedReturn: number;
  actualReturn: number;
  duration: number; // months
  status: 'active' | 'completed' | 'defaulted';
  startDate: Date;
  endDate: Date;
  riskLevel: 'low' | 'medium' | 'high';
  lenderInfo: {
    name: string;
    creditScore: number;
    portfolioSize: number;
    defaultRate: number;
  };
}

export interface InvestmentPortfolio {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  averageReturn: number;
  activeInvestments: number;
  completedInvestments: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  monthlyIncome: number;
}

export class InvestmentService {
  static calculateExpectedReturn(
    amount: number, 
    annualRate: number, 
    durationMonths: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    return amount * Math.pow(1 + monthlyRate, durationMonths) - amount;
  }

  static calculateROI(invested: number, returned: number): number {
    return ((returned - invested) / invested) * 100;
  }

  static assessLenderRisk(lender: {
    creditScore: number;
    portfolioSize: number;
    defaultRate: number;
    yearsActive: number;
  }): { riskLevel: 'low' | 'medium' | 'high'; riskScore: number; factors: string[] } {
    let riskScore = 50; // Base neutral score
    const factors: string[] = [];

    // Credit score impact (30%)
    if (lender.creditScore >= 750) {
      riskScore -= 15;
      factors.push('Excellent credit score');
    } else if (lender.creditScore >= 650) {
      riskScore -= 5;
      factors.push('Good credit score');
    } else {
      riskScore += 10;
      factors.push('Below average credit score');
    }

    // Portfolio size impact (25%)
    if (lender.portfolioSize >= 1000000) {
      riskScore -= 10;
      factors.push('Large portfolio');
    } else if (lender.portfolioSize >= 500000) {
      riskScore -= 5;
      factors.push('Medium portfolio');
    } else {
      riskScore += 5;
      factors.push('Small portfolio');
    }

    // Default rate impact (30%)
    if (lender.defaultRate <= 2) {
      riskScore -= 15;
      factors.push('Low default rate');
    } else if (lender.defaultRate <= 5) {
      riskScore -= 5;
      factors.push('Average default rate');
    } else {
      riskScore += 15;
      factors.push('High default rate');
    }

    // Experience impact (15%)
    if (lender.yearsActive >= 5) {
      riskScore -= 8;
      factors.push('Experienced lender');
    } else if (lender.yearsActive >= 2) {
      riskScore -= 3;
      factors.push('Moderate experience');
    } else {
      riskScore += 5;
      factors.push('New to lending');
    }

    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore <= 30) riskLevel = 'low';
    else if (riskScore <= 60) riskLevel = 'medium';
    else riskLevel = 'high';

    return { riskLevel, riskScore, factors };
  }

  static getRecommendedPortfolioAllocation(
    totalAmount: number,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ): { low: number; medium: number; high: number } {
    const allocations = {
      conservative: { low: 0.70, medium: 0.25, high: 0.05 },
      moderate: { low: 0.50, medium: 0.35, high: 0.15 },
      aggressive: { low: 0.30, medium: 0.40, high: 0.30 }
    };

    const allocation = allocations[riskTolerance];
    return {
      low: totalAmount * allocation.low,
      medium: totalAmount * allocation.medium,
      high: totalAmount * allocation.high
    };
  }

  static calculateDiversificationScore(investments: Investment[]): {
    score: number;
    recommendations: string[];
  } {
    if (investments.length === 0) {
      return { score: 0, recommendations: ['Start investing to build diversification'] };
    }

    let score = 0;
    const recommendations: string[] = [];

    // Lender diversification (40 points)
    const uniqueLenders = new Set(investments.map(inv => inv.lenderId)).size;
    const lenderDiversification = Math.min(uniqueLenders / 10, 1) * 40;
    score += lenderDiversification;

    if (uniqueLenders < 5) {
      recommendations.push('Invest in more lenders to reduce concentration risk');
    }

    // Risk diversification (30 points)
    const riskCounts = investments.reduce((acc, inv) => {
      acc[inv.riskLevel]++;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    const totalInvestments = investments.length;
    const riskBalance = 1 - Math.abs(0.5 - (riskCounts.medium / totalInvestments));
    score += riskBalance * 30;

    // Amount diversification (30 points)
    const amounts = investments.map(inv => inv.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((acc, amount) => acc + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
    const coefficient = Math.sqrt(variance) / avgAmount;
    const amountDiversification = Math.max(0, 1 - coefficient) * 30;
    score += amountDiversification;

    if (coefficient > 0.5) {
      recommendations.push('Consider more consistent investment amounts');
    }

    return { score: Math.round(score), recommendations };
  }

  static projectFutureReturns(
    monthlyInvestment: number,
    expectedAnnualReturn: number,
    years: number
  ): { totalInvested: number; projectedValue: number; totalReturns: number } {
    const monthlyReturn = expectedAnnualReturn / 100 / 12;
    const months = years * 12;
    
    // Future value of monthly investments (annuity)
    const futureValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    
    const totalInvested = monthlyInvestment * months;
    const totalReturns = futureValue - totalInvested;

    return {
      totalInvested,
      projectedValue: futureValue,
      totalReturns
    };
  }
}