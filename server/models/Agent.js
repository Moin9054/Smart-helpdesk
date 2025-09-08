import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  category: { type: String, enum: ["billing", "tech", "shipping", "general"], default: "general" }
});

export default mongoose.model("Agent", agentSchema);
