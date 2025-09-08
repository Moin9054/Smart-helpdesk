// server/routes/ticketRoutes.js
import express from "express";
import Ticket from "../models/Ticket.js";
import Agent from "../models/Agent.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import { runAgentTriage } from "../services/agentStub.js";
import { notifyStatusChange } from "../utils/notifications.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/test", verifyToken, (req, res) => {
  res.json({ msg: "Tickets route works ✅", user: req.user });
});

// ✅ PUT /mine ABOVE /:id - THIS IS CRITICAL!
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id })
      .populate("assignedTo", "name email category")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error("GET /api/tickets/mine error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === "admin" || req.user.role === "agent") {
      tickets = await Ticket.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email category")
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: req.user.id })
        .populate("assignedTo", "name email category")
        .sort({ createdAt: -1 });
    }
    res.json(tickets);
  } catch (err) {
    console.error("GET /api/tickets error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ KEEP /:id AFTER /mine
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    const t = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email category");
    if (!t) return res.status(404).json({ message: "Ticket not found" });
    if (req.user.role === "user" && String(t.createdBy._id) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(t);
  } catch (err) {
    console.error("GET ticket detail error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ... rest of your code remains the same (POST, PUT endpoints)
// POST /api/tickets - Create ticket with auto-triage
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: "title and description required" });

    const ticket = await Ticket.create({
      title,
      description,
      category: category || "other",
      createdBy: req.user.id,
      status: "open",
    });

    const triage = await runAgentTriage(ticket._id.toString());

    const refreshed = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email category");

    await notifyStatusChange({
      ticketId: refreshed._id,
      toUserId: refreshed.createdBy?._id || req.user.id,
      newStatus: refreshed.status,
      meta: { triage },
    });

    res.status(201).json(refreshed);
  } catch (err) {
    console.error("POST /api/tickets error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/tickets/:id/assign - Assign ticket to agent
router.put("/:id/assign", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const agent = await Agent.findById(assignedTo);
    if (!agent) return res.status(400).json({ message: "Agent not found" });

    ticket.assignedTo = agent._id;
    if (ticket.status === "open") ticket.status = "waiting_human";
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email category");

    await notifyStatusChange({
      ticketId: populated._id,
      toUserId: populated.createdBy?._id,
      newStatus: populated.status,
      meta: { assignedTo: agent._id },
    });

    res.json(populated);
  } catch (err) {
    console.error("ASSIGN error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/tickets/:id/reply - Add reply to ticket
router.put("/:id/reply", verifyToken, requireRole("agent", "admin"), async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: "reply text required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.replies = ticket.replies || [];
    ticket.replies.push({
      authorId: req.user.id,
      authorName: req.user.email,
      authorRole: req.user.role,
      text: reply,
      createdAt: new Date(),
    });

    ticket.status = "in_progress";
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    await notifyStatusChange({
      ticketId: populated._id,
      toUserId: populated.createdBy?._id,
      newStatus: populated.status,
      meta: { replyBy: req.user.email },
    });

    res.json(populated);
  } catch (err) {
    console.error("REPLY error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/tickets/:id/close - Close ticket
router.put("/:id/close", verifyToken, requireRole("admin", "agent"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = "closed";
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    await notifyStatusChange({
      ticketId: populated._id,
      toUserId: populated.createdBy?._id,
      newStatus: populated.status,
    });

    res.json(populated);
  } catch (err) {
    console.error("CLOSE error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;