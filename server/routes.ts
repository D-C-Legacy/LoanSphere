import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Simple auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, role, firstName, lastName, phone } = req.body;
      
      if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with appropriate settings based on role
      let userData: any = {
        email,
        password: hashedPassword,
        role,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        isVerified: true,
      };

      // For lenders, set up trial period
      if (role === 'lender') {
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        userData = {
          ...userData,
          subscriptionPlan: 'starter',
          subscriptionStatus: 'trial',
          billingCycle: 'monthly',
          trialStartDate,
          trialEndDate,
        };
      }

      const user = await storage.createUser(userData);

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: user.isVerified,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus,
          billingCycle: user.billingCycle,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: user.isVerified,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus,
          billingCycle: user.billingCycle,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        billingCycle: user.billingCycle,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user subscription
  app.put('/api/auth/user/subscription', authenticateToken, async (req: any, res) => {
    try {
      const { subscriptionPlan, billingCycle } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.userId, {
        subscriptionPlan,
        billingCycle,
        subscriptionStatus: "active",
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        subscriptionPlan: updatedUser.subscriptionPlan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        billingCycle: updatedUser.billingCycle,
      });
    } catch (error) {
      console.error("Update subscription error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Loan Products routes
  app.get('/api/loan-products/active', async (req, res) => {
    try {
      const products = await storage.getAllActiveLoanProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching loan products:", error);
      res.status(500).json({ message: "Failed to fetch loan products" });
    }
  });

  app.get('/api/loan-products/lender/:lenderId', authenticateToken, async (req, res) => {
    try {
      const { lenderId } = req.params;
      const products = await storage.getLoanProductsByLender(parseInt(lenderId));
      res.json(products);
    } catch (error) {
      console.error("Error fetching lender products:", error);
      res.status(500).json({ message: "Failed to fetch lender products" });
    }
  });

  app.post('/api/loan-products', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create loan products" });
      }

      const productData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const product = await storage.createLoanProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating loan product:", error);
      res.status(500).json({ message: "Failed to create loan product" });
    }
  });

  app.put('/api/loan-products/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const product = await storage.getLoanProduct(parseInt(id));
      if (!product || product.lenderId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }

      const updatedProduct = await storage.updateLoanProduct(parseInt(id), req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating loan product:", error);
      res.status(500).json({ message: "Failed to update loan product" });
    }
  });

  // Loan Applications routes
  app.get('/api/loan-applications/borrower/:borrowerId', authenticateToken, async (req, res) => {
    try {
      const { borrowerId } = req.params;
      const applications = await storage.getApplicationsByBorrower(parseInt(borrowerId));
      
      // Enrich with lender and product data
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const product = await storage.getLoanProduct(app.loanProductId!);
          const lender = product ? await storage.getUser(product.lenderId!) : null;
          return {
            ...app,
            loanProduct: product,
            lender: lender,
          };
        })
      );
      
      res.json(enrichedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/loan-applications/lender/:lenderId', authenticateToken, async (req, res) => {
    try {
      const { lenderId } = req.params;
      const applications = await storage.getApplicationsByLender(parseInt(lenderId));
      
      // Enrich with borrower and product data
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const borrower = await storage.getUser(app.borrowerId!);
          const product = await storage.getLoanProduct(app.loanProductId!);
          return {
            ...app,
            borrower: borrower,
            loanProduct: product,
          };
        })
      );
      
      res.json(enrichedApplications);
    } catch (error) {
      console.error("Error fetching lender applications:", error);
      res.status(500).json({ message: "Failed to fetch lender applications" });
    }
  });

  // Public endpoints (no auth required for browsing)
  app.get('/api/loan-products', async (req, res) => {
    try {
      const products = await storage.getAllActiveLoanProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching loan products:", error);
      res.status(500).json({ message: "Failed to fetch loan products" });
    }
  });

  app.get('/api/loan-products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getLoanProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Loan product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching loan product:", error);
      res.status(500).json({ message: "Failed to fetch loan product" });
    }
  });

  // Borrower-specific endpoints
  app.get('/api/borrower/applications', async (req, res) => {
    try {
      // Mock data for now - in production, use authenticated user ID
      const mockApplications = [
        {
          id: 1,
          loanProductId: 1,
          productTitle: "Civil Servant Personal Loan",
          lenderName: "Zambia Finance Corp",
          requestedAmount: "ZMW 25,000",
          requestedTerm: 24,
          status: "under_review",
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          interestRate: "12% p.a.",
          monthlyPayment: "ZMW 1,250"
        },
        {
          id: 2,
          loanProductId: 2,
          productTitle: "Business Growth Loan",
          lenderName: "Capital Lending Ltd",
          requestedAmount: "ZMW 50,000",
          requestedTerm: 36,
          status: "pending",
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          interestRate: "15% p.a.",
          monthlyPayment: "ZMW 1,680"
        }
      ];
      res.json(mockApplications);
    } catch (error) {
      console.error("Error fetching borrower applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/borrower/summary', async (req, res) => {
    try {
      const summary = {
        totalApplications: 3,
        activeLoans: 1,
        totalBorrowed: "ZMW 75,000",
        monthlyPayments: "ZMW 2,930"
      };
      res.json(summary);
    } catch (error) {
      console.error("Error fetching borrower summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  app.post('/api/loan-applications', async (req, res) => {
    try {
      const applicationData = {
        ...req.body,
        id: Date.now(), // Mock ID generation
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real app, save to database
      res.status(201).json(applicationData);
    } catch (error) {
      console.error("Error creating loan application:", error);
      res.status(500).json({ message: "Failed to create loan application" });
    }
  });

  // Investor endpoints
  app.get('/api/investor/opportunities', async (req, res) => {
    try {
      const mockOpportunities = [
        {
          id: 1,
          lenderId: 2,
          lenderName: "Zambia Finance Corp",
          title: "Civil Servant Loan Portfolio",
          description: "Secure lending to government employees with guaranteed repayment",
          targetAmount: "ZMW 500,000",
          raisedAmount: "ZMW 320,000",
          expectedReturn: "18% p.a.",
          duration: "24 months",
          riskLevel: "Low",
          minInvestment: "ZMW 10,000",
          loanCount: 45,
          status: "Active",
          daysRemaining: 15
        },
        {
          id: 2,
          lenderId: 3,
          lenderName: "Capital Lending Ltd",
          title: "SME Business Growth Fund",
          description: "Supporting small and medium enterprises with expansion capital",
          targetAmount: "ZMW 750,000",
          raisedAmount: "ZMW 180,000",
          expectedReturn: "22% p.a.",
          duration: "36 months",
          riskLevel: "Medium",
          minInvestment: "ZMW 25,000",
          loanCount: 28,
          status: "Active",
          daysRemaining: 30
        }
      ];
      res.json(mockOpportunities);
    } catch (error) {
      console.error("Error fetching investment opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get('/api/investor/portfolio', async (req, res) => {
    try {
      const mockPortfolio = [
        {
          id: 1,
          lenderName: "Zambia Finance Corp",
          investmentAmount: "ZMW 50,000",
          currentValue: "ZMW 54,500",
          returns: "ZMW 4,500",
          returnPercentage: 9.0,
          duration: "12 months active",
          status: "Active",
          nextPayment: "2024-07-15"
        }
      ];
      res.json(mockPortfolio);
    } catch (error) {
      console.error("Error fetching investor portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get('/api/investor/summary', async (req, res) => {
    try {
      const summary = {
        totalInvested: "ZMW 125,000",
        activeInvestments: 3,
        totalReturns: "ZMW 11,250",
        averageReturn: "18.2%",
        portfolioValue: "ZMW 136,250"
      };
      res.json(summary);
    } catch (error) {
      console.error("Error fetching investor summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Distributor endpoints
  app.get('/api/distributor/referrals', async (req, res) => {
    try {
      const mockReferrals = [
        {
          id: 1,
          lenderName: "ABC Microfinance",
          email: "abc@microfinance.zm",
          status: "Active",
          signupDate: "2024-06-01",
          subscriptionPlan: "Professional",
          commissionEarned: "ZMW 250",
          monthlyRevenue: "ZMW 50"
        },
        {
          id: 2,
          lenderName: "XYZ Capital",
          email: "info@xyzcap.zm", 
          status: "Pending",
          signupDate: "2024-06-10",
          subscriptionPlan: "Starter",
          commissionEarned: "ZMW 0",
          monthlyRevenue: "ZMW 24"
        }
      ];
      res.json(mockReferrals);
    } catch (error) {
      console.error("Error fetching distributor referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.get('/api/distributor/commissions', async (req, res) => {
    try {
      const mockCommissions = [
        {
          id: 1,
          lenderName: "ABC Microfinance",
          period: "June 2024",
          subscriptionFee: "ZMW 250",
          commissionRate: 20,
          commissionAmount: "ZMW 50",
          status: "Paid",
          paymentDate: "2024-07-01"
        }
      ];
      res.json(mockCommissions);
    } catch (error) {
      console.error("Error fetching distributor commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  app.get('/api/distributor/summary', async (req, res) => {
    try {
      const summary = {
        totalReferrals: 5,
        activeReferrals: 3,
        totalCommissions: "ZMW 1,240",
        monthlyEarnings: "ZMW 150",
        conversionRate: "60%",
        tier: "Bronze"
      };
      res.json(summary);
    } catch (error) {
      console.error("Error fetching distributor summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Admin subscription package management endpoints
  app.get('/api/admin/packages', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Import the current packages from the shared file
      const { subscriptionPlans } = await import('../shared/subscriptionPlans');
      res.json(subscriptionPlans);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post('/api/admin/packages', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const newPackage = {
        ...req.body,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      // In production, this would update the database
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.put('/api/admin/packages/:id', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedPackage = {
        ...req.body,
        id: req.params.id,
        updatedAt: new Date().toISOString()
      };

      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  app.delete('/api/admin/packages/:id', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  // Comprehensive Repayment Management Routes
  
  // Get all repayments for a lender
  app.get('/api/repayments', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID - in real app get from auth
      const repayments = await storage.getRepayments(lenderId);
      res.json(repayments);
    } catch (error) {
      console.error("Error fetching repayments:", error);
      res.status(500).json({ message: "Failed to fetch repayments" });
    }
  });

  // Get single repayment
  app.get('/api/repayments/:id', async (req, res) => {
    try {
      const repayment = await storage.getRepayment(parseInt(req.params.id));
      if (!repayment) {
        return res.status(404).json({ message: "Repayment not found" });
      }
      res.json(repayment);
    } catch (error) {
      console.error("Error fetching repayment:", error);
      res.status(500).json({ message: "Failed to fetch repayment" });
    }
  });

  // Add single repayment
  app.post('/api/repayments', async (req, res) => {
    try {
      const repaymentData = {
        ...req.body,
        loanNumber: req.body.loanNumber || 'AUTO',
        borrowerName: req.body.borrowerName || 'Unknown',
        totalAmount: req.body.amount,
        status: 'pending',
        receiptNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const repayment = await storage.addRepayment(repaymentData);
      res.status(201).json(repayment);
    } catch (error) {
      console.error("Error adding repayment:", error);
      res.status(500).json({ message: "Failed to add repayment" });
    }
  });

  // Add bulk repayments
  app.post('/api/repayments/bulk', async (req, res) => {
    try {
      const { loanId, count, startDate, paymentMethod, collector, notes } = req.body;
      
      const bulkRepayments = await storage.generateBulkRepayments(
        parseInt(loanId), 
        count, 
        startDate, 
        { paymentMethod, collector, notes }
      );
      
      res.status(201).json({
        message: `Generated ${bulkRepayments.length} repayments`,
        repayments: bulkRepayments
      });
    } catch (error) {
      console.error("Error generating bulk repayments:", error);
      res.status(500).json({ message: "Failed to generate bulk repayments" });
    }
  });

  // CSV upload repayments
  app.post('/api/repayments/csv-upload', async (req, res) => {
    try {
      const { csvData } = req.body;
      
      const importedRepayments = await storage.importRepaymentsFromCsv(csvData);
      
      res.status(201).json({
        message: `Imported ${importedRepayments.length} repayments from CSV`,
        repayments: importedRepayments
      });
    } catch (error) {
      console.error("Error importing CSV repayments:", error);
      res.status(500).json({ message: "Failed to import CSV repayments" });
    }
  });

  // Approve repayment
  app.patch('/api/repayments/:id/approve', async (req, res) => {
    try {
      const repayment = await storage.approveRepayment(parseInt(req.params.id));
      if (!repayment) {
        return res.status(404).json({ message: "Repayment not found" });
      }
      res.json(repayment);
    } catch (error) {
      console.error("Error approving repayment:", error);
      res.status(500).json({ message: "Failed to approve repayment" });
    }
  });

  // Update repayment
  app.patch('/api/repayments/:id', async (req, res) => {
    try {
      const repayment = await storage.updateRepayment(parseInt(req.params.id), req.body);
      if (!repayment) {
        return res.status(404).json({ message: "Repayment not found" });
      }
      res.json(repayment);
    } catch (error) {
      console.error("Error updating repayment:", error);
      res.status(500).json({ message: "Failed to update repayment" });
    }
  });

  // Download repayment receipt
  app.get('/api/repayments/:id/receipt', async (req, res) => {
    try {
      const receiptData = await storage.getRepaymentReceipt(parseInt(req.params.id));
      if (!receiptData) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      // Generate PDF receipt (simplified - would use PDF library in production)
      const receipt = {
        ...receiptData,
        downloadUrl: `/receipts/repayment-${req.params.id}.pdf`
      };
      
      res.json(receipt);
    } catch (error) {
      console.error("Error generating receipt:", error);
      res.status(500).json({ message: "Failed to generate receipt" });
    }
  });

  // Search repayments
  app.get('/api/repayments/search', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const { query } = req.query;
      
      const results = await storage.searchRepayments(lenderId, query as string || '');
      res.json(results);
    } catch (error) {
      console.error("Error searching repayments:", error);
      res.status(500).json({ message: "Failed to search repayments" });
    }
  });

  // Get repayments by status
  app.get('/api/repayments/status/:status', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const repayments = await storage.getRepaymentsByStatus(lenderId, req.params.status);
      res.json(repayments);
    } catch (error) {
      console.error("Error fetching repayments by status:", error);
      res.status(500).json({ message: "Failed to fetch repayments by status" });
    }
  });

  // Get repayments by collector
  app.get('/api/repayments/collector/:collector', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const repayments = await storage.getRepaymentsByCollector(lenderId, req.params.collector);
      res.json(repayments);
    } catch (error) {
      console.error("Error fetching repayments by collector:", error);
      res.status(500).json({ message: "Failed to fetch repayments by collector" });
    }
  });

  // Get repayments by date range
  app.get('/api/repayments/date-range', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const { startDate, endDate } = req.query;
      
      const repayments = await storage.getRepaymentsByDateRange(
        lenderId, 
        startDate as string, 
        endDate as string
      );
      res.json(repayments);
    } catch (error) {
      console.error("Error fetching repayments by date range:", error);
      res.status(500).json({ message: "Failed to fetch repayments by date range" });
    }
  });

  // Recalculate loan on excess payment
  app.post('/api/repayments/:id/recalculate', async (req, res) => {
    try {
      const repayment = await storage.getRepayment(parseInt(req.params.id));
      if (!repayment) {
        return res.status(404).json({ message: "Repayment not found" });
      }
      
      const { excessAmount } = req.body;
      const result = await storage.recalculateLoanOnExcessPayment(repayment.loanId, excessAmount);
      
      res.json(result);
    } catch (error) {
      console.error("Error recalculating loan:", error);
      res.status(500).json({ message: "Failed to recalculate loan" });
    }
  });

  // Comprehensive Branch Management Routes
  
  // Get all branches for a lender with package restrictions
  app.get('/api/branches', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID - in real app get from auth
      const branches = await storage.getBranches(lenderId);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // Get single branch
  app.get('/api/branches/:id', async (req, res) => {
    try {
      const branch = await storage.getBranches(2).then(branches => 
        branches.find((b: any) => b.id === parseInt(req.params.id))
      );
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ message: "Failed to fetch branch" });
    }
  });

  // Create new branch (with package restrictions)
  app.post('/api/branches', async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const currentBranches = await storage.getBranches(lenderId);
      
      // Mock package limits check - in real app would fetch from user's package
      const maxBranches = 3; // Growth package limit
      if (currentBranches.length >= maxBranches) {
        return res.status(403).json({ 
          message: "Branch limit reached", 
          limit: maxBranches,
          current: currentBranches.length 
        });
      }

      const branchData = {
        ...req.body,
        lenderId,
        isActive: true,
        capital: req.body.capital || '0',
        currency: req.body.currency || 'ZMW',
        country: req.body.country || 'Zambia',
        dateFormat: req.body.dateFormat || 'DD/MM/YYYY',
        minLoanAmount: req.body.minLoanAmount || '5000',
        maxLoanAmount: req.body.maxLoanAmount || '500000',
        minInterestRate: req.body.minInterestRate || '12',
        maxInterestRate: req.body.maxInterestRate || '24',
        holidays: req.body.holidays || [],
        customFields: req.body.customFields || {},
        staffCount: 0,
        activeLoans: 0,
        totalDisbursed: '0',
      };
      
      const branch = await storage.createBranch(branchData);
      res.status(201).json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  // Update branch
  app.patch('/api/branches/:id', async (req, res) => {
    try {
      const branch = await storage.updateBranch(parseInt(req.params.id), req.body);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "Failed to update branch" });
    }
  });

  // Delete branch (with restrictions)
  app.delete('/api/branches/:id', async (req, res) => {
    try {
      const lenderId = 2;
      const branches = await storage.getBranches(lenderId);
      
      if (branches.length <= 1) {
        return res.status(403).json({ 
          message: "Cannot delete the last branch" 
        });
      }

      const success = await storage.deleteBranch(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      res.json({ message: "Branch deleted successfully" });
    } catch (error) {
      console.error("Error deleting branch:", error);
      res.status(500).json({ message: "Failed to delete branch" });
    }
  });

  // Get branch settings
  app.get('/api/branches/:id/settings', async (req, res) => {
    try {
      const settings = await storage.getBranchSettings(parseInt(req.params.id));
      if (!settings) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching branch settings:", error);
      res.status(500).json({ message: "Failed to fetch branch settings" });
    }
  });

  // Update branch settings
  app.patch('/api/branches/:id/settings', async (req, res) => {
    try {
      const settings = await storage.updateBranchSettings(parseInt(req.params.id), req.body);
      if (!settings) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error updating branch settings:", error);
      res.status(500).json({ message: "Failed to update branch settings" });
    }
  });

  // Get branch holidays
  app.get('/api/branches/:id/holidays', async (req, res) => {
    try {
      const holidays = await storage.getBranchHolidays(parseInt(req.params.id));
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching branch holidays:", error);
      res.status(500).json({ message: "Failed to fetch branch holidays" });
    }
  });

  // Add branch holiday
  app.post('/api/branches/:id/holidays', async (req, res) => {
    try {
      const { holiday } = req.body;
      const success = await storage.addBranchHoliday(parseInt(req.params.id), holiday);
      if (!success) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json({ message: "Holiday added successfully" });
    } catch (error) {
      console.error("Error adding branch holiday:", error);
      res.status(500).json({ message: "Failed to add branch holiday" });
    }
  });

  // Remove branch holiday
  app.delete('/api/branches/:id/holidays/:holiday', async (req, res) => {
    try {
      const success = await storage.removeBranchHoliday(
        parseInt(req.params.id), 
        req.params.holiday
      );
      if (!success) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json({ message: "Holiday removed successfully" });
    } catch (error) {
      console.error("Error removing branch holiday:", error);
      res.status(500).json({ message: "Failed to remove branch holiday" });
    }
  });

  // Get branch staff
  app.get('/api/branches/:id/staff', async (req, res) => {
    try {
      const staff = await storage.getBranchStaff(parseInt(req.params.id));
      res.json(staff);
    } catch (error) {
      console.error("Error fetching branch staff:", error);
      res.status(500).json({ message: "Failed to fetch branch staff" });
    }
  });

  // Assign staff to branch
  app.post('/api/branches/:id/staff', async (req, res) => {
    try {
      const { staffId } = req.body;
      const success = await storage.assignStaffToBranch(staffId, parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Staff member or branch not found" });
      }
      res.json({ message: "Staff assigned to branch successfully" });
    } catch (error) {
      console.error("Error assigning staff to branch:", error);
      res.status(500).json({ message: "Failed to assign staff to branch" });
    }
  });

  // Get branch capital information
  app.get('/api/branches/:id/capital', async (req, res) => {
    try {
      const capital = await storage.getBranchCapital(parseInt(req.params.id));
      if (!capital) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(capital);
    } catch (error) {
      console.error("Error fetching branch capital:", error);
      res.status(500).json({ message: "Failed to fetch branch capital" });
    }
  });

  // Update branch capital
  app.patch('/api/branches/:id/capital', async (req, res) => {
    try {
      const { amount } = req.body;
      const success = await storage.updateBranchCapital(parseInt(req.params.id), amount);
      if (!success) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json({ message: "Branch capital updated successfully" });
    } catch (error) {
      console.error("Error updating branch capital:", error);
      res.status(500).json({ message: "Failed to update branch capital" });
    }
  });

  // Staff Roles Management API endpoints
  
  // Get all staff roles
  app.get('/api/staff-roles', async (req, res) => {
    try {
      const lenderId = req.query.lenderId ? parseInt(req.query.lenderId as string) : 2; // Default to test lender
      const roles = await storage.getStaffRoles(lenderId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching staff roles:", error);
      res.status(500).json({ message: "Failed to fetch staff roles" });
    }
  });

  // Create staff role
  app.post('/api/staff-roles', async (req, res) => {
    try {
      const role = await storage.createStaffRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating staff role:", error);
      res.status(500).json({ message: "Failed to create staff role" });
    }
  });

  // Update staff role
  app.patch('/api/staff-roles/:id', async (req, res) => {
    try {
      const role = await storage.updateStaffRole(parseInt(req.params.id), req.body);
      if (!role) {
        return res.status(404).json({ message: "Staff role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error updating staff role:", error);
      res.status(500).json({ message: "Failed to update staff role" });
    }
  });

  // Delete staff role
  app.delete('/api/staff-roles/:id', async (req, res) => {
    try {
      const success = await storage.deleteStaffRole(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Staff role not found" });
      }
      res.json({ message: "Staff role deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff role:", error);
      res.status(500).json({ message: "Failed to delete staff role" });
    }
  });

  // Get all staff members
  app.get('/api/staff-members', async (req, res) => {
    try {
      const lenderId = req.query.lenderId ? parseInt(req.query.lenderId as string) : 2; // Default to test lender
      const staff = await storage.getStaffMembers(lenderId);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.status(500).json({ message: "Failed to fetch staff members" });
    }
  });

  // Create staff member
  app.post('/api/staff-members', async (req, res) => {
    try {
      const staffMember = await storage.createStaffMember(req.body);
      res.status(201).json(staffMember);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  // Update staff member
  app.patch('/api/staff-members/:id', async (req, res) => {
    try {
      const staffMember = await storage.updateStaffMember(parseInt(req.params.id), req.body);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  // Delete staff member
  app.delete('/api/staff-members/:id', async (req, res) => {
    try {
      const success = await storage.deleteStaffMember(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Get staff member permissions
  app.get('/api/staff-members/:id/permissions', async (req, res) => {
    try {
      const permissions = await storage.getStaffMemberPermissions(parseInt(req.params.id));
      if (!permissions) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching staff permissions:", error);
      res.status(500).json({ message: "Failed to fetch staff permissions" });
    }
  });

  // Validate staff login restrictions
  app.post('/api/staff-members/:id/validate-login', async (req, res) => {
    try {
      const { ipAddress, userAgent, loginTime } = req.body;
      const isValid = await storage.validateStaffLogin({ 
        memberId: parseInt(req.params.id),
        ipAddress, 
        userAgent, 
        loginTime 
      });
      res.json({ isValid });
    } catch (error) {
      console.error("Error validating staff login:", error);
      res.status(500).json({ message: "Failed to validate staff login" });
    }
  });

  // Log staff activity
  app.post('/api/staff-members/:id/activity', async (req, res) => {
    try {
      const { action, details, ipAddress } = req.body;
      await storage.logStaffActivity(parseInt(req.params.id), {
        action,
        details,
        ipAddress,
        timestamp: new Date()
      });
      res.json({ message: "Activity logged successfully" });
    } catch (error) {
      console.error("Error logging staff activity:", error);
      res.status(500).json({ message: "Failed to log staff activity" });
    }
  });

  // Collateral Management API endpoints
  
  // Get all collateral
  app.get('/api/collateral', async (req, res) => {
    try {
      const collateral = await storage.getCollateral();
      res.json(collateral);
    } catch (error) {
      console.error("Error fetching collateral:", error);
      res.status(500).json({ message: "Failed to fetch collateral" });
    }
  });

  // Create collateral
  app.post('/api/collateral', async (req, res) => {
    try {
      const collateral = await storage.createCollateral(req.body);
      res.status(201).json(collateral);
    } catch (error) {
      console.error("Error creating collateral:", error);
      res.status(500).json({ message: "Failed to create collateral" });
    }
  });

  // Update collateral
  app.patch('/api/collateral/:id', async (req, res) => {
    try {
      const collateral = await storage.updateCollateral(parseInt(req.params.id), req.body);
      if (!collateral) {
        return res.status(404).json({ message: "Collateral not found" });
      }
      res.json(collateral);
    } catch (error) {
      console.error("Error updating collateral:", error);
      res.status(500).json({ message: "Failed to update collateral" });
    }
  });

  // Delete collateral
  app.delete('/api/collateral/:id', async (req, res) => {
    try {
      const success = await storage.deleteCollateral(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Collateral not found" });
      }
      res.json({ message: "Collateral deleted successfully" });
    } catch (error) {
      console.error("Error deleting collateral:", error);
      res.status(500).json({ message: "Failed to delete collateral" });
    }
  });

  // Get all collateral types
  app.get('/api/collateral-types', async (req, res) => {
    try {
      const types = await storage.getCollateralTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching collateral types:", error);
      res.status(500).json({ message: "Failed to fetch collateral types" });
    }
  });

  // Create collateral type
  app.post('/api/collateral-types', async (req, res) => {
    try {
      const type = await storage.createCollateralType(req.body);
      res.status(201).json(type);
    } catch (error) {
      console.error("Error creating collateral type:", error);
      res.status(500).json({ message: "Failed to create collateral type" });
    }
  });

  // Update collateral type
  app.patch('/api/collateral-types/:id', async (req, res) => {
    try {
      const type = await storage.updateCollateralType(parseInt(req.params.id), req.body);
      if (!type) {
        return res.status(404).json({ message: "Collateral type not found" });
      }
      res.json(type);
    } catch (error) {
      console.error("Error updating collateral type:", error);
      res.status(500).json({ message: "Failed to update collateral type" });
    }
  });

  // Delete collateral type
  app.delete('/api/collateral-types/:id', async (req, res) => {
    try {
      const success = await storage.deleteCollateralType(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Collateral type not found" });
      }
      res.json({ message: "Collateral type deleted successfully" });
    } catch (error) {
      console.error("Error deleting collateral type:", error);
      res.status(500).json({ message: "Failed to delete collateral type" });
    }
  });

  // Communications Management API endpoints
  
  // Get all notification settings
  app.get('/api/notifications/settings', async (req, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  // Update notification setting
  app.patch('/api/notifications/settings/:id', async (req, res) => {
    try {
      const setting = await storage.updateNotificationSetting(req.params.id, req.body);
      if (!setting) {
        return res.status(404).json({ message: "Notification setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error updating notification setting:", error);
      res.status(500).json({ message: "Failed to update notification setting" });
    }
  });

  // Get SMS/Email provider settings
  app.get('/api/communications/providers', async (req, res) => {
    try {
      const providers = await storage.getCommunicationProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching communication providers:", error);
      res.status(500).json({ message: "Failed to fetch communication providers" });
    }
  });

  // Update SMS/Email provider settings
  app.patch('/api/communications/providers/:type', async (req, res) => {
    try {
      const provider = await storage.updateCommunicationProvider(req.params.type, req.body);
      res.json(provider);
    } catch (error) {
      console.error("Error updating communication provider:", error);
      res.status(500).json({ message: "Failed to update communication provider" });
    }
  });

  // Send test notification
  app.post('/api/communications/test', async (req, res) => {
    try {
      const { type, recipient, message, template } = req.body;
      const result = await storage.sendTestNotification(type, recipient, message, template);
      res.json(result);
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Get notification history
  app.get('/api/communications/history', async (req, res) => {
    try {
      const { page = 1, limit = 50, type, status } = req.query;
      const history = await storage.getNotificationHistory(
        parseInt(page as string),
        parseInt(limit as string),
        type as string,
        status as string
      );
      res.json(history);
    } catch (error) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({ message: "Failed to fetch notification history" });
    }
  });

  // Get branch performance
  app.get('/api/branches/:id/performance', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const performance = await storage.getBranchPerformance(
        parseInt(req.params.id),
        startDate as string,
        endDate as string
      );
      if (!performance) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(performance);
    } catch (error) {
      console.error("Error fetching branch performance:", error);
      res.status(500).json({ message: "Failed to fetch branch performance" });
    }
  });

  // Get user package info for branch limits
  app.get('/api/auth/user/package', async (req, res) => {
    try {
      // Mock package data - in real app would fetch from user's subscription
      const packageData = {
        name: "Growth",
        maxBranches: 3,
        currentBranches: 1,
        features: {
          unlimitedBranches: false,
          customFields: true,
          advancedReporting: true,
          multiCurrency: true,
          staffAccess: true,
          holidayScheduling: true,
          branchCapitalTracking: true,
        }
      };
      res.json(packageData);
    } catch (error) {
      console.error("Error fetching package info:", error);
      res.status(500).json({ message: "Failed to fetch package info" });
    }
  });

  // Trial status and management endpoints
  app.get('/api/auth/trial-status', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const now = new Date();
      let trialStatus = {
        isOnTrial: false,
        trialExpired: false,
        daysRemaining: 0,
        trialEndDate: user.trialEndDate,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        requiresPayment: false,
      };

      if (user.subscriptionStatus === 'trial' && user.trialEndDate) {
        const endDate = new Date(user.trialEndDate);
        const timeDiff = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        trialStatus = {
          isOnTrial: true,
          trialExpired: daysRemaining <= 0,
          daysRemaining: Math.max(0, daysRemaining),
          trialEndDate: user.trialEndDate,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan,
          requiresPayment: daysRemaining <= 0,
        };

        // Auto-expire trial if time has passed
        if (daysRemaining <= 0 && user.subscriptionStatus === 'trial') {
          await storage.updateUser(user.id, { 
            subscriptionStatus: 'expired' 
          });
          trialStatus.subscriptionStatus = 'expired';
        }
      }

      res.json(trialStatus);
    } catch (error) {
      console.error("Error fetching trial status:", error);
      res.status(500).json({ message: "Failed to fetch trial status" });
    }
  });

  // Extend trial (admin only)
  app.post('/api/auth/extend-trial/:userId', authenticateToken, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.userId);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { days } = req.body;
      
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentEndDate = user.trialEndDate ? new Date(user.trialEndDate) : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + (days || 14));

      await storage.updateUser(parseInt(userId), {
        trialEndDate: newEndDate,
        subscriptionStatus: 'trial'
      });

      res.json({ 
        message: `Trial extended by ${days || 14} days`,
        newEndDate: newEndDate 
      });
    } catch (error) {
      console.error("Error extending trial:", error);
      res.status(500).json({ message: "Failed to extend trial" });
    }
  });

  // Activate subscription after payment
  app.post('/api/auth/activate-subscription', authenticateToken, async (req: any, res) => {
    try {
      const { planName, billingCycle } = req.body;
      
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUser(user.id, {
        subscriptionPlan: planName.toLowerCase(),
        subscriptionStatus: 'active',
        billingCycle: billingCycle || 'monthly',
        trialEndDate: null,
      });

      res.json({ 
        message: "Subscription activated successfully",
        subscriptionPlan: planName.toLowerCase(),
        subscriptionStatus: 'active'
      });
    } catch (error) {
      console.error("Error activating subscription:", error);
      res.status(500).json({ message: "Failed to activate subscription" });
    }
  });

  // Platform statistics endpoint for real-time dashboard
  app.get('/api/platform/stats', async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allLoanProducts = await storage.getAllActiveLoanProducts();
      
      const totalBorrowers = allUsers.filter(user => user.role === 'borrower').length;
      const totalLenders = allUsers.filter(user => user.role === 'lender').length;
      const totalInvestors = allUsers.filter(user => user.role === 'investor').length;
      const activeLoans = allLoanProducts.length;
      
      const stats = {
        totalBorrowers,
        totalLenders,
        totalInvestors,
        activeLoans,
        serverStatus: 'online',
        lastUpdated: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });

  // Online users tracking endpoint
  let onlineUsers = new Set();

  app.get('/api/platform/online-users', async (req, res) => {
    try {
      // Add this request's IP to online users
      const userIP = req.ip || req.connection.remoteAddress;
      if (userIP) {
        onlineUsers.add(userIP);
      }

      // Clean up stale connections (remove IPs not seen in last 30 seconds)
      const cleanupInterval = 30000;
      setTimeout(() => {
        // In a production environment, you'd implement proper session tracking
        // For now, we simulate by gradually reducing the count
        if (onlineUsers.size > 1) {
          const usersArray = Array.from(onlineUsers);
          const randomUser = usersArray[Math.floor(Math.random() * usersArray.length)];
          onlineUsers.delete(randomUser);
        }
      }, cleanupInterval);

      res.json({
        onlineUsers: onlineUsers.size,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  app.put('/api/loan-applications/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedApplication = await storage.updateLoanApplication(parseInt(id), req.body);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating loan application:", error);
      res.status(500).json({ message: "Failed to update loan application" });
    }
  });

  // Payment Submission routes
  app.post('/api/payment-submissions', authenticateToken, async (req: any, res) => {
    try {
      const submissionData = {
        ...req.body,
        userId: req.user.userId,
        status: 'pending',
      };

      const submission = await storage.createPaymentSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating payment submission:", error);
      res.status(500).json({ message: "Failed to create payment submission" });
    }
  });

  app.get('/api/payment-submissions', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const submissions = await storage.getAllPaymentSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching payment submissions:", error);
      res.status(500).json({ message: "Failed to fetch payment submissions" });
    }
  });

  app.put('/api/payment-submissions/:id', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const updates = {
        ...req.body,
        reviewedBy: req.user.userId,
      };

      const updatedSubmission = await storage.updatePaymentSubmission(parseInt(id), updates);
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating payment submission:", error);
      res.status(500).json({ message: "Failed to update payment submission" });
    }
  });

  // File upload route
  app.post('/api/upload', authenticateToken, async (req, res) => {
    try {
      // Mock file upload - in production this would handle actual file storage
      const mockFilePath = `uploads/document_${Date.now()}.pdf`;
      res.json({ filePath: mockFilePath });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Admin routes for lender management
  app.get('/api/admin/lender-applications', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const applications = await storage.getLenderApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching lender applications:", error);
      res.status(500).json({ message: "Failed to fetch lender applications" });
    }
  });

  app.put('/api/admin/lender-applications/:id/approve', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const application = await storage.updateLenderApplication(parseInt(id), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user.userId,
      });

      // Create admin action log
      await storage.createAdminAction({
        adminId: req.user.userId,
        targetType: 'lender_application',
        targetId: parseInt(id),
        action: 'approve',
        notes: 'Lender application approved',
      });

      res.json(application);
    } catch (error) {
      console.error("Error approving lender application:", error);
      res.status(500).json({ message: "Failed to approve application" });
    }
  });

  app.put('/api/admin/lender-applications/:id/reject', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { reason } = req.body;
      
      const application = await storage.updateLenderApplication(parseInt(id), {
        status: 'rejected',
        reviewNotes: reason,
        approvedBy: req.user.userId,
      });

      // Create admin action log
      await storage.createAdminAction({
        adminId: req.user.userId,
        targetType: 'lender_application',
        targetId: parseInt(id),
        action: 'reject',
        reason: reason,
      });

      res.json(application);
    } catch (error) {
      console.error("Error rejecting lender application:", error);
      res.status(500).json({ message: "Failed to reject application" });
    }
  });

  app.get('/api/admin/lenders', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const lenders = await storage.getAllLenders();
      res.json(lenders);
    } catch (error) {
      console.error("Error fetching lenders:", error);
      res.status(500).json({ message: "Failed to fetch lenders" });
    }
  });

  app.get('/api/admin/actions', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const actions = await storage.getAdminActions();
      res.json(actions);
    } catch (error) {
      console.error("Error fetching admin actions:", error);
      res.status(500).json({ message: "Failed to fetch admin actions" });
    }
  });

  // Lender application submission route
  app.post('/api/lender-applications', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Lender role required" });
      }

      const applicationData = {
        ...req.body,
        userId: req.user.userId,
      };

      const application = await storage.createLenderApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating lender application:", error);
      res.status(500).json({ message: "Failed to create lender application" });
    }
  });

  app.get('/api/lender-applications/my', authenticateToken, async (req: any, res) => {
    try {
      const application = await storage.getLenderApplicationByUserId(req.user.userId);
      res.json(application);
    } catch (error) {
      console.error("Error fetching user's lender application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Admin API endpoints for platform monitoring
  app.get('/api/admin/dashboard-stats', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      const lenderApplications = await storage.getLenderApplications();
      const paymentSubmissions = await storage.getAllPaymentSubmissions();
      
      const today = new Date().toDateString();
      const todaySignups = lenderApplications.filter(app => 
        new Date(app.submittedAt).toDateString() === today
      );

      const stats = {
        totalUsers: users.length,
        totalLenders: users.filter(u => u.role === 'lender').length,
        totalBorrowers: users.filter(u => u.role === 'borrower').length,
        todayLenderSignups: todaySignups.length,
        targetLenderSignups: 3,
        pendingPayments: paymentSubmissions.filter(p => p.status === 'pending').length,
        approvedPayments: paymentSubmissions.filter(p => p.status === 'approved').length,
        totalRevenue: paymentSubmissions
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + parseInt(p.amount.replace('K', '')), 0),
        platformUsers: users
      };

      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/recent-signups', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const lenderApplications = await storage.getLenderApplications();
      const recentSignups = lenderApplications
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10);

      res.json(recentSignups);
    } catch (error) {
      console.error("Recent signups error:", error);
      res.status(500).json({ message: "Failed to fetch recent signups" });
    }
  });

  app.get('/api/admin/all-users', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        billingCycle: user.billingCycle,
        createdAt: user.createdAt
      }));

      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Comprehensive Borrower Management API endpoints
  
  // Get all borrowers for a lender
  app.get('/api/borrowers', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access borrowers" });
      }

      const borrowers = await storage.getBorrowersByLender(req.user.userId);
      res.json(borrowers);
    } catch (error) {
      console.error("Error fetching borrowers:", error);
      res.status(500).json({ message: "Failed to fetch borrowers" });
    }
  });

  // Get single borrower
  app.get('/api/borrowers/:id', authenticateToken, async (req: any, res) => {
    try {
      const borrower = await storage.getBorrower(parseInt(req.params.id));
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }
      
      const user = await storage.getUser(req.user.userId);
      if (!user || (user.role !== 'lender' && user.role !== 'admin') || 
          (user.role === 'lender' && borrower.lenderId !== req.user.userId)) {
        return res.status(403).json({ message: "Not authorized to access this borrower" });
      }

      res.json(borrower);
    } catch (error) {
      console.error("Error fetching borrower:", error);
      res.status(500).json({ message: "Failed to fetch borrower" });
    }
  });

  // Create new borrower
  app.post('/api/borrowers', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create borrowers" });
      }

      const borrowerData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const borrower = await storage.createBorrower(borrowerData);
      res.status(201).json(borrower);
    } catch (error) {
      console.error("Error creating borrower:", error);
      res.status(500).json({ message: "Failed to create borrower" });
    }
  });

  // Update borrower
  app.put('/api/borrowers/:id', authenticateToken, async (req: any, res) => {
    try {
      const borrower = await storage.getBorrower(parseInt(req.params.id));
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user || (user.role !== 'lender' && user.role !== 'admin') || 
          (user.role === 'lender' && borrower.lenderId !== req.user.userId)) {
        return res.status(403).json({ message: "Not authorized to update this borrower" });
      }

      const updatedBorrower = await storage.updateBorrower(parseInt(req.params.id), req.body);
      res.json(updatedBorrower);
    } catch (error) {
      console.error("Error updating borrower:", error);
      res.status(500).json({ message: "Failed to update borrower" });
    }
  });

  // Delete borrower
  app.delete('/api/borrowers/:id', authenticateToken, async (req: any, res) => {
    try {
      const borrower = await storage.getBorrower(parseInt(req.params.id));
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user || (user.role !== 'lender' && user.role !== 'admin') || 
          (user.role === 'lender' && borrower.lenderId !== req.user.userId)) {
        return res.status(403).json({ message: "Not authorized to delete this borrower" });
      }

      await storage.deleteBorrower(parseInt(req.params.id));
      res.json({ message: "Borrower deleted successfully" });
    } catch (error) {
      console.error("Error deleting borrower:", error);
      res.status(500).json({ message: "Failed to delete borrower" });
    }
  });

  // Search borrowers
  app.get('/api/borrowers/search/:query', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can search borrowers" });
      }

      const borrowers = await storage.searchBorrowers(req.user.userId, req.params.query);
      res.json(borrowers);
    } catch (error) {
      console.error("Error searching borrowers:", error);
      res.status(500).json({ message: "Failed to search borrowers" });
    }
  });

  // Send SMS to borrower
  app.post('/api/borrowers/:id/sms', authenticateToken, async (req: any, res) => {
    try {
      const borrower = await storage.getBorrower(parseInt(req.params.id));
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender' || borrower.lenderId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to send SMS to this borrower" });
      }

      if (!borrower.mobile) {
        return res.status(400).json({ message: "Borrower has no mobile number" });
      }

      // In production, integrate with SMS service
      console.log(`SMS to ${borrower.mobile}: ${req.body.message}`);
      
      res.json({ message: "SMS sent successfully" });
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ message: "Failed to send SMS" });
    }
  });

  // Send email to borrower
  app.post('/api/borrowers/:id/email', authenticateToken, async (req: any, res) => {
    try {
      const borrower = await storage.getBorrower(parseInt(req.params.id));
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender' || borrower.lenderId !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to send email to this borrower" });
      }

      if (!borrower.email) {
        return res.status(400).json({ message: "Borrower has no email address" });
      }

      // In production, integrate with email service
      console.log(`Email to ${borrower.email}: ${req.body.subject} - ${req.body.message}`);
      
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Custom Fields Management
  app.get('/api/custom-fields', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access custom fields" });
      }

      const fields = await storage.getCustomFields(req.user.userId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });

  app.post('/api/custom-fields', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create custom fields" });
      }

      const fieldData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const field = await storage.createCustomField(fieldData);
      res.status(201).json(field);
    } catch (error) {
      console.error("Error creating custom field:", error);
      res.status(500).json({ message: "Failed to create custom field" });
    }
  });

  app.delete('/api/custom-fields/:id', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can delete custom fields" });
      }

      await storage.deleteCustomField(parseInt(req.params.id));
      res.json({ message: "Custom field deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom field:", error);
      res.status(500).json({ message: "Failed to delete custom field" });
    }
  });

  // Loan Officers Management
  app.get('/api/loan-officers', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access loan officers" });
      }

      const officers = await storage.getLoanOfficers(req.user.userId);
      res.json(officers);
    } catch (error) {
      console.error("Error fetching loan officers:", error);
      res.status(500).json({ message: "Failed to fetch loan officers" });
    }
  });

  app.post('/api/loan-officers', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create loan officers" });
      }

      const officerData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const officer = await storage.createLoanOfficer(officerData);
      res.status(201).json(officer);
    } catch (error) {
      console.error("Error creating loan officer:", error);
      res.status(500).json({ message: "Failed to create loan officer" });
    }
  });

  // Branches Management
  app.get('/api/branches', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access branches" });
      }

      const branches = await storage.getBranches(req.user.userId);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.post('/api/branches', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create branches" });
      }

      const branchData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const branch = await storage.createBranch(branchData);
      res.status(201).json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  // Expenses Management API Routes
  app.get('/api/expenses', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access expenses" });
      }

      const expenses = await storage.getExpenses(req.user.userId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create expenses" });
      }

      const expenseData = {
        ...req.body,
        lenderId: req.user.userId,
        createdBy: req.user.userId,
        loanId: req.body.loanId === "none" ? null : req.body.loanId,
        branchId: req.body.branchId === "none" ? null : req.body.branchId,
      };

      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.get('/api/expense-types', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access expense types" });
      }

      const expenseTypes = await storage.getExpenseTypes(req.user.userId);
      res.json(expenseTypes);
    } catch (error) {
      console.error("Error fetching expense types:", error);
      res.status(500).json({ message: "Failed to fetch expense types" });
    }
  });

  app.post('/api/expense-types', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create expense types" });
      }

      const expenseTypeData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const expenseType = await storage.createExpenseType(expenseTypeData);
      res.status(201).json(expenseType);
    } catch (error) {
      console.error("Error creating expense type:", error);
      res.status(500).json({ message: "Failed to create expense type" });
    }
  });

  app.get('/api/expense-custom-fields', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can access expense custom fields" });
      }

      const customFields = await storage.getExpenseCustomFields(req.user.userId);
      res.json(customFields);
    } catch (error) {
      console.error("Error fetching expense custom fields:", error);
      res.status(500).json({ message: "Failed to fetch expense custom fields" });
    }
  });

  app.post('/api/expense-custom-fields', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can create expense custom fields" });
      }

      const customFieldData = {
        ...req.body,
        lenderId: req.user.userId,
      };

      const customField = await storage.createExpenseCustomField(customFieldData);
      res.status(201).json(customField);
    } catch (error) {
      console.error("Error creating expense custom field:", error);
      res.status(500).json({ message: "Failed to create expense custom field" });
    }
  });

  app.put('/api/expenses/:id', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can update expenses" });
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user.userId,
        loanId: req.body.loanId === "none" ? null : req.body.loanId,
        branchId: req.body.branchId === "none" ? null : req.body.branchId,
      };

      const expense = await storage.updateExpense(parseInt(req.params.id), updateData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can delete expenses" });
      }

      await storage.deleteExpense(parseInt(req.params.id));
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  app.post('/api/expenses/bulk-upload', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can bulk upload expenses" });
      }

      const { expenses } = req.body;
      const results = await storage.bulkCreateExpenses(expenses.map((expense: any) => ({
        ...expense,
        lenderId: req.user.userId,
        createdBy: req.user.userId,
      })));

      res.json({ 
        message: "Bulk upload completed", 
        created: results.length,
        expenses: results 
      });
    } catch (error) {
      console.error("Error bulk uploading expenses:", error);
      res.status(500).json({ message: "Failed to bulk upload expenses" });
    }
  });

  app.get('/api/expenses/export', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user || user.role !== 'lender') {
        return res.status(403).json({ message: "Only lenders can export expenses" });
      }

      const { format } = req.query;
      const expenses = await storage.getExpenses(req.user.userId);
      
      // Transform expenses for export
      const exportData = expenses.map((expense: any) => ({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency,
        expenseDate: expense.expenseDate,
        vendor: expense.vendor,
        category: expense.category,
        status: expense.status,
        createdAt: expense.createdAt,
      }));

      res.json({
        data: exportData,
        format: format || 'csv',
        filename: `expenses_export_${new Date().toISOString().split('T')[0]}.${format || 'csv'}`
      });
    } catch (error) {
      console.error("Error exporting expenses:", error);
      res.status(500).json({ message: "Failed to export expenses" });
    }
  });

  // ===== COMPREHENSIVE ADMIN CRUD OPERATIONS FOR SAAS MANAGEMENT =====

  // User Management - Full CRUD Operations
  app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { page = 1, limit = 10, role, status } = req.query;
      let users = await storage.getAllUsers();
      
      if (role) users = users.filter(u => u.role === role);
      if (status) users = users.filter(u => u.subscriptionStatus === status);
      
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = users.slice(startIndex, endIndex);
      
      res.json({
        users: paginatedUsers,
        total: users.length,
        page: parseInt(page),
        totalPages: Math.ceil(users.length / parseInt(limit))
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/admin/users', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userData = {
        ...req.body,
        isVerified: true,
        subscriptionStatus: req.body.subscriptionStatus || 'trial',
        trialStartDate: req.body.subscriptionStatus === 'trial' ? new Date() : null,
        trialEndDate: req.body.subscriptionStatus === 'trial' ? 
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null
      };
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const updates = req.body;
      
      if (updates.subscriptionStatus === 'trial' && !updates.trialStartDate) {
        updates.trialStartDate = new Date();
        updates.trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      }
      
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const user = await storage.updateUser(parseInt(req.params.id), { 
        subscriptionStatus: 'inactive',
        isVerified: false 
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Package Management - Upgrade/Downgrade Operations
  app.post('/api/admin/users/:id/upgrade', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { subscriptionPlan, billingCycle } = req.body;
      const user = await storage.updateUser(parseInt(req.params.id), {
        subscriptionPlan,
        billingCycle,
        subscriptionStatus: 'active'
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Package upgraded successfully", user });
    } catch (error) {
      console.error("Error upgrading package:", error);
      res.status(500).json({ message: "Failed to upgrade package" });
    }
  });

  app.post('/api/admin/users/:id/downgrade', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { subscriptionPlan, billingCycle } = req.body;
      const user = await storage.updateUser(parseInt(req.params.id), {
        subscriptionPlan,
        billingCycle,
        subscriptionStatus: 'active'
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Package downgraded successfully", user });
    } catch (error) {
      console.error("Error downgrading package:", error);
      res.status(500).json({ message: "Failed to downgrade package" });
    }
  });

  // Trial Management Operations
  app.get('/api/admin/trials', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allUsers = await storage.getAllUsers();
      const trialUsers = allUsers.filter(u => u.subscriptionStatus === 'trial');
      
      const trialsWithDays = trialUsers.map(user => {
        const daysLeft = user.trialEndDate ? 
          Math.ceil((new Date(user.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        return {
          ...user,
          daysLeft,
          isExpiring: daysLeft <= 3
        };
      });
      
      res.json(trialsWithDays);
    } catch (error) {
      console.error("Error fetching trials:", error);
      res.status(500).json({ message: "Failed to fetch trials" });
    }
  });

  app.post('/api/admin/trials/:id/extend', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { days } = req.body;
      const user = await storage.getUser(parseInt(req.params.id));
      
      if (!user || user.subscriptionStatus !== 'trial') {
        return res.status(404).json({ message: "Trial user not found" });
      }
      
      const currentEndDate = new Date(user.trialEndDate || Date.now());
      const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);
      
      const updatedUser = await storage.updateUser(parseInt(req.params.id), {
        trialEndDate: newEndDate
      });
      
      res.json({ message: "Trial extended successfully", user: updatedUser });
    } catch (error) {
      console.error("Error extending trial:", error);
      res.status(500).json({ message: "Failed to extend trial" });
    }
  });

  app.post('/api/admin/trials/:id/convert', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { subscriptionPlan, billingCycle } = req.body;
      const user = await storage.updateUser(parseInt(req.params.id), {
        subscriptionPlan,
        billingCycle,
        subscriptionStatus: 'active',
        trialEndDate: null
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Trial converted to paid subscription", user });
    } catch (error) {
      console.error("Error converting trial:", error);
      res.status(500).json({ message: "Failed to convert trial" });
    }
  });

  // Invoice Management System
  app.get('/api/admin/invoices', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allUsers = await storage.getAllUsers();
      const activeUsers = allUsers.filter(u => u.subscriptionStatus === 'active');
      
      const invoices = activeUsers.map(user => {
        const planPrices = {
          starter: { monthly: 450, annual: 4500 },
          growth: { monthly: 950, annual: 9500 },
          wealth: { monthly: 1800, annual: 18000 },
          fortune: { monthly: 5000, annual: 50000 }
        };
        
        const amount = planPrices[user.subscriptionPlan as keyof typeof planPrices]?.[user.billingCycle as 'monthly' | 'annual'] || 0;
        
        return {
          id: user.id,
          userId: user.id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          subscriptionPlan: user.subscriptionPlan,
          billingCycle: user.billingCycle,
          amount,
          currency: 'ZMW',
          status: 'paid',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paidDate: new Date(),
          createdAt: user.createdAt
        };
      });
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Revenue Analytics for Admin Dashboard
  app.get('/api/admin/analytics/revenue', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allUsers = await storage.getAllUsers();
      const activeUsers = allUsers.filter(u => u.subscriptionStatus === 'active');
      
      const planPrices = {
        starter: { monthly: 450, annual: 4500 },
        growth: { monthly: 950, annual: 9500 },
        wealth: { monthly: 1800, annual: 18000 },
        fortune: { monthly: 5000, annual: 50000 }
      };
      
      const monthlyRevenue = activeUsers.reduce((total, user) => {
        const price = planPrices[user.subscriptionPlan as keyof typeof planPrices];
        if (price) {
          return total + (user.billingCycle === 'annual' ? price.annual / 12 : price.monthly);
        }
        return total;
      }, 0);
      
      const annualRevenue = activeUsers.reduce((total, user) => {
        const price = planPrices[user.subscriptionPlan as keyof typeof planPrices];
        if (price) {
          return total + (user.billingCycle === 'annual' ? price.annual : price.monthly * 12);
        }
        return total;
      }, 0);
      
      res.json({
        monthlyRevenue,
        annualRevenue,
        activeSubscriptions: activeUsers.length,
        averageRevenuePerUser: activeUsers.length > 0 ? monthlyRevenue / activeUsers.length : 0
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  // Portfolio Overview endpoints for Zambian lenders
  app.get("/api/portfolio/overview", async (req, res) => {
    try {
      const portfolioData = {
        totalPortfolio: 2500000,
        activeLoan: 127,
        avgLoanSize: 19685,
        collectionRate: 94.2,
        defaultRate: 3.1,
        overdueLoans: 8,
        regions: [
          { name: "Lusaka", value: 45 },
          { name: "Copperbelt", value: 30 },
          { name: "Central", value: 15 },
          { name: "Eastern", value: 10 }
        ]
      };
      res.json(portfolioData);
    } catch (error) {
      console.error("Error fetching portfolio overview:", error);
      res.status(500).json({ message: "Failed to fetch portfolio overview" });
    }
  });

  app.get("/api/portfolio/loan-products", async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const products = await storage.getLoanProductsByLender(lenderId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching loan products:", error);
      res.status(500).json({ message: "Failed to fetch loan products" });
    }
  });

  // Disbursement Management endpoints
  app.get("/api/disbursements/pending", async (req, res) => {
    try {
      const pendingDisbursements = [];
      res.json(pendingDisbursements);
    } catch (error) {
      console.error("Error fetching pending disbursements:", error);
      res.status(500).json({ message: "Failed to fetch pending disbursements" });
    }
  });

  app.get("/api/disbursements/history", async (req, res) => {
    try {
      const disbursementHistory = [];
      res.json(disbursementHistory);
    } catch (error) {
      console.error("Error fetching disbursement history:", error);
      res.status(500).json({ message: "Failed to fetch disbursement history" });
    }
  });

  app.get("/api/loans/approved", async (req, res) => {
    try {
      const lenderId = 2; // Mock lender ID
      const approvedLoans = await storage.getApplicationsByLender(lenderId);
      const filteredLoans = approvedLoans.filter(loan => loan.status === "approved");
      res.json(filteredLoans);
    } catch (error) {
      console.error("Error fetching approved loans:", error);
      res.status(500).json({ message: "Failed to fetch approved loans" });
    }
  });

  app.post("/api/disbursements/process", async (req, res) => {
    try {
      const disbursementData = req.body;
      const result = { id: Date.now(), ...disbursementData, status: "processing" };
      res.json(result);
    } catch (error) {
      console.error("Error processing disbursement:", error);
      res.status(500).json({ message: "Failed to process disbursement" });
    }
  });

  // Collections & Delinquency Management endpoints
  app.get("/api/loans/overdue", async (req, res) => {
    try {
      const overdueLoans = [];
      res.json(overdueLoans);
    } catch (error) {
      console.error("Error fetching overdue loans:", error);
      res.status(500).json({ message: "Failed to fetch overdue loans" });
    }
  });

  app.get("/api/collections/activities", async (req, res) => {
    try {
      const activities = [];
      res.json(activities);
    } catch (error) {
      console.error("Error fetching collection activities:", error);
      res.status(500).json({ message: "Failed to fetch collection activities" });
    }
  });

  app.get("/api/field-agents", async (req, res) => {
    try {
      const agents = [];
      res.json(agents);
    } catch (error) {
      console.error("Error fetching field agents:", error);
      res.status(500).json({ message: "Failed to fetch field agents" });
    }
  });

  app.post("/api/loans/:id/send-reminder", async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const result = { success: true, message: "SMS reminder sent successfully" };
      res.json(result);
    } catch (error) {
      console.error("Error sending SMS reminder:", error);
      res.status(500).json({ message: "Failed to send SMS reminder" });
    }
  });

  app.post("/api/loans/:id/reschedule", async (req, res) => {
    try {
      const { id } = req.params;
      const rescheduleData = req.body;
      const result = { success: true, message: "Payment rescheduled successfully" };
      res.json(result);
    } catch (error) {
      console.error("Error rescheduling payment:", error);
      res.status(500).json({ message: "Failed to reschedule payment" });
    }
  });

  // Offline-First Lending OS endpoints
  app.get("/api/offline/ussd-transactions", async (req, res) => {
    try {
      const transactions = [];
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching USSD transactions:", error);
      res.status(500).json({ message: "Failed to fetch USSD transactions" });
    }
  });

  app.get("/api/offline/whatsapp-messages", async (req, res) => {
    try {
      const messages = [];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching WhatsApp messages:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp messages" });
    }
  });

  app.get("/api/offline/ivr-calls", async (req, res) => {
    try {
      const calls = [];
      res.json(calls);
    } catch (error) {
      console.error("Error fetching IVR calls:", error);
      res.status(500).json({ message: "Failed to fetch IVR calls" });
    }
  });

  app.get("/api/offline/field-operations", async (req, res) => {
    try {
      const operations = [];
      res.json(operations);
    } catch (error) {
      console.error("Error fetching field operations:", error);
      res.status(500).json({ message: "Failed to fetch field operations" });
    }
  });

  app.post("/api/offline/ussd/send", async (req, res) => {
    try {
      const ussdData = req.body;
      const result = { 
        success: true, 
        message: "USSD response sent successfully",
        sessionId: Date.now().toString(),
        response: `Welcome to LoanSphere. Press 1 to apply for loan, 2 for balance inquiry, 3 for repayment.`
      };
      res.json(result);
    } catch (error) {
      console.error("Error sending USSD response:", error);
      res.status(500).json({ message: "Failed to send USSD response" });
    }
  });

  app.post("/api/offline/whatsapp/send", async (req, res) => {
    try {
      const { recipient, message } = req.body;
      const result = { 
        success: true, 
        message: "WhatsApp message sent successfully",
        messageId: Date.now().toString()
      };
      res.json(result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });

  app.post("/api/offline/ivr/initiate", async (req, res) => {
    try {
      const { phoneNumber, language } = req.body;
      const result = { 
        success: true, 
        message: "IVR call initiated successfully",
        callId: Date.now().toString(),
        estimatedDuration: "2-3 minutes"
      };
      res.json(result);
    } catch (error) {
      console.error("Error initiating IVR call:", error);
      res.status(500).json({ message: "Failed to initiate IVR call" });
    }
  });

  app.post("/api/offline/field/sync", async (req, res) => {
    try {
      const { agentId, data } = req.body;
      const result = { 
        success: true, 
        message: "Field data synchronized successfully",
        syncId: Date.now().toString(),
        itemsProcessed: data?.length || 0
      };
      res.json(result);
    } catch (error) {
      console.error("Error syncing field data:", error);
      res.status(500).json({ message: "Failed to sync field data" });
    }
  });

  // Africa's Talking Integration API endpoints with full CRUD
  
  // Get Africa's Talking configuration
  app.get("/api/africas-talking/config", async (req, res) => {
    try {
      const config = {
        username: "loansphere_prod",
        balance: "125.50",
        status: "connected",
        lastSync: new Date().toISOString()
      };
      res.json(config);
    } catch (error) {
      console.error("Error fetching AT config:", error);
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  // USSD Codes CRUD operations
  
  // Get all USSD codes
  app.get("/api/africas-talking/ussd-codes", async (req, res) => {
    try {
      const ussdCodes = [
        {
          id: 1,
          shortCode: "*123*5#",
          title: "Loan Application Menu",
          description: "Main menu for loan applications and inquiries",
          language: "english",
          isActive: true,
          responses: 0,
          successRate: 0,
          menuStructure: {
            welcome: "Welcome to LoanSphere. Press 1 for loans, 2 for balance",
            options: {
              "1": "loan_application",
              "2": "balance_inquiry",
              "3": "repayment"
            }
          }
        }
      ];
      res.json(ussdCodes);
    } catch (error) {
      console.error("Error fetching USSD codes:", error);
      res.status(500).json({ message: "Failed to fetch USSD codes" });
    }
  });

  // Create new USSD code
  app.post("/api/africas-talking/ussd-codes", async (req, res) => {
    try {
      const codeData = req.body;
      const newCode = {
        id: Date.now(),
        ...codeData,
        isActive: false,
        responses: 0,
        successRate: 0,
        createdAt: new Date().toISOString()
      };
      res.status(201).json(newCode);
    } catch (error) {
      console.error("Error creating USSD code:", error);
      res.status(500).json({ message: "Failed to create USSD code" });
    }
  });

  // Update USSD code
  app.put("/api/africas-talking/ussd-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedCode = {
        id: parseInt(id),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      res.json(updatedCode);
    } catch (error) {
      console.error("Error updating USSD code:", error);
      res.status(500).json({ message: "Failed to update USSD code" });
    }
  });

  // Delete USSD code
  app.delete("/api/africas-talking/ussd-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: "USSD code deleted successfully" });
    } catch (error) {
      console.error("Error deleting USSD code:", error);
      res.status(500).json({ message: "Failed to delete USSD code" });
    }
  });

  // Toggle USSD code status
  app.patch("/api/africas-talking/ussd-codes/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const result = {
        id: parseInt(id),
        isActive,
        message: `USSD code ${isActive ? 'activated' : 'deactivated'} successfully`
      };
      res.json(result);
    } catch (error) {
      console.error("Error toggling USSD code:", error);
      res.status(500).json({ message: "Failed to toggle USSD code status" });
    }
  });

  // Test USSD code
  app.post("/api/africas-talking/ussd-codes/:id/test", async (req, res) => {
    try {
      const { id } = req.params;
      const result = {
        testSessionId: Date.now().toString(),
        message: "Test session initiated successfully",
        testNumber: "+260977123456"
      };
      res.json(result);
    } catch (error) {
      console.error("Error testing USSD code:", error);
      res.status(500).json({ message: "Failed to test USSD code" });
    }
  });

  // USSD Sessions management
  
  // Get all USSD sessions
  app.get("/api/africas-talking/ussd-sessions", async (req, res) => {
    try {
      const sessions = [];
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching USSD sessions:", error);
      res.status(500).json({ message: "Failed to fetch USSD sessions" });
    }
  });

  // WhatsApp Business API endpoints
  
  // Get WhatsApp templates
  app.get("/api/africas-talking/whatsapp/templates", async (req, res) => {
    try {
      const templates = [
        {
          id: 1,
          name: "loan_application_welcome",
          content: "Welcome to LoanSphere! Reply with APPLY to start your loan application.",
          language: "english",
          status: "approved"
        },
        {
          id: 2,
          name: "payment_reminder",
          content: "Your payment of K{amount} is due on {date}. Reply PAY to make payment via mobile money.",
          language: "english",
          status: "approved"
        }
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching WhatsApp templates:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp templates" });
    }
  });

  // Create WhatsApp template
  app.post("/api/africas-talking/whatsapp/templates", async (req, res) => {
    try {
      const templateData = req.body;
      const newTemplate = {
        id: Date.now(),
        ...templateData,
        status: "pending_approval",
        createdAt: new Date().toISOString()
      };
      res.status(201).json(newTemplate);
    } catch (error) {
      console.error("Error creating WhatsApp template:", error);
      res.status(500).json({ message: "Failed to create WhatsApp template" });
    }
  });

  // Update WhatsApp template
  app.put("/api/africas-talking/whatsapp/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedTemplate = {
        id: parseInt(id),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating WhatsApp template:", error);
      res.status(500).json({ message: "Failed to update WhatsApp template" });
    }
  });

  // Delete WhatsApp template
  app.delete("/api/africas-talking/whatsapp/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: "WhatsApp template deleted successfully" });
    } catch (error) {
      console.error("Error deleting WhatsApp template:", error);
      res.status(500).json({ message: "Failed to delete WhatsApp template" });
    }
  });

  // Send WhatsApp message
  app.post("/api/africas-talking/whatsapp/send", async (req, res) => {
    try {
      const { recipient, template, variables } = req.body;
      const result = {
        messageId: Date.now().toString(),
        status: "sent",
        recipient,
        sentAt: new Date().toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });

  // IVR Management endpoints
  
  // Get IVR flows
  app.get("/api/africas-talking/ivr/flows", async (req, res) => {
    try {
      const flows = [
        {
          id: 1,
          name: "Main Loan Menu",
          description: "Primary IVR flow for loan services",
          language: "english",
          steps: [
            { step: 1, action: "play", content: "Welcome to LoanSphere" },
            { step: 2, action: "menu", options: ["1: Apply for loan", "2: Check balance", "3: Make payment"] }
          ],
          isActive: true
        }
      ];
      res.json(flows);
    } catch (error) {
      console.error("Error fetching IVR flows:", error);
      res.status(500).json({ message: "Failed to fetch IVR flows" });
    }
  });

  // Create IVR flow
  app.post("/api/africas-talking/ivr/flows", async (req, res) => {
    try {
      const flowData = req.body;
      const newFlow = {
        id: Date.now(),
        ...flowData,
        isActive: false,
        createdAt: new Date().toISOString()
      };
      res.status(201).json(newFlow);
    } catch (error) {
      console.error("Error creating IVR flow:", error);
      res.status(500).json({ message: "Failed to create IVR flow" });
    }
  });

  // Update IVR flow
  app.put("/api/africas-talking/ivr/flows/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedFlow = {
        id: parseInt(id),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      res.json(updatedFlow);
    } catch (error) {
      console.error("Error updating IVR flow:", error);
      res.status(500).json({ message: "Failed to update IVR flow" });
    }
  });

  // Delete IVR flow
  app.delete("/api/africas-talking/ivr/flows/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: "IVR flow deleted successfully" });
    } catch (error) {
      console.error("Error deleting IVR flow:", error);
      res.status(500).json({ message: "Failed to delete IVR flow" });
    }
  });

  // Field Agent Management endpoints
  
  // Get field agents
  app.get("/api/africas-talking/field-agents", async (req, res) => {
    try {
      const agents = [
        {
          id: 1,
          name: "John Mwanza",
          phone: "+260977123456",
          region: "Lusaka",
          status: "active",
          lastSync: new Date().toISOString(),
          collectionsToday: 5,
          amountCollected: 12500
        }
      ];
      res.json(agents);
    } catch (error) {
      console.error("Error fetching field agents:", error);
      res.status(500).json({ message: "Failed to fetch field agents" });
    }
  });

  // Create field agent
  app.post("/api/africas-talking/field-agents", async (req, res) => {
    try {
      const agentData = req.body;
      const newAgent = {
        id: Date.now(),
        ...agentData,
        status: "active",
        collectionsToday: 0,
        amountCollected: 0,
        createdAt: new Date().toISOString()
      };
      res.status(201).json(newAgent);
    } catch (error) {
      console.error("Error creating field agent:", error);
      res.status(500).json({ message: "Failed to create field agent" });
    }
  });

  // Update field agent
  app.put("/api/africas-talking/field-agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedAgent = {
        id: parseInt(id),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      res.json(updatedAgent);
    } catch (error) {
      console.error("Error updating field agent:", error);
      res.status(500).json({ message: "Failed to update field agent" });
    }
  });

  // Delete field agent
  app.delete("/api/africas-talking/field-agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: "Field agent deleted successfully" });
    } catch (error) {
      console.error("Error deleting field agent:", error);
      res.status(500).json({ message: "Failed to delete field agent" });
    }
  });

  // Analytics and reporting endpoints
  
  // Get offline channel analytics
  app.get("/api/africas-talking/analytics/channels", async (req, res) => {
    try {
      const analytics = {
        ussd: {
          transactions: 0,
          successRate: 0,
          averageDuration: "0 min"
        },
        whatsapp: {
          messagesSent: 0,
          deliveryRate: 0,
          responseRate: 0
        },
        ivr: {
          callsHandled: 0,
          completionRate: 0,
          averageCallTime: "0 min"
        },
        field: {
          activeAgents: 1,
          collectionsToday: 12500,
          syncsPending: 0
        }
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching channel analytics:", error);
      res.status(500).json({ message: "Failed to fetch channel analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}