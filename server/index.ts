//Hello Railway
import express from "express";
import cors from "cors";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ message: "Hello from the Medicare Backend! 🚀" });
});

httpServer.listen({ port: 5000, host: "0.0.0.0" }, () => {
  console.log("🚀 BACKEND IS RUNNING ON PORT 5000");
});