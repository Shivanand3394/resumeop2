import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: unknown = undefined;

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown, ...args: unknown[]) => {
    capturedJsonResponse = body;
    return originalJson(body as any, ...(args as []));
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse !== undefined) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
        }
      }

      if (logLine.length > 140) {
        logLine = logLine.slice(0, 139) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  await setupVite(httpServer, app);

  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(port, "127.0.0.1", () => {
    console.log(`serving on http://127.0.0.1:${port}`);
  });
})();
