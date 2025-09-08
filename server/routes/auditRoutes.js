// server/routes/auditRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import AuditLog from "../models/AuditLog.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.get("/tickets/:id/audit", verifyToken, async (req, res) => {
  const t = await Ticket.findById(req.params.id).select("createdBy");
  if (!t) return res.status(404).json({ message: "Ticket not found" });
  if (req.user.role === "user" && String(t.createdBy) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const items = await AuditLog.find({ ticketId: req.params.id }).sort({ timestamp: 1 });
  res.json(items);
});

export default router;