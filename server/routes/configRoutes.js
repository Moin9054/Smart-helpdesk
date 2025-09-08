// server/routes/configRoutes.js
import express from "express";
import Config from "../models/Config.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("admin"), async (_req, res) => {
  const c = await Config.getSingleton();
  res.json(c);
});

router.put("/", verifyToken, requireRole("admin"), async (req, res) => {
  const c = await Config.getSingleton();
  const { autoCloseEnabled, confidenceThreshold, slaHours } = req.body;

  if (typeof autoCloseEnabled === "boolean") c.autoCloseEnabled = autoCloseEnabled;
  if (typeof confidenceThreshold === "number") c.confidenceThreshold = confidenceThreshold;
  if (typeof slaHours === "number") c.slaHours = slaHours;

  await c.save();
  res.json(c);
});

export default router;
