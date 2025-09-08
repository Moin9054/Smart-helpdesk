// server/models/Ticket.js
import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  authorName: String,
  authorRole: { type: String, enum: ["user", "agent", "admin"] },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const AuditLogSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const TicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["open", "in_progress", "closed", "waiting_human", "resolved"], // ✅ Added "waiting_human" and "resolved"
      default: "open" 
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },

    suggestion: { type: String }, // agent stub suggestion
    replies: [ReplySchema],
    auditLogs: [AuditLogSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);