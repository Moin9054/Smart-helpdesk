import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  traceId: String,
  actor: { type: String, enum: ["system", "agent", "user"] },
  action: String,
  meta: Object
}, { timestamps: true });

export default mongoose.model("AuditLog", auditSchema);
