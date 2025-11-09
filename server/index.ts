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
      const expectedUsername = process.env.AUTH_USERNAME || 'admin';
      const expectedPassword = process.env.AUTH_PASSWORD || 'admin';

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (username === expectedUsername && password === expectedPassword) {
        // Generate a simple session token (in production, use proper JWT)
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        res.json({ success: true, token });
      } else {
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
      // Simple token validation (in production, use proper JWT validation)
      if (token) {
        res.json({ authenticated: true });
      } else {
        res.status(401).json({ authenticated: false });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Routes - must be before static file serving
  app.get("/api/storage/:key", async (req: express.Request, res: express.Response) => {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      console.log(`[API] GET /api/storage/${decodedKey}`);
      
      const value = await getStorageValue(decodedKey);
      
      if (value === undefined) {
        console.log(`[API] Key ${decodedKey} not found, returning 404`);
        return res.status(404).json({ error: "Key not found" });
      }
      
      console.log(`[API] ✅ Found ${decodedKey}`, typeof value, Array.isArray(value) ? `array[${value.length}]` : typeof value === 'object' ? `object[${Object.keys(value).length} keys]` : '');
      // Return value directly, not wrapped in object with key
      res.json({ value });
    } catch (error: any) {
      console.error(`[API] ❌ Error getting storage value for ${req.params.key}:`, error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.put("/api/storage/:key", async (req: express.Request, res: express.Response) => {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);
      const { value } = req.body;
      
      console.log(`[API] PUT /api/storage/${decodedKey}`, typeof value, Array.isArray(value) ? `array[${value.length}]` : typeof value === 'object' ? `object[${Object.keys(value).length} keys]` : '');
      
      if (value === undefined) {
        console.error(`[API] Error: Value is required for key ${decodedKey}`);
        return res.status(400).json({ error: "Value is required" });
      }
      
      await setStorageValue(decodedKey, value);
      console.log(`[API] ✅ Successfully saved ${decodedKey}`);
      res.json({ key: decodedKey, value, success: true });
    } catch (error: any) {
      console.error(`[API] ❌ Error setting storage value for ${req.params.key}:`, error);
      console.error("Error stack:", error.stack);
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
