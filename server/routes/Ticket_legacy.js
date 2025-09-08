import express from "express";
import Ticket from "../models/Ticket.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { triageTicket } from "../services/agentStub.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Create ticket
router.post("/", authMiddleware(["user"]), async (req, res) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      createdBy: req.user.id
    });

    await AuditLog.create({
      ticketId: ticket._id,
      traceId: ticket._id.toString(),
      actor: "user",
      action: "TICKET_CREATED",
      meta: {}
    });

    // trigger triage
    const suggestion = await triageTicket(ticket);

    res.json({ ticket, suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my tickets
router.get("/", authMiddleware(), async (req, res) => {
  try {
    const filter = req.user.role === "user"
      ? { createdBy: req.user.id }
      : {}; // admin/agent see all
    const tickets = await Ticket.find(filter).populate("createdBy", "name email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single ticket + audit log
router.get("/:id", authMiddleware(), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("createdBy", "name email");
    const logs = await AuditLog.find({ ticketId: ticket._id }).sort("createdAt");
    res.json({ ticket, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
