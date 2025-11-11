// Note: In Docker, environment variables are provided by docker-compose.yml
// For local development without Docker, install dotenv and uncomment:
// import "dotenv/config";

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import {
  getStorageValue,
  setStorageValue,
  removeStorageValue,
  clearStorage,
} from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware for parsing JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Authentication endpoint
  app.post("/api/auth/login", async (req: express.Request, res: express.Response) => {
    try {
      const { username, password } = req.body;
      
      // Require credentials from environment variables (no defaults for security)
      const expectedUsername = process.env.AUTH_USERNAME;
      const expectedPassword = process.env.AUTH_PASSWORD;

      if (!expectedUsername || !expectedPassword) {
        console.error("❌ Authentication credentials not configured. Set AUTH_USERNAME and AUTH_PASSWORD environment variables.");
        return res.status(500).json({ error: "Server configuration error" });
      }

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (username === expectedUsername && password === expectedPassword) {
        // Generate session token with timestamp for basic expiration
        // Note: For production, consider using proper JWT with expiration
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        res.json({ success: true, token });
      } else {
        // Don't reveal which field is incorrect
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Verify authentication token
  app.get("/api/auth/verify", async (req: express.Request, res: express.Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ authenticated: false });
      }
      const token = authHeader.substring(7);
      
      // Basic token validation - check if token exists and is valid format
      // Note: For production, implement proper JWT validation with expiration
      if (token && token.length > 0) {
        try {
          // Verify token format (base64 encoded string)
          const decoded = Buffer.from(token, 'base64').toString('utf-8');
          if (decoded.includes(':')) {
            res.json({ authenticated: true });
          } else {
            res.status(401).json({ authenticated: false });
          }
        } catch {
          res.status(401).json({ authenticated: false });
        }
      } else {
        res.status(401).json({ authenticated: false });
      }
    } catch (error: any) {
      console.error("Error verifying token:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Routes - must be before static file serving
  app.get("/api/storage/:key", async (req: express.Request, res: express.Response) => {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] GET /api/storage/${decodedKey}`);
      }
      
      const value = await getStorageValue(decodedKey);
      
      if (value === undefined) {
        return res.status(404).json({ error: "Key not found" });
      }
      
      // Return value directly, not wrapped in object with key
      res.json({ value });
    } catch (error: any) {
      console.error(`[API] Error getting storage value for ${req.params.key}:`, error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.put("/api/storage/:key", async (req: express.Request, res: express.Response) => {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      const { value } = req.body;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] PUT /api/storage/${decodedKey}`, typeof value, Array.isArray(value) ? `array[${value.length}]` : typeof value === 'object' ? `object[${Object.keys(value).length} keys]` : '');
      }
      
      if (value === undefined) {
        return res.status(400).json({ error: "Value is required" });
      }
      
      await setStorageValue(decodedKey, value);
      res.json({ key: decodedKey, value, success: true });
    } catch (error: any) {
      console.error(`[API] Error setting storage value for ${req.params.key}:`, error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.delete("/api/storage/:key", async (req: express.Request, res: express.Response) => {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      await removeStorageValue(decodedKey);
      res.json({ key: decodedKey, success: true });
    } catch (error: any) {
      console.error("Error removing storage value:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.delete("/api/storage", async (_req: express.Request, res: express.Response) => {
    try {
      await clearStorage();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error clearing storage:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req: express.Request, res: express.Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  // This must be last to catch all non-API routes
  app.get("*", (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // In development, run on port 3001 to avoid conflict with Vite (port 3000)
  // In production, use port 3000
  const port = process.env.NODE_ENV === "production" 
    ? (process.env.PORT || 3000)
    : (process.env.SERVER_PORT || 3001);

  server.listen(port, () => {
    console.log(`🚀 Express server running on http://localhost:${port}/`);
    console.log(`📡 API endpoints available at http://localhost:${port}/api`);
  });
}

startServer().catch(console.error);
