import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer as createViteServer } from "vite";
import { fetchTravelOptionsInternal, chatWithAIInternal } from "./services/aiProvider";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API routes
  app.post("/api/travel", async (req, res) => {
    try {
      const results = await fetchTravelOptionsInternal(req.body);
      res.json(results);
    } catch (error) {
      console.error("Server /api/travel Error:", error);
      res.status(500).json({ error: "Failed to fetch travel options" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const response = await chatWithAIInternal(message, history);
      res.json({ response });
    } catch (error) {
      console.error("Server /api/chat Error:", error);
      res.status(500).json({ error: "Failed to chat with AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
