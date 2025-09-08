// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import kbRoutes from "./routes/kbRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import configRoutes from "./routes/configRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// simple JSON logger with traceId
app.use((req, res, next) => {
  const start = Date.now();
  req.traceId = req.headers["x-trace-id"] || uuidv4();
  res.setHeader("x-trace-id", req.traceId);
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      JSON.stringify({
        level: "info",
        msg: "http_request",
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        latencyMs: ms,
        traceId: req.traceId,
      })
    );
  });
  next();
});

// connect Mongo
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smarthelp", {
    dbName: process.env.MONGO_DB || undefined,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo error", err));

// health endpoints
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.get("/readyz", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ready });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/kb", kbRoutes);
app.use("/api/config", configRoutes);
app.use("/api", auditRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 Smart Helpdesk API running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
