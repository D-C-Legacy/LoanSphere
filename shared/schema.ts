import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<"borrower" | "lender" | "investor" | "distributor" | "admin">(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  subscriptionPlan: text("subscription_plan").$type<"starter" | "professional" | "enterprise" | null>(),
  subscriptionStatus: text("subscription_status").$type<"active" | "inactive" | "pending" | "trial" | "expired">().default("inactive"),
  billingCycle: text("billing_cycle").$type<"monthly" | "annual">().default("monthly"),
  trialEndDate: timestamp("trial_end_date"),
  trialStartDate: timestamp("trial_start_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff roles and permissions tables
export const staffRoles = pgTable("staff_roles", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  permissions: jsonb("permissions").$type<{
    pages: string[];
    actions: string[];
    modules: string[];
    restrictions: {
      canBackdate: boolean;
      canPostdate: boolean;
      requiresApproval: {
        repayments: boolean;
        savingsTransactions: boolean;
      };
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const staffMembers = pgTable("staff_members", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  photoUrl: text("photo_url"),
  staffRoleId: integer("staff_role_id").references(() => staffRoles.id).notNull(),
  branchId: integer("branch_id"),
  isActive: boolean("is_active").default(true),
  loginRestrictions: jsonb("login_restrictions").$type<{
    workDays: string[];
    workHours: { start: string; end: string };
    allowedIPs: string[];
    allowedCountries: string[];
    requireTwoFactor: boolean;
  }>(),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIP: text("last_login_ip"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comprehensive borrower management table
export const borrowers = pgTable("borrowers", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  uniqueNumber: varchar("unique_number", { length: 50 }).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  businessName: text("business_name"),
  email: text("email"),
  mobile: text("mobile"),
  dateOfBirth: text("date_of_birth"), // Using text to store date as string
  gender: text("gender").$type<"Male" | "Female" | "Other">(),
  title: text("title"),
  address: text("address"),
  description: text("description"),
  photoUrl: text("photo_url"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  loanOfficerId: integer("loan_officer_id").references(() => users.id),
  branchId: integer("branch_id"),
  status: text("status").$type<"Active" | "Inactive" | "Restricted">().default("Active"),
  lastLoanStatus: text("last_loan_status").$type<"Active" | "Paid" | "Overdue" | "None">().default("None"),
  totalLoans: integer("total_loans").default(0),
  activeSavings: integer("active_savings").default(0),
  invitedToPortal: boolean("invited_to_portal").default(false),
  portalAccessEnabled: boolean("portal_access_enabled").default(false),
  whitelabelDomain: text("whitelabel_domain"),
  restrictions: jsonb("restrictions").$type<string[]>(),
  documents: jsonb("documents").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom fields configuration table
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").$type<"text" | "number" | "date" | "select" | "boolean">().notNull(),
  options: jsonb("options").$type<string[]>(),
  required: boolean("required").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan officers table
export const loanOfficers = pgTable("loan_officers", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  mobile: text("mobile"),
  branchId: integer("branch_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Branches table
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  managerId: integer("manager_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced loan products table with comprehensive features
export const loanProducts = pgTable("loan_products", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  loanType: text("loan_type").notNull(),
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  interestType: text("interest_type").$type<"flat" | "reducing_balance_equal_installments" | "reducing_balance_equal_principal" | "interest_only" | "compound">().default("reducing_balance_equal_installments"),
  minTerm: integer("min_term").notNull(), // months
  maxTerm: integer("max_term").notNull(), // months
  requirements: text("requirements"),
  repaymentCycle: text("repayment_cycle").$type<"daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually">().default("monthly"),
  customRepaymentCycle: text("custom_repayment_cycle"),
  gracePeriodDays: integer("grace_period_days").default(0),
  latePenaltyType: text("late_penalty_type").$type<"fixed" | "percentage">().default("percentage"),
  latePenaltyRate: decimal("late_penalty_rate", { precision: 5, scale: 2 }).default('0'),
  latePenaltyFrequency: text("late_penalty_frequency").$type<"daily" | "weekly" | "monthly">().default("monthly"),
  maturityPenaltyType: text("maturity_penalty_type").$type<"fixed" | "percentage">().default("percentage"),
  maturityPenaltyRate: decimal("maturity_penalty_rate", { precision: 5, scale: 2 }).default('0'),
  loanNumberFormat: text("loan_number_format").default("LN-{YYYY}-{MM}-{####}"),
  loanFees: jsonb("loan_fees").$type<{type: string, amount: number, percentage?: number}[]>(),
  disbursementMethod: text("disbursement_method").$type<"cash" | "bank_transfer" | "mobile_money" | "check">().default("cash"),
  requiresGuarantor: boolean("requires_guarantor").default(false),
  maxGuarantors: integer("max_guarantors").default(1),
  requiresCollateral: boolean("requires_collateral").default(false),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comprehensive loans table for active loans
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  loanNumber: varchar("loan_number", { length: 50 }).notNull().unique(),
  borrowerId: integer("borrower_id").references(() => borrowers.id).notNull(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  loanProductId: integer("loan_product_id").references(() => loanProducts.id),
  loanOfficerId: integer("loan_officer_id").references(() => loanOfficers.id),
  branchId: integer("branch_id").references(() => branches.id),
  principalAmount: decimal("principal_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  interestType: text("interest_type").$type<"flat" | "reducing_balance_equal_installments" | "reducing_balance_equal_principal" | "interest_only" | "compound">().notNull(),
  termMonths: integer("term_months").notNull(),
  repaymentCycle: text("repayment_cycle").$type<"daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually">().notNull(),
  status: text("status").$type<"processing" | "open" | "default" | "not_taken_up" | "denied" | "closed" | "restructured">().default("processing"),
  releasedDate: timestamp("released_date"),
  disbursedDate: timestamp("disbursed_date"),
  maturityDate: timestamp("maturity_date"),
  interestStartDate: timestamp("interest_start_date"),
  firstRepaymentDate: timestamp("first_repayment_date"),
  firstRepaymentAmount: decimal("first_repayment_amount", { precision: 12, scale: 2 }),
  disbursementMethod: text("disbursement_method").$type<"cash" | "bank_transfer" | "mobile_money" | "check">(),
  disbursedBy: integer("disbursed_by").references(() => users.id),
  loanFees: jsonb("loan_fees").$type<{type: string, amount: number}[]>(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  balanceAmount: decimal("balance_amount", { precision: 12, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }).notNull(),
  gracePeriodDays: integer("grace_period_days").default(0),
  latePenaltyRate: decimal("late_penalty_rate", { precision: 5, scale: 2 }).default('0'),
  maturityPenaltyRate: decimal("maturity_penalty_rate", { precision: 5, scale: 2 }).default('0'),
  collateralRequired: boolean("collateral_required").default(false),
  collateralDescription: text("collateral_description"),
  collateralValue: decimal("collateral_value", { precision: 12, scale: 2 }),
  collateralStatus: text("collateral_status").$type<"pending" | "verified" | "released">(),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  documents: jsonb("documents").$type<string[]>(),
  comments: jsonb("comments").$type<{user: string, comment: string, date: string}[]>(),
  loanAgreementUrl: text("loan_agreement_url"),
  isExtended: boolean("is_extended").default(false),
  extensionDate: timestamp("extension_date"),
  restructuredFrom: integer("restructured_from").references(() => loans.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan guarantors table
export const loanGuarantors = pgTable("loan_guarantors", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  guarantorId: integer("guarantor_id").references(() => borrowers.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  mobile: text("mobile"),
  address: text("address"),
  nationalId: text("national_id"),
  relationship: text("relationship"),
  guaranteeAmount: decimal("guarantee_amount", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan repayments/payments table
export const loanRepayments = pgTable("loan_repayments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  repaymentDate: timestamp("repayment_date").notNull(),
  principalAmount: decimal("principal_amount", { precision: 12, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }).notNull(),
  penaltyAmount: decimal("penalty_amount", { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").$type<"cash" | "bank_transfer" | "mobile_money" | "check">().notNull(),
  reference: text("reference"),
  notes: text("notes"),
  processedBy: integer("processed_by").references(() => users.id),
  isLate: boolean("is_late").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan schedule table for installments
export const loanSchedule = pgTable("loan_schedule", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: timestamp("due_date").notNull(),
  principalAmount: decimal("principal_amount", { precision: 12, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").$type<"pending" | "paid" | "overdue" | "partially_paid">().default("pending"),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collection sheets for field officers
export const collectionSheets = pgTable("collection_sheets", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  officerId: integer("officer_id").references(() => loanOfficers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  collectionDate: timestamp("collection_date").notNull(),
  loans: jsonb("loans").$type<{loanId: number, borrowerName: string, amountDue: number, amountCollected?: number, paymentMethod?: string, notes?: string}[]>(),
  totalExpected: decimal("total_expected", { precision: 12, scale: 2 }).notNull(),
  totalCollected: decimal("total_collected", { precision: 12, scale: 2 }).default('0'),
  status: text("status").$type<"pending" | "completed" | "submitted">().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan agreement templates
export const loanAgreementTemplates = pgTable("loan_agreement_templates", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  templateContent: text("template_content").notNull(),
  placeholders: jsonb("placeholders").$type<string[]>(),
  branchId: integer("branch_id").references(() => branches.id),
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan expenses table
export const loanExpenses = pgTable("loan_expenses", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  expenseType: text("expense_type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  expenseDate: timestamp("expense_date").notNull(),
  addedBy: integer("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loan other income table
export const loanOtherIncome = pgTable("loan_other_income", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  incomeType: text("income_type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  incomeDate: timestamp("income_date").notNull(),
  addedBy: integer("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  borrowerId: integer("borrower_id").references(() => users.id),
  loanProductId: integer("loan_product_id").references(() => loanProducts.id),
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  requestedTerm: integer("requested_term").notNull(),
  purpose: text("purpose"),
  employmentStatus: text("employment_status"),
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }),
  creditScore: integer("credit_score"),
  status: text("status").notNull().$type<"pending" | "under_review" | "approved" | "rejected" | "disbursed">().default("pending"),
  documents: jsonb("documents").$type<string[]>(), // Array of document URLs
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentSubmissions = pgTable("payment_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planName: text("plan_name").notNull(), // "starter", "professional", "enterprise"
  amount: text("amount").notNull(), // e.g. "K150"
  paymentMethod: text("payment_method"), // "access_bank", "airtel_money", "mtn_money"
  paymentProofPath: text("payment_proof_path"), // file path to uploaded screenshot
  status: text("status").notNull().$type<"pending" | "approved" | "rejected">().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  notes: text("notes"),
});

// Lender approval and management tables
export const lenderApplications = pgTable("lender_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  businessName: text("business_name").notNull(),
  businessRegistration: text("business_registration"),
  businessType: text("business_type").notNull(),
  yearsInBusiness: integer("years_in_business"),
  capitalAmount: decimal("capital_amount", { precision: 15, scale: 2 }),
  expectedMonthlyVolume: decimal("expected_monthly_volume", { precision: 15, scale: 2 }),
  targetMarket: text("target_market"),
  complianceCertificates: jsonb("compliance_certificates").$type<string[]>(),
  businessPlan: text("business_plan"),
  status: text("status").notNull().$type<"pending" | "under_review" | "approved" | "rejected">().default("pending"),
  reviewNotes: text("review_notes"),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lenderPerformance = pgTable("lender_performance", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalApplications: integer("total_applications").default(0),
  approvedApplications: integer("approved_applications").default(0),
  disbursedAmount: decimal("disbursed_amount", { precision: 15, scale: 2 }).default("0"),
  defaultRate: decimal("default_rate", { precision: 5, scale: 2 }).default("0"),
  customerSatisfactionScore: decimal("customer_satisfaction_score", { precision: 3, scale: 2 }),
  complianceScore: decimal("compliance_score", { precision: 3, scale: 2 }),
  adminRating: integer("admin_rating"), // 1-5 stars
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  targetType: text("target_type").notNull(), // "lender", "borrower", "loan_product", etc.
  targetId: integer("target_id").notNull(),
  action: text("action").notNull(), // "approve", "reject", "suspend", "activate", etc.
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lenderCommissions = pgTable("lender_commissions", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id),
  referralId: integer("referral_id").references(() => users.id), // borrower who was referred
  commissionType: text("commission_type").notNull(), // "subscription", "loan_origination", "performance"
  baseAmount: decimal("base_amount", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().$type<"pending" | "paid" | "cancelled">().default("pending"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
});

export const insertLoanProductSchema = createInsertSchema(loanProducts).omit({
  id: true,
  createdAt: true,
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBorrowerSchema = createInsertSchema(borrowers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
  createdAt: true,
});

export const insertLoanOfficerSchema = createInsertSchema(loanOfficers).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoanProduct = typeof loanProducts.$inferSelect;
export type InsertLoanProduct = z.infer<typeof insertLoanProductSchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type Borrower = typeof borrowers.$inferSelect;
export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;
export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type LoanOfficer = typeof loanOfficers.$inferSelect;
export type InsertLoanOfficer = z.infer<typeof insertLoanOfficerSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

// Loan management types
export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanGuarantorSchema = createInsertSchema(loanGuarantors).omit({
  id: true,
  createdAt: true,
});

export const insertLoanRepaymentSchema = createInsertSchema(loanRepayments).omit({
  id: true,
  createdAt: true,
});

export const insertLoanScheduleSchema = createInsertSchema(loanSchedule).omit({
  id: true,
  createdAt: true,
});

export const insertCollectionSheetSchema = createInsertSchema(collectionSheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// COLLATERAL MANAGEMENT SYSTEM
export const collateralTypes = pgTable("collateral_types", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  depreciation: decimal("depreciation", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collateral = pgTable("collateral", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  borrowerId: integer("borrower_id").references(() => borrowers.id).notNull(),
  loanId: integer("loan_id").references(() => loans.id),
  branchId: integer("branch_id").references(() => branches.id),
  collateralTypeId: integer("collateral_type_id").references(() => collateralTypes.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  serialNumber: text("serial_number"),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  condition: text("condition").$type<"Excellent" | "Good" | "Fair" | "Poor">().default("Good"),
  status: text("status").$type<"Active" | "Released" | "Sold" | "Lost" | "Damaged">().default("Active"),
  location: text("location"),
  insuranceDetails: jsonb("insurance_details").$type<Record<string, any>>(),
  photos: jsonb("photos").$type<string[]>().default([]),
  documents: jsonb("documents").$type<string[]>().default([]),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  valuationDate: timestamp("valuation_date"),
  nextValuationDate: timestamp("next_valuation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SAVINGS MANAGEMENT SYSTEM
export const savingsProducts = pgTable("savings_products", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  postingFrequency: text("posting_frequency").$type<"Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually">().default("Monthly"),
  minimumBalance: decimal("minimum_balance", { precision: 15, scale: 2 }).default("0"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("0"),
  withdrawalFee: decimal("withdrawal_fee", { precision: 10, scale: 2 }).default("0"),
  oneOffFee: decimal("one_off_fee", { precision: 10, scale: 2 }).default("0"),
  allowOverdraft: boolean("allow_overdraft").default(false),
  overdraftLimit: decimal("overdraft_limit", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savingsAccounts = pgTable("savings_accounts", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  borrowerId: integer("borrower_id").references(() => borrowers.id).notNull(),
  savingsProductId: integer("savings_product_id").references(() => savingsProducts.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  availableBalance: decimal("available_balance", { precision: 15, scale: 2 }).default("0"),
  status: text("status").$type<"Active" | "Closed" | "Frozen" | "Overdrawn">().default("Active"),
  lastTransactionDate: timestamp("last_transaction_date"),
  lastInterestDate: timestamp("last_interest_date"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  lienAmount: decimal("lien_amount", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savingsTransactions = pgTable("savings_transactions", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  savingsAccountId: integer("savings_account_id").references(() => savingsAccounts.id).notNull(),
  type: text("type").$type<"Deposit" | "Withdrawal" | "Interest" | "Dividend" | "Transfer" | "Fee" | "Commission" | "Lien" | "Custom">().notNull(),
  customType: text("custom_type"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  reference: text("reference"),
  status: text("status").$type<"Pending" | "Approved" | "Rejected">().default("Pending"),
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  receiptNumber: text("receipt_number"),
  relatedAccountId: integer("related_account_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// INVESTOR MANAGEMENT SYSTEM
export const investorProducts = pgTable("investor_products", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  postingFrequency: text("posting_frequency").$type<"Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually">().default("Monthly"),
  minimumBalance: decimal("minimum_balance", { precision: 15, scale: 2 }).default("0"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("0"),
  oneOffFee: decimal("one_off_fee", { precision: 10, scale: 2 }).default("0"),
  allowDirectLoanInvestment: boolean("allow_direct_loan_investment").default(true),
  isActive: boolean("is_active").default(true),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const investorAccounts = pgTable("investor_accounts", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  investorId: integer("investor_id").references(() => users.id).notNull(),
  investorProductId: integer("investor_product_id").references(() => investorProducts.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  accountNumber: text("account_number").notNull().unique(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  availableBalance: decimal("available_balance", { precision: 15, scale: 2 }).default("0"),
  status: text("status").$type<"Active" | "Closed" | "Frozen" | "Overdrawn">().default("Active"),
  lastTransactionDate: timestamp("last_transaction_date"),
  lastInterestDate: timestamp("last_interest_date"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  whitelabelDomain: text("whitelabel_domain"),
  portalAccess: boolean("portal_access").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const investorTransactions = pgTable("investor_transactions", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  investorAccountId: integer("investor_account_id").references(() => investorAccounts.id).notNull(),
  type: text("type").$type<"Deposit" | "Withdrawal" | "Interest" | "Dividend" | "Transfer" | "Fee" | "Commission" | "LoanInvestment" | "Custom">().notNull(),
  customType: text("custom_type"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  reference: text("reference"),
  status: text("status").$type<"Pending" | "Approved" | "Rejected">().default("Pending"),
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  receiptNumber: text("receipt_number"),
  loanId: integer("loan_id").references(() => loans.id),
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loanInvestments = pgTable("loan_investments", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  investorAccountId: integer("investor_account_id").references(() => investorAccounts.id).notNull(),
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 15, scale: 2 }),
  actualReturn: decimal("actual_return", { precision: 15, scale: 2 }).default("0"),
  status: text("status").$type<"Active" | "Completed" | "Defaulted">().default("Active"),
  investmentDate: timestamp("investment_date").defaultNow(),
  maturityDate: timestamp("maturity_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses Management Tables
export const expenseTypes = pgTable("expense_types", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  expenseTypeId: integer("expense_type_id").references(() => expenseTypes.id).notNull(),
  loanId: integer("loan_id").references(() => loans.id),
  branchId: integer("branch_id").references(() => branches.id),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default("ZMW"),
  expenseDate: timestamp("expense_date").notNull(),
  paymentMethod: text("payment_method").$type<"Cash" | "Bank Transfer" | "Credit Card" | "Cheque" | "Mobile Money" | "Other">(),
  paymentReference: text("payment_reference"),
  vendor: text("vendor"),
  category: text("category").$type<"Operational" | "Administrative" | "Marketing" | "Technology" | "Legal" | "Other">(),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency").$type<"Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly">(),
  recurringEndDate: timestamp("recurring_end_date"),
  lastRecurringDate: timestamp("last_recurring_date"),
  nextRecurringDate: timestamp("next_recurring_date"),
  receiptNumber: text("receipt_number"),
  status: text("status").$type<"Pending" | "Approved" | "Paid" | "Rejected">().default("Pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  paidBy: integer("paid_by").references(() => users.id),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  tags: text("tags").array(),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  attachments: jsonb("attachments").$type<Array<{filename: string, url: string, type: string, size: number}>>(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenseCustomFields = pgTable("expense_custom_fields", {
  id: serial("id").primaryKey(),
  lenderId: integer("lender_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").$type<"text" | "number" | "date" | "select" | "boolean">().notNull(),
  options: text("options").array(),
  required: boolean("required").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recurringExpenses = pgTable("recurring_expenses", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").references(() => expenses.id).notNull(),
  generatedExpenseId: integer("generated_expense_id").references(() => expenses.id),
  generatedDate: timestamp("generated_date").defaultNow(),
  status: text("status").$type<"Generated" | "Skipped" | "Failed">().default("Generated"),
  notes: text("notes"),
});

// Insert schemas for new modules - defined at the end after table definitions

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type LoanGuarantor = typeof loanGuarantors.$inferSelect;

// New module types
export type CollateralType = typeof collateralTypes.$inferSelect;
export type InsertCollateralType = z.infer<typeof insertCollateralTypeSchema>;
export type Collateral = typeof collateral.$inferSelect;
export type InsertCollateral = z.infer<typeof insertCollateralSchema>;

export type SavingsProduct = typeof savingsProducts.$inferSelect;
export type InsertSavingsProduct = z.infer<typeof insertSavingsProductSchema>;
export type SavingsAccount = typeof savingsAccounts.$inferSelect;
export type InsertSavingsAccount = z.infer<typeof insertSavingsAccountSchema>;
export type SavingsTransaction = typeof savingsTransactions.$inferSelect;
export type InsertSavingsTransaction = z.infer<typeof insertSavingsTransactionSchema>;

// Insert schemas for staff roles
export const insertStaffRoleSchema = createInsertSchema(staffRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  lastLoginAt: true,
  lastLoginIP: true,
  createdAt: true,
  updatedAt: true,
});

export type StaffRole = typeof staffRoles.$inferSelect;
export type InsertStaffRole = z.infer<typeof insertStaffRoleSchema>;
export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;

export type InvestorProduct = typeof investorProducts.$inferSelect;
export type InsertInvestorProduct = z.infer<typeof insertInvestorProductSchema>;
export type InvestorAccount = typeof investorAccounts.$inferSelect;
export type InsertInvestorAccount = z.infer<typeof insertInvestorAccountSchema>;
export type InvestorTransaction = typeof investorTransactions.$inferSelect;
export type InsertInvestorTransaction = z.infer<typeof insertInvestorTransactionSchema>;
export type LoanInvestment = typeof loanInvestments.$inferSelect;
export type InsertLoanInvestment = z.infer<typeof insertLoanInvestmentSchema>;

export type ExpenseType = typeof expenseTypes.$inferSelect;
export type InsertExpenseType = z.infer<typeof insertExpenseTypeSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type ExpenseCustomField = typeof expenseCustomFields.$inferSelect;
export type InsertExpenseCustomField = z.infer<typeof insertExpenseCustomFieldSchema>;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type InsertRecurringExpense = z.infer<typeof insertRecurringExpenseSchema>;
export type InsertLoanGuarantor = z.infer<typeof insertLoanGuarantorSchema>;
export type LoanRepayment = typeof loanRepayments.$inferSelect;
export type InsertLoanRepayment = z.infer<typeof insertLoanRepaymentSchema>;
export type LoanSchedule = typeof loanSchedule.$inferSelect;
export type InsertLoanSchedule = z.infer<typeof insertLoanScheduleSchema>;
export type CollectionSheet = typeof collectionSheets.$inferSelect;
export type InsertCollectionSheet = z.infer<typeof insertCollectionSheetSchema>;
export type LoanAgreementTemplate = typeof loanAgreementTemplates.$inferSelect;
export type LoanExpense = typeof loanExpenses.$inferSelect;
export type LoanOtherIncome = typeof loanOtherIncome.$inferSelect;

// Insert schemas
export const insertExpenseTypeSchema = createInsertSchema(expenseTypes).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExpenseCustomFieldSchema = createInsertSchema(expenseCustomFields).omit({ id: true, createdAt: true });
export const insertRecurringExpenseSchema = createInsertSchema(recurringExpenses).omit({ id: true, generatedDate: true });
