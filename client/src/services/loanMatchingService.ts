
export interface LoanMatchCriteria {
  minCreditScore: number;
  maxLoanAmount: number;
  preferredEmploymentTypes: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  geographicPreference: string[];
}

export interface BorrowerProfile {
  id: string;
  creditScore: number;
  employmentStatus: string;
  monthlyIncome: number;
  location: string;
  loanAmount: number;
  purpose: string;
}

export class LoanMatchingService {
  static calculateMatchScore(borrower: BorrowerProfile, criteria: LoanMatchCriteria): number {
    let score = 0;
    
    // Credit score matching (40% weight)
    if (borrower.creditScore >= criteria.minCreditScore) {
      score += 40 * (borrower.creditScore / 850);
    }
    
    // Loan amount feasibility (30% weight)
    if (borrower.loanAmount <= criteria.maxLoanAmount) {
      score += 30;
    }
    
    // Employment type preference (20% weight)
    if (criteria.preferredEmploymentTypes.includes(borrower.employmentStatus)) {
      score += 20;
    }
    
    // Geographic preference (10% weight)
    if (criteria.geographicPreference.includes(borrower.location)) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  static findMatchingBorrowers(borrowers: BorrowerProfile[], criteria: LoanMatchCriteria): BorrowerProfile[] {
    return borrowers
      .map(borrower => ({
        ...borrower,
        matchScore: this.calculateMatchScore(borrower, criteria)
      }))
      .filter(borrower => borrower.matchScore >= 60)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
