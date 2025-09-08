// server/routes/agentRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { runAgentTriage } from "../services/agentStub.js";
import AgentSuggestion from "../models/AgentSuggestion.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.post("/triage", verifyToken, async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ message: "ticketId required" });

  const t = await Ticket.findById(ticketId).select("createdBy");
  if (!t) return res.status(404).json({ message: "Ticket not found" });
  if (req.user.role === "user" && String(t.createdBy) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const result = await runAgentTriage(ticketId);
  res.json({ ok: true, ...result });
});

router.get("/suggestion/:ticketId", verifyToken, async (req, res) => {
  const { ticketId } = req.params;
  const t = await Ticket.findById(ticketId).select("createdBy");
  if (!t) return res.status(404).json({ message: "Ticket not found" });
  if (req.user.role === "user" && String(t.createdBy) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const s = await AgentSuggestion.findOne({ ticketId }).sort({ createdAt: -1 });
  if (!s) return res.status(404).json({ message: "No suggestion yet" });
  res.json(s);
});

export default router;
