export interface CreditData {
  personalInfo: {
    age: number;
    maritalStatus: string;
    dependents: number;
  };
  employment: {
    status: string;
    monthlyIncome: number;
    yearsEmployed: number;
    employer: string;
  };
  financial: {
    existingDebts: number;
    bankBalance: number;
    monthlyExpenses: number;
  };
  loanHistory: {
    previousLoans: number;
    repaymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
    defaultHistory: boolean;
  };
}

export class CreditScoringService {
  static calculateCreditScore(data: CreditData): number {
    let score = 300; // Base score
    
    // Employment status scoring (25%)
    const employmentScores = {
      'employed_civil_servant': 200,
      'employed_private': 150,
      'business_owner': 120,
      'self_employed': 100,
      'retired': 80,
      'unemployed': 0
    };
    score += employmentScores[data.employment.status as keyof typeof employmentScores] || 50;
    
    // Income-to-debt ratio (25%)
    const debtToIncomeRatio = data.financial.existingDebts / data.employment.monthlyIncome;
    if (debtToIncomeRatio < 0.2) score += 150;
    else if (debtToIncomeRatio < 0.4) score += 100;
    else if (debtToIncomeRatio < 0.6) score += 50;
    else score += 0;
    
    // Repayment history (30%)
    const historyScores = {
      'excellent': 180,
      'good': 120,
      'fair': 60,
      'poor': 0
    };
    score += historyScores[data.loanHistory.repaymentHistory];
    
    // Default history penalty
    if (data.loanHistory.defaultHistory) score -= 100;
    
    // Age factor (10%)
    if (data.personalInfo.age >= 25 && data.personalInfo.age <= 55) score += 60;
    else if (data.personalInfo.age >= 18 && data.personalInfo.age < 25) score += 30;
    else score += 20;
    
    // Bank balance (10%)
    const monthsOfExpenses = data.financial.bankBalance / (data.financial.monthlyExpenses || 1);
    if (monthsOfExpenses >= 6) score += 60;
    else if (monthsOfExpenses >= 3) score += 40;
    else if (monthsOfExpenses >= 1) score += 20;
    
    return Math.min(Math.max(score, 300), 850); // Cap between 300-850
  }
  
  static getRiskCategory(score: number): 'Low Risk' | 'Medium Risk' | 'High Risk' {
    if (score >= 700) return 'Low Risk';
    if (score >= 600) return 'Medium Risk';
    return 'High Risk';
  }
  
  static getRecommendations(data: CreditData, score: number): string[] {
    const recommendations = [];
    
    if (score < 600) {
      recommendations.push('Consider building a stronger credit history with smaller loans');
      recommendations.push('Reduce existing debt to improve debt-to-income ratio');
    }
    
    if (data.financial.existingDebts / data.employment.monthlyIncome > 0.4) {
      recommendations.push('Focus on reducing monthly debt obligations');
    }
    
    if (data.financial.bankBalance < data.financial.monthlyExpenses * 3) {
      recommendations.push('Build an emergency fund covering 3-6 months of expenses');
    }
    
    if (data.loanHistory.defaultHistory) {
      recommendations.push('Maintain consistent payments to rebuild credit trust');
    }
    
    return recommendations;
  }
}