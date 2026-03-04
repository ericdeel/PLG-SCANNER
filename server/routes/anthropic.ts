import { Hono } from "hono";

const route = new Hono();

route.post("/analyze", async (c) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return c.json({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  const { mode, url, imgB64, prompt } = await c.req.json();

  const content =
    mode === "image"
      ? [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imgB64 } },
          { type: "text", text: prompt },
        ]
      : prompt;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content }],
    }),
  });

  const data = await upstream.json();
  return c.json(data, upstream.status as 200);
});

export { route as anthropicRoute };
