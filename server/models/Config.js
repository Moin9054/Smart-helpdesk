// server/models/Config.js
import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    autoCloseEnabled: { type: Boolean, default: true },
    confidenceThreshold: { type: Number, default: 0.78, min: 0, max: 1 },
    slaHours: { type: Number, default: 24, min: 1 },
  },
  { timestamps: true }
);

configSchema.statics.getSingleton = async function () {
  let c = await this.findOne();
  if (!c) c = await this.create({});
  return c;
};

export default mongoose.model("Config", configSchema);
