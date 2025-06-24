import { 
  users, borrowers, customFields, loanOfficers, branches, loanProducts, loanApplications,
  type User, type Borrower, type CustomField, type LoanOfficer, type Branch, 
  type LoanProduct, type LoanApplication,
  type InsertUser, type InsertBorrower, type InsertCustomField, type InsertLoanOfficer,
  type InsertBranch, type InsertLoanProduct, type InsertLoanApplication
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllLenders(): Promise<User[]>;

  // Loan Product operations
  getLoanProduct(id: number): Promise<LoanProduct | undefined>;
  getLoanProductsByLender(lenderId: number): Promise<LoanProduct[]>;
  getAllActiveLoanProducts(): Promise<LoanProduct[]>;
  createLoanProduct(product: InsertLoanProduct): Promise<LoanProduct>;
  updateLoanProduct(id: number, updates: Partial<LoanProduct>): Promise<LoanProduct | undefined>;

  // Loan Application operations
  getLoanApplication(id: number): Promise<LoanApplication | undefined>;
  getApplicationsByBorrower(borrowerId: number): Promise<LoanApplication[]>;
  getApplicationsByLender(lenderId: number): Promise<LoanApplication[]>;
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  updateLoanApplication(id: number, updates: Partial<LoanApplication>): Promise<LoanApplication | undefined>;

  // Borrower operations
  getBorrower(id: number): Promise<Borrower | undefined>;
  getBorrowersByLender(lenderId: number): Promise<Borrower[]>;
  createBorrower(borrower: InsertBorrower): Promise<Borrower>;
  updateBorrower(id: number, updates: Partial<Borrower>): Promise<Borrower | undefined>;
  deleteBorrower(id: number): Promise<boolean>;

  // Custom Fields operations
  getCustomFields(lenderId: number): Promise<CustomField[]>;
  createCustomField(customField: InsertCustomField): Promise<CustomField>;
  updateCustomField(id: number, updates: Partial<CustomField>): Promise<CustomField | undefined>;
  deleteCustomField(id: number): Promise<boolean>;

  // Loan Officer operations
  getLoanOfficers(lenderId: number): Promise<LoanOfficer[]>;
  createLoanOfficer(officer: InsertLoanOfficer): Promise<LoanOfficer>;
  updateLoanOfficer(id: number, updates: Partial<LoanOfficer>): Promise<LoanOfficer | undefined>;
  deleteLoanOfficer(id: number): Promise<boolean>;

  // Branch operations
  getBranches(lenderId: number): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, updates: Partial<Branch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<boolean>;

  // Repayment operations
  getRepayments(lenderId: number): Promise<any[]>;
  getRepayment(id: number): Promise<any | undefined>;
  addRepayment(repayment: any): Promise<any>;
  updateRepayment(id: number, updates: any): Promise<any | undefined>;
  approveRepayment(id: number): Promise<any>;
  getRepaymentReceipt(id: number): Promise<any>;
  searchRepayments(query: string, lenderId: number): Promise<any[]>;
  getRepaymentsByStatus(status: string, lenderId: number): Promise<any[]>;
  getRepaymentsByCollector(collectorId: number): Promise<any[]>;
  getRepaymentsByDateRange(startDate: string, endDate: string, lenderId: number): Promise<any[]>;
  generateBulkRepayments(data: any): Promise<any[]>;
  importRepaymentsFromCsv(csvData: string): Promise<any[]>;
  recalculateLoanOnExcessPayment(loanId: number, excessAmount: number): Promise<any>;

  // Branch operations extended
  getBranchSettings(branchId: number): Promise<any>;
  updateBranchSettings(branchId: number, settings: any): Promise<any>;
  getBranchHolidays(branchId: number): Promise<any[]>;
  addBranchHoliday(branchId: number, holiday: any): Promise<any>;
  removeBranchHoliday(holidayId: number): Promise<boolean>;
  getBranchStaff(branchId: number): Promise<any[]>;
  assignStaffToBranch(staffId: number, branchId: number): Promise<any>;
  getBranchCapital(branchId: number): Promise<any>;
  updateBranchCapital(branchId: number, capital: any): Promise<any>;
  getBranchPerformance(branchId: number, period: string): Promise<any>;

  // Borrower search
  searchBorrowers(query: string, lenderId: number): Promise<any[]>;

  // Payment Submission operations (placeholder)
  createPaymentSubmission(submission: any): Promise<any>;
  getAllPaymentSubmissions(): Promise<any[]>;
  updatePaymentSubmission(id: number, updates: any): Promise<any>;

  // Lender Application operations (placeholder)
  createLenderApplication(application: any): Promise<any>;
  getLenderApplications(status?: string): Promise<any[]>;
  getLenderApplicationByUserId(userId: number): Promise<any>;
  updateLenderApplication(id: number, updates: any): Promise<any>;

  // Performance operations (placeholder)
  getLenderPerformance(lenderId: number, year?: number, month?: number): Promise<any[]>;
  updateLenderPerformance(data: any): Promise<any>;

  // Admin operations (placeholder)
  createAdminAction(action: any): Promise<any>;
  getAdminActions(targetType?: string, targetId?: number): Promise<any[]>;

  // Commission operations (placeholder)
  createLenderCommission(commission: any): Promise<any>;
  getLenderCommissions(lenderId: number, status?: string): Promise<any[]>;
  updateCommissionStatus(id: number, status: string): Promise<any>;

  // Expense Management operations (placeholder)
  getExpenses(lenderId: number): Promise<any[]>;
  getExpense(id: number): Promise<any | undefined>;
  createExpense(expense: any): Promise<any>;
  updateExpense(id: number, updates: any): Promise<any | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  bulkCreateExpenses(expenses: any[]): Promise<any[]>;
  getExpenseTypes(lenderId: number): Promise<any[]>;
  getExpenseType(id: number): Promise<any | undefined>;
  createExpenseType(expenseType: any): Promise<any>;
  updateExpenseType(id: number, updates: any): Promise<any | undefined>;
  deleteExpenseType(id: number): Promise<boolean>;
  getExpenseCustomFields(lenderId: number): Promise<any[]>;
  createExpenseCustomField(customField: any): Promise<any>;
  updateExpenseCustomField(id: number, updates: any): Promise<any | undefined>;
  deleteExpenseCustomField(id: number): Promise<boolean>;

  // Staff Management operations (placeholder)
  getStaffRoles(lenderId: number): Promise<any[]>;
  createStaffRole(role: any): Promise<any>;
  updateStaffRole(id: number, updates: any): Promise<any | undefined>;
  deleteStaffRole(id: number): Promise<boolean>;
  getStaffMembers(lenderId: number): Promise<any[]>;
  createStaffMember(member: any): Promise<any>;
  updateStaffMember(id: number, updates: any): Promise<any | undefined>;
  deleteStaffMember(id: number): Promise<boolean>;
  getStaffMemberPermissions(memberId: number): Promise<any>;
  validateStaffLogin(credentials: any): Promise<any>;
  logStaffActivity(memberId: number, activity: any): Promise<void>;

  // Collateral Management operations (placeholder)
  getCollateral(): Promise<any[]>;
  createCollateral(data: any): Promise<any>;
  updateCollateral(id: number, data: any): Promise<any>;
  deleteCollateral(id: number): Promise<boolean>;
  getCollateralTypes(): Promise<any[]>;
  createCollateralType(data: any): Promise<any>;
  updateCollateralType(id: number, data: any): Promise<any>;
  deleteCollateralType(id: number): Promise<boolean>;

  // Communications Management operations (placeholder)
  getNotificationSettings(): Promise<any[]>;
  updateNotificationSetting(id: string, updates: any): Promise<any>;
  getCommunicationProviders(): Promise<any>;
  updateCommunicationProvider(type: string, settings: any): Promise<any>;
  sendTestNotification(type: string, recipient: string, message: string, template: string): Promise<any>;
  getNotificationHistory(page: number, limit: number, type?: string, status?: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getAllLenders(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'lender'));
  }

  // Loan Product methods
  async getLoanProduct(id: number): Promise<LoanProduct | undefined> {
    const [product] = await db.select().from(loanProducts).where(eq(loanProducts.id, id));
    return product || undefined;
  }

  async getLoanProductsByLender(lenderId: number): Promise<LoanProduct[]> {
    return await db.select().from(loanProducts).where(eq(loanProducts.lenderId, lenderId));
  }

  async getAllActiveLoanProducts(): Promise<LoanProduct[]> {
    return await db.select().from(loanProducts).where(eq(loanProducts.isActive, true));
  }

  async createLoanProduct(product: InsertLoanProduct): Promise<LoanProduct> {
    const [newProduct] = await db.insert(loanProducts).values(product).returning();
    return newProduct;
  }

  async updateLoanProduct(id: number, updates: Partial<LoanProduct>): Promise<LoanProduct | undefined> {
    const [updatedProduct] = await db
      .update(loanProducts)
      .set(updates)
      .where(eq(loanProducts.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  // Loan Application methods
  async getLoanApplication(id: number): Promise<LoanApplication | undefined> {
    const [application] = await db.select().from(loanApplications).where(eq(loanApplications.id, id));
    return application || undefined;
  }

  async getApplicationsByBorrower(borrowerId: number): Promise<LoanApplication[]> {
    return await db.select().from(loanApplications).where(eq(loanApplications.borrowerId, borrowerId));
  }

  async getApplicationsByLender(lenderId: number): Promise<LoanApplication[]> {
    return await db.select().from(loanApplications).where(eq(loanApplications.lenderId, lenderId));
  }

  async createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication> {
    const [newApplication] = await db.insert(loanApplications).values(application).returning();
    return newApplication;
  }

  async updateLoanApplication(id: number, updates: Partial<LoanApplication>): Promise<LoanApplication | undefined> {
    const [updatedApplication] = await db
      .update(loanApplications)
      .set(updates)
      .where(eq(loanApplications.id, id))
      .returning();
    return updatedApplication || undefined;
  }

  // Borrower Management methods
  async getBorrower(id: number): Promise<Borrower | undefined> {
    const [borrower] = await db.select().from(borrowers).where(eq(borrowers.id, id));
    return borrower || undefined;
  }

  async getBorrowersByLender(lenderId: number): Promise<Borrower[]> {
    return await db.select().from(borrowers).where(eq(borrowers.lenderId, lenderId));
  }

  async createBorrower(borrower: InsertBorrower): Promise<Borrower> {
    const [newBorrower] = await db.insert(borrowers).values(borrower).returning();
    return newBorrower;
  }

  async updateBorrower(id: number, updates: Partial<Borrower>): Promise<Borrower | undefined> {
    const [updatedBorrower] = await db
      .update(borrowers)
      .set(updates)
      .where(eq(borrowers.id, id))
      .returning();
    return updatedBorrower || undefined;
  }

  async deleteBorrower(id: number): Promise<boolean> {
    try {
      await db.delete(borrowers).where(eq(borrowers.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Custom Fields methods
  async getCustomFields(lenderId: number): Promise<CustomField[]> {
    return await db.select().from(customFields).where(eq(customFields.lenderId, lenderId));
  }

  async createCustomField(customField: InsertCustomField): Promise<CustomField> {
    const [newField] = await db.insert(customFields).values(customField).returning();
    return newField;
  }

  async updateCustomField(id: number, updates: Partial<CustomField>): Promise<CustomField | undefined> {
    const [updatedField] = await db
      .update(customFields)
      .set(updates)
      .where(eq(customFields.id, id))
      .returning();
    return updatedField || undefined;
  }

  async deleteCustomField(id: number): Promise<boolean> {
    try {
      await db.delete(customFields).where(eq(customFields.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Loan Officer methods
  async getLoanOfficers(lenderId: number): Promise<LoanOfficer[]> {
    return await db.select().from(loanOfficers).where(eq(loanOfficers.lenderId, lenderId));
  }

  async createLoanOfficer(officer: InsertLoanOfficer): Promise<LoanOfficer> {
    const [newOfficer] = await db.insert(loanOfficers).values(officer).returning();
    return newOfficer;
  }

  async updateLoanOfficer(id: number, updates: Partial<LoanOfficer>): Promise<LoanOfficer | undefined> {
    const [updatedOfficer] = await db
      .update(loanOfficers)
      .set(updates)
      .where(eq(loanOfficers.id, id))
      .returning();
    return updatedOfficer || undefined;
  }

  async deleteLoanOfficer(id: number): Promise<boolean> {
    try {
      await db.delete(loanOfficers).where(eq(loanOfficers.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Branch methods
  async getBranches(lenderId: number): Promise<Branch[]> {
    return await db.select().from(branches).where(eq(branches.lenderId, lenderId));
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db.insert(branches).values(branch).returning();
    return newBranch;
  }

  async updateBranch(id: number, updates: Partial<Branch>): Promise<Branch | undefined> {
    const [updatedBranch] = await db
      .update(branches)
      .set(updates)
      .where(eq(branches.id, id))
      .returning();
    return updatedBranch || undefined;
  }

  async deleteBranch(id: number): Promise<boolean> {
    try {
      await db.delete(branches).where(eq(branches.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Placeholder implementations for remaining methods - using mock data temporarily
  async createPaymentSubmission(submission: any): Promise<any> {
    // TODO: Implement with proper database table
    return { id: Date.now(), ...submission, createdAt: new Date() };
  }

  async getAllPaymentSubmissions(): Promise<any[]> {
    // TODO: Implement with proper database table
    return [];
  }

  async updatePaymentSubmission(id: number, updates: any): Promise<any> {
    // TODO: Implement with proper database table
    return { id, ...updates };
  }

  async createLenderApplication(application: any): Promise<any> {
    // TODO: Implement with proper database table
    return { id: Date.now(), ...application, createdAt: new Date() };
  }

  async getLenderApplications(status?: string): Promise<any[]> {
    // TODO: Implement with proper database table
    return [];
  }

  async getLenderApplicationByUserId(userId: number): Promise<any> {
    // TODO: Implement with proper database table
    return null;
  }

  async updateLenderApplication(id: number, updates: any): Promise<any> {
    // TODO: Implement with proper database table
    return { id, ...updates };
  }

  async getLenderPerformance(lenderId: number, year?: number, month?: number): Promise<any[]> {
    // TODO: Implement with proper performance tracking table
    return [];
  }

  async updateLenderPerformance(data: any): Promise<any> {
    // TODO: Implement with proper performance tracking table
    return data;
  }

  async createAdminAction(action: any): Promise<any> {
    // TODO: Implement with proper admin actions table
    return { id: Date.now(), ...action, createdAt: new Date() };
  }

  async getAdminActions(targetType?: string, targetId?: number): Promise<any[]> {
    // TODO: Implement with proper admin actions table
    return [];
  }

  async createLenderCommission(commission: any): Promise<any> {
    // TODO: Implement with proper commissions table
    return { id: Date.now(), ...commission, createdAt: new Date() };
  }

  async getLenderCommissions(lenderId: number, status?: string): Promise<any[]> {
    // TODO: Implement with proper commissions table
    return [];
  }

  async updateCommissionStatus(id: number, status: string): Promise<any> {
    // TODO: Implement with proper commissions table
    return { id, status };
  }

  // Expense Management placeholder methods
  async getExpenses(lenderId: number): Promise<any[]> {
    return [];
  }

  async getExpense(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createExpense(expense: any): Promise<any> {
    return { id: Date.now(), ...expense, createdAt: new Date() };
  }

  async updateExpense(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteExpense(id: number): Promise<boolean> {
    return true;
  }

  async bulkCreateExpenses(expenses: any[]): Promise<any[]> {
    return expenses.map(expense => ({ id: Date.now(), ...expense, createdAt: new Date() }));
  }

  async getExpenseTypes(lenderId: number): Promise<any[]> {
    return [];
  }

  async getExpenseType(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createExpenseType(expenseType: any): Promise<any> {
    return { id: Date.now(), ...expenseType, createdAt: new Date() };
  }

  async updateExpenseType(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteExpenseType(id: number): Promise<boolean> {
    return true;
  }

  async getExpenseCustomFields(lenderId: number): Promise<any[]> {
    return [];
  }

  async createExpenseCustomField(customField: any): Promise<any> {
    return { id: Date.now(), ...customField, createdAt: new Date() };
  }

  async updateExpenseCustomField(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteExpenseCustomField(id: number): Promise<boolean> {
    return true;
  }

  // Staff Management placeholder methods
  async getStaffRoles(lenderId: number): Promise<any[]> {
    return [];
  }

  async createStaffRole(role: any): Promise<any> {
    return { id: Date.now(), ...role, createdAt: new Date() };
  }

  async updateStaffRole(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteStaffRole(id: number): Promise<boolean> {
    return true;
  }

  async getStaffMembers(lenderId: number): Promise<any[]> {
    return [];
  }

  async createStaffMember(member: any): Promise<any> {
    return { id: Date.now(), ...member, createdAt: new Date() };
  }

  async updateStaffMember(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async deleteStaffMember(id: number): Promise<boolean> {
    return true;
  }

  async getStaffMemberPermissions(memberId: number): Promise<any> {
    return {};
  }

  async validateStaffLogin(credentials: any): Promise<any> {
    return null;
  }

  async logStaffActivity(memberId: number, activity: any): Promise<void> {
    // TODO: Implement staff activity logging
  }

  // Collateral Management placeholder methods
  async getCollateral(): Promise<any[]> {
    return [];
  }

  async createCollateral(data: any): Promise<any> {
    return { id: Date.now(), ...data, createdAt: new Date() };
  }

  async updateCollateral(id: number, data: any): Promise<any> {
    return { id, ...data };
  }

  async deleteCollateral(id: number): Promise<boolean> {
    return true;
  }

  async getCollateralTypes(): Promise<any[]> {
    return [];
  }

  async createCollateralType(data: any): Promise<any> {
    return { id: Date.now(), ...data, createdAt: new Date() };
  }

  async updateCollateralType(id: number, data: any): Promise<any> {
    return { id, ...data };
  }

  async deleteCollateralType(id: number): Promise<boolean> {
    return true;
  }

  // Repayment operations implementation
  async getRepayments(lenderId: number): Promise<any[]> {
    return [];
  }

  async getRepayment(id: number): Promise<any | undefined> {
    return { id, amount: 1000, status: 'completed' };
  }

  async addRepayment(repayment: any): Promise<any> {
    return { id: Date.now(), ...repayment };
  }

  async updateRepayment(id: number, updates: any): Promise<any | undefined> {
    return { id, ...updates };
  }

  async approveRepayment(id: number): Promise<any> {
    return { id, status: 'approved' };
  }

  async getRepaymentReceipt(id: number): Promise<any> {
    return { id, receiptNumber: `REC-${id}`, amount: 1000 };
  }

  async searchRepayments(query: string, lenderId: number): Promise<any[]> {
    return [];
  }

  async getRepaymentsByStatus(status: string, lenderId: number): Promise<any[]> {
    return [];
  }

  async getRepaymentsByCollector(collectorId: number): Promise<any[]> {
    return [];
  }

  async getRepaymentsByDateRange(startDate: string, endDate: string, lenderId: number): Promise<any[]> {
    return [];
  }

  async generateBulkRepayments(data: any): Promise<any[]> {
    return [];
  }

  async importRepaymentsFromCsv(csvData: string): Promise<any[]> {
    return [];
  }

  async recalculateLoanOnExcessPayment(loanId: number, excessAmount: number): Promise<any> {
    return { loanId, adjustedBalance: 0 };
  }

  // Branch operations extended implementation
  async getBranchSettings(branchId: number): Promise<any> {
    return { branchId, workingHours: '9:00-17:00' };
  }

  async updateBranchSettings(branchId: number, settings: any): Promise<any> {
    return { branchId, ...settings };
  }

  async getBranchHolidays(branchId: number): Promise<any[]> {
    return [];
  }

  async addBranchHoliday(branchId: number, holiday: any): Promise<any> {
    return { id: Date.now(), branchId, ...holiday };
  }

  async removeBranchHoliday(holidayId: number): Promise<boolean> {
    return true;
  }

  async getBranchStaff(branchId: number): Promise<any[]> {
    return [];
  }

  async assignStaffToBranch(staffId: number, branchId: number): Promise<any> {
    return { staffId, branchId, assignedAt: new Date().toISOString() };
  }

  async getBranchCapital(branchId: number): Promise<any> {
    return { branchId, totalCapital: 0 };
  }

  async updateBranchCapital(branchId: number, capital: any): Promise<any> {
    return { branchId, ...capital };
  }

  async getBranchPerformance(branchId: number, period: string): Promise<any> {
    return { branchId, period, performance: {} };
  }

  // Borrower search implementation
  async searchBorrowers(query: string, lenderId: number): Promise<any[]> {
    return [];
  }

  // Communications Management placeholder methods
  async getNotificationSettings(): Promise<any[]> {
    return [];
  }

  async updateNotificationSetting(id: string, updates: any): Promise<any> {
    return { id, ...updates };
  }

  async getCommunicationProviders(): Promise<any> {
    return {};
  }

  async updateCommunicationProvider(type: string, settings: any): Promise<any> {
    return { type, settings };
  }

  async sendTestNotification(type: string, recipient: string, message: string, template: string): Promise<any> {
    return { success: true, type, recipient };
  }

  async getNotificationHistory(page: number, limit: number, type?: string, status?: string): Promise<any> {
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 }
    };
  }
}

export const storage = new DatabaseStorage();