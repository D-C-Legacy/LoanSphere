

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ClerkExpressWithAuth, clerkClient } from "@clerk/clerk-sdk-node";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret";

// Middleware to verify JWT
export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Middleware: Role-based restriction
export const requireRole = (expectedRole) => {
  return async (req, res, next) => {
    const user = await clerkClient.users.getUser(req.auth.userId);
    const role = user.publicMetadata.role;
    if (role !== expectedRole) {
      return res.status(403).json({ message: "Access denied for this role" });
    }
    next();
  };
};

// Middleware: Enforce 2FA
export const require2FA = async (req, res, next) => {
  const sessionId = req.auth.sessionId;
  const session = await clerkClient.sessions.getSession(sessionId);

  if (!session || !session.totpVerified) {
    return res.status(403).json({ message: "2FA is required" });
  }
  next();
};

// Public route
router.get("/public", (req, res) => {
  res.json({ message: "Public access" });
});

// Protected: Requires 2FA and correct role
router.get(
  "/admin/dashboard",
  ClerkExpressWithAuth(),
  require2FA,
  requireRole("admin"),
  (req, res) => {
    res.json({ message: "Welcome, Admin!" });
  }
);

router.get(
  "/lender/summary",
  ClerkExpressWithAuth(),
  require2FA,
  requireRole("lender"),
  (req, res) => {
    res.json({ message: "Lender dashboard" });
  }
);

router.get(
  "/borrower/details",
  ClerkExpressWithAuth(),
  require2FA,
  requireRole("borrower"),
  (req, res) => {
    res.json({ message: "Borrower details" });
  }
);

router.get(
  "/auditor/logs",
  ClerkExpressWithAuth(),
  require2FA,
  requireRole("auditor"),
  (req, res) => {
    res.json({ message: "Auditor logs" });
  }
);

router.get(
  "/support/tickets",
  ClerkExpressWithAuth(),
  require2FA,
  requireRole("support"),
  (req, res) => {
    res.json({ message: "Support tickets" });
  }
);

export default router;
