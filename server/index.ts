import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import 'dotenv/config';
import authRoutes from "./auth_system";

// Load production config if not in development
if (process.env.NODE_ENV !== "development") {
  try {
    require("../production.config.js");
  } catch (error) {
    console.log("Production config not found, using defaults");
  }
}

// Ensure NODE_ENV is set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

// Fallback secrets
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "clerk-authentication-used-jwt-fallback-" + Date.now();
}
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "clerk-authentication-used-session-fallback-" + Date.now();
}

const app = express();
app.use(express.json());
app.use("/api", authRoutes); 
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

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

      if (process.env.NODE_ENV === "production") {
        console.error(`Production Error: ${status} - ${message}`, err);
      }

      res.status(status).json({ message });

      if (process.env.NODE_ENV === "development") {
        throw err;
      }
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    
    const port = 5000;
    const host = "127.0.0.1";
    server.listen(port, host, () => {
      console.log(` LoanSphere server started on http://${host}:${port} (${process.env.NODE_ENV} mode)`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
