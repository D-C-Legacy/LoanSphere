import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';

dotenv.config();
// Load production configuration if not in development
if (process.env.NODE_ENV !== "development") {
  try {
    require("../production.config.js");
  } catch (error) {
    console.log("Production config not found, using defaults");
  }
}

// Ensure NODE_ENV is set for production
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

// Set fallback environment variables required for production deployment
// These are not actively used since we use Clerk authentication, but deployment expects them
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "clerk-authentication-used-jwt-fallback-" + Date.now();
}

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "clerk-authentication-used-session-fallback-" + Date.now();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Enhanced error logging for production debugging
      if (process.env.NODE_ENV === "production") {
        console.error(`Production Error: ${status} - ${message}`, err);
      }

      res.status(status).json({ message });
      if (process.env.NODE_ENV === "development") {
        throw err;
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`LoanSphere server started successfully on port ${port} in ${process.env.NODE_ENV} mode`);
      log(`serving on port ${port}`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
