// Comprehensive feature implementation matching and exceeding LoanDisk capabilities

export interface BranchManagement {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffRole {
  id: number;
  name: string;
  permissions: string[];
  branchAccess: number[]; // Branch IDs they can access
  canViewReports: boolean;
  canApproveLoans: boolean;
  canManageBorrowers: boolean;
  canProcessPayments: boolean;
  canManageInventory: boolean;
}

export interface BorrowerProfile {
  id: number;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationalId: string;
    phone: string;
    email: string;
    address: string;
    occupation: string;
    employer: string;
    monthlyIncome: number;
  };
  guarantors: Guarantor[];
  customFields: Record<string, any>;
  documents: Document[];
  creditHistory: CreditHistoryEntry[];
  riskScore: number;
  status: 'active' | 'inactive' | 'blacklisted';
}

export interface Guarantor {
  id: number;
  borrowerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  relationship: string;
  nationalId: string;
  isActive: boolean;
}

export interface PaymentRecord {
  id: number;
  loanId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check';
  reference: string;
  notes?: string;
  processedBy: number;
  isLate: boolean;
  lateFee?: number;
}

export interface LoanSchedule {
  id: number;
  loanId: number;
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
}

export interface CollectionSheet {
  id: number;
  officerId: number;
  branchId: number;
  date: Date;
  loans: {
    loanId: number;
    borrowerName: string;
    amountDue: number;
    amountCollected?: number;
    paymentMethod?: string;
    notes?: string;
  }[];
  totalExpected: number;
  totalCollected: number;
  status: 'pending' | 'completed';
}

export interface PayrollEntry {
  id: number;
  staffId: number;
  period: string; // YYYY-MM
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payDate: Date;
  status: 'pending' | 'paid';
  payslipGenerated: boolean;
}

export interface InvestorAccount {
  id: number;
  investorId: number;
  accountType: 'savings' | 'investment';
  balance: number;
  interestRate: number;
  transactions: InvestorTransaction[];
  autoInterest: boolean;
  maturityDate?: Date;
}

export interface InvestorTransaction {
  id: number;
  accountId: number;
  type: 'deposit' | 'withdrawal' | 'interest' | 'loan_investment';
  amount: number;
  description: string;
  date: Date;
  reference?: string;
}

export interface AccountingEntry {
  id: number;
  date: Date;
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  branchId: number;
  createdBy: number;
  isSystemGenerated: boolean;
}

export interface ChartOfAccounts {
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentAccount?: string;
  isActive: boolean;
  balance: number;
}

export interface LoanAgreementTemplate {
  id: number;
  name: string;
  templateContent: string; // DOCX template with placeholders
  placeholders: string[];
  branchId?: number;
  isDefault: boolean;
  createdBy: number;
}

export interface AutomatedNotification {
  id: number;
  type: 'sms' | 'email';
  trigger: 'loan_approved' | 'payment_reminder' | 'payment_received' | 'birthday' | 'overdue' | 'monthly_statement';
  template: string;
  isActive: boolean;
  daysBeforeDue?: number; // For payment reminders
  branchId?: number;
}

export interface ReportConfiguration {
  reportType: 'arrears_aging' | 'borrowers_report' | 'loans_report' | 'monthly_report' | 'par_report' | 'collector_report' | 'outstanding_report';
  parameters: Record<string, any>;
  scheduleType?: 'daily' | 'weekly' | 'monthly';
  recipients: string[]; // Email addresses
  isActive: boolean;
}

// LoanSphere Enhanced Features (Beyond LoanDisk)
export interface AIRiskAssessment {
  borrowerId: number;
  riskScore: number;
  riskFactors: {
    creditHistory: number;
    incomeStability: number;
    debtToIncomeRatio: number;
    guarantorStrength: number;
    marketConditions: number;
  };
  recommendations: string[];
  confidence: number;
  assessmentDate: Date;
}

export interface PredictiveAnalytics {
  type: 'default_probability' | 'market_trends' | 'portfolio_performance';
  timeframe: string;
  predictions: Record<string, number>;
  accuracy: number;
  lastUpdated: Date;
}

