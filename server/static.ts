import type { Express } from "express";

export function serveStatic(_app: Express) {
  console.log("Static serving disabled in development");
}