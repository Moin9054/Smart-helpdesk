import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  predictedCategory: String,
  articleIds: [String],
  draftReply: String,
  confidence: Number,
  autoClosed: Boolean,
  modelInfo: Object
}, { timestamps: true });

export default mongoose.model("AgentSuggestion", suggestionSchema);