export interface BlockchainVerification {
  transactionId: string;
  blockHash: string;
  timestamp: Date;
  verified: boolean;
  data: Record<string, any>;
}

export interface ComplianceMonitoring {
  regulationId: string;
  complianceLevel: number;
  violations: string[];
  remedialActions: string[];
  lastChecked: Date;
  nextReview: Date;
}

export interface CustomerSegmentation {
  segmentId: string;
  criteria: Record<string, any>;
  borrowerIds: number[];
  characteristics: string[];
  recommendedProducts: string[];
  lastUpdated: Date;
}

export interface FraudDetection {
  riskLevel: 'low' | 'medium' | 'high';
  indicators: string[];
  suspiciousActivity: boolean;
  investigationRequired: boolean;
  alerts: string[];
}

// Enhanced API endpoints structure
export const loanSphereEndpoints = {
  // Core LoanDisk equivalent features
  branches: {
    list: '/api/branches',
    create: '/api/branches',
    update: '/api/branches/:id',
    delete: '/api/branches/:id'
  },
  staff: {
    list: '/api/staff',
    create: '/api/staff',
    roles: '/api/staff/roles',
    permissions: '/api/staff/permissions'
  },
  borrowers: {
    list: '/api/borrowers',
    create: '/api/borrowers',
    profile: '/api/borrowers/:id',
    guarantors: '/api/borrowers/:id/guarantors',
    documents: '/api/borrowers/:id/documents'
  },
  loans: {
    list: '/api/loans',
    create: '/api/loans',
    schedule: '/api/loans/:id/schedule',
    payments: '/api/loans/:id/payments',
    agreements: '/api/loans/:id/agreement'
  },
  payments: {
    record: '/api/payments',
    bulk_upload: '/api/payments/bulk',
    collection_sheets: '/api/payments/collection-sheets'
  },
  accounting: {
    entries: '/api/accounting/entries',
    chart_of_accounts: '/api/accounting/chart',
    reports: '/api/accounting/reports'
  },
  notifications: {
    send_sms: '/api/notifications/sms',
    send_email: '/api/notifications/email',
    automated: '/api/notifications/automated'
  },
  
  // LoanSphere Enhanced Features
  ai: {
    risk_assessment: '/api/ai/risk-assessment',
    credit_scoring: '/api/ai/credit-scoring',
    predictive_analytics: '/api/ai/predictions',
    fraud_detection: '/api/ai/fraud-detection'
  },
  compliance: {
    monitor: '/api/compliance/monitor',
    reports: '/api/compliance/reports',
    violations: '/api/compliance/violations'
  },
  blockchain: {
    verify: '/api/blockchain/verify',
    transactions: '/api/blockchain/transactions'
  },
  analytics: {
    customer_segments: '/api/analytics/segments',
    performance: '/api/analytics/performance',
    forecasting: '/api/analytics/forecasting'
  }
};

export const featureMatrix = {
  loanDisk: [
    'Unlimited Branches',
    'Unlimited Borrowers/Clients',
    'Unlimited Repayments',
    'Staff Roles and Permissions',
    'Borrower Login',
    'Send Email/SMS',
    'Automated SMS/Email',
    'Collection Sheets',
    'Payroll Management',
    'Charts and Reports',
    'Double Entry Accounting',
    'Calendar',
    'Loan Products',
    'Loan Fees',
    'Investors',
    'Document Generation',
    'Automatic Backups',
    '24/7 Support',
    'Data Transfer',
    'No Setup Fee',
    'Free Trial'
  ],
  loanSphereExtra: [
    'AI-Powered Credit Scoring',
    'Real-time Risk Assessment',
    'Predictive Analytics',
    'Mobile Money Integration',
    'Multi-Currency Support',
    'Automated Compliance Monitoring',
    'Blockchain Transaction Verification',
    'Advanced Fraud Detection',
    'Real-time Market Intelligence',
    'Customer Segmentation',
    'Predictive Default Prevention',
    'Banking API Integration',
    'Custom Mobile App Development',
    'Advanced Business Intelligence'
  ]
};