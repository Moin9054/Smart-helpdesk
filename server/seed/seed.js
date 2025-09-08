// server/seed/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Article from "../models/Article.js"; // or KnowledgeBase.js if that's your name
import Config from "../models/Config.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smarthelp";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo connected (seed)");

  // Wipe or keep existing? Uncomment next lines to start fresh:
  // await User.deleteMany({});
  // await Ticket.deleteMany({});
  // await Article.deleteMany({});
  // await Config.deleteMany({});

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  // Users
  const [admin] = await User.find({ email: "admin@example.com" }).limit(1);
  const [agent] = await User.find({ email: "agent@example.com" }).limit(1);
  const [user]  = await User.find({ email: "user@example.com" }).limit(1);

  const adminDoc = admin || await User.create({ name: "Admin", email: "admin@example.com", password: hash("admin123"), role: "admin" });
  const agentDoc = agent || await User.create({ name: "Agent", email: "agent@example.com", password: hash("agent123"), role: "agent" });
  const userDoc  = user  || await User.create({ name: "User",  email: "user@example.com",  password: hash("user123"),  role: "user"  });

  console.log("👥 Seed users ready:", {
    admin: "admin@example.com / admin123",
    agent: "agent@example.com / agent123",
    user : "user@example.com / user123",
  });

  // Config (singleton)
  // ensure singleton config with proper fields
    const cfg = await Config.getSingleton();
    cfg.autoCloseEnabled = true;
    cfg.confidenceThreshold = 0.78;
    cfg.slaHours = 24;
    await cfg.save();
    console.log("✅ Seeded Config");

  // KB
  const kbCount = await Article.countDocuments();
  if (kbCount === 0) {
    await Article.insertMany([
      { title: "Refund policy", body: "Refunds are processed within 7-10 days.", tags: ["billing", "refund"] },
      { title: "Fix error 500", body: "Clear cache, retry, check server logs.", tags: ["error", "troubleshooting"] },
      { title: "Delivery delays", body: "Check tracking, contact courier after 48h.", tags: ["shipping", "delivery"] },
    ]);
    console.log("📚 KB seeded");
  }

  // Tickets
  const tCount = await Ticket.countDocuments({ createdBy: userDoc._id });
  if (tCount === 0) {
    await Ticket.create([
      {
        title: "Refund not received",
        description: "Requested 10 days ago.",
        createdBy: userDoc._id,
        suggestion: "This looks like a billing/refund issue. Suggest refund policy article.",
        auditLogs: [{ message: `Ticket created by ${userDoc.email}` }],
      },
      {
        title: "App shows error 500",
        description: "Happens on checkout.",
        createdBy: userDoc._id,
        suggestion: "This looks like a technical error. Suggest troubleshooting article.",
        auditLogs: [{ message: `Ticket created by ${userDoc.email}` }],
      },
    ]);
    console.log("🎫 Tickets seeded");
  }

  await mongoose.disconnect();
  console.log("✅ Done.");
}

run().catch((e) => { console.error(e); process.exit(1); });
