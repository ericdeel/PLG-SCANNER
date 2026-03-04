import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import { anthropicRoute } from "./routes/anthropic";
import { rateLimit } from "./middleware/rateLimit";

const app = new Hono();

// Rate-limit all API calls
app.use("/api/*", rateLimit(20, 60_000)); // 20 req/min per IP

// Proxy route
app.route("/api", anthropicRoute);

// Serve static frontend (must come after API routes)
app.use("/*", serveStatic({ root: "./public" }));

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`PLG Meter running on http://localhost:${port}`);
});
