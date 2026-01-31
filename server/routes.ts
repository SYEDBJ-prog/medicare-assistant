import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(_server: Server, app: Express) {
  app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello bro, server is working 🚀" });
  });

  console.log("Routes registered ✅");
}