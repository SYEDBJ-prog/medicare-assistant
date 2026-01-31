import type { Express } from "express";
import type { Server } from "http";

export async function setupVite(_server: Server, _app: Express) {
  console.log("Vite setup placeholder — development mode");
}