// server/models/knowledgeBase.js
import mongoose from "mongoose";

const kbSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, default: "" },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "published"], default: "published" },
}, { timestamps: true });

kbSchema.index({ title: "text", body: "text", tags: "text" });

export default mongoose.model("KnowledgeBase", kbSchema);
