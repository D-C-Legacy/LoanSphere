
export interface RiskFactors {
  creditScore: number;
  debtToIncomeRatio: number;
  employmentStability: number; // months
  loanAmount: number;
  loanTerm: number;
  collateralValue?: number;
}

export class InterestRateService {
  private static baseRate = 12; // Base rate percentage
  
  static calculateDynamicRate(riskFactors: RiskFactors): number {
    let adjustedRate = this.baseRate;
    
    // Credit score adjustment (-5% to +8%)
    if (riskFactors.creditScore >= 750) {
      adjustedRate -= 2;
    } else if (riskFactors.creditScore >= 650) {
      adjustedRate -= 1;
    } else if (riskFactors.creditScore < 550) {
      adjustedRate += 4;
    } else if (riskFactors.creditScore < 600) {
      adjustedRate += 2;
    }
    
    // Debt-to-income ratio adjustment
    if (riskFactors.debtToIncomeRatio > 0.4) {
      adjustedRate += 3;
    } else if (riskFactors.debtToIncomeRatio < 0.2) {
      adjustedRate -= 1;
    }
    
    // Employment stability adjustment
    if (riskFactors.employmentStability >= 24) {
      adjustedRate -= 1;
    } else if (riskFactors.employmentStability < 6) {
      adjustedRate += 2;
    }
    
    // Loan amount and term adjustment
    if (riskFactors.loanAmount > 100000) {
      adjustedRate += 1;
    }
    if (riskFactors.loanTerm > 24) {
      adjustedRate += 0.5;
    }
    
    // Collateral adjustment
    if (riskFactors.collateralValue && riskFactors.collateralValue >= riskFactors.loanAmount * 1.5) {
      adjustedRate -= 2;
    }
    
    return Math.max(adjustedRate, 8); // Minimum 8% rate
  }
  
  static getRateExplanation(riskFactors: RiskFactors): string[] {
    const explanations: string[] = [];
    
    if (riskFactors.creditScore >= 750) {
      explanations.push("Excellent credit score (-2%)");
    } else if (riskFactors.creditScore < 550) {
      explanations.push("Poor credit score (+4%)");
    }
    
    if (riskFactors.debtToIncomeRatio > 0.4) {
      explanations.push("High debt-to-income ratio (+3%)");
    }
    
    if (riskFactors.employmentStability >= 24) {
      explanations.push("Stable employment history (-1%)");
    }
    
    return explanations;
  }
}
