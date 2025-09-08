// server/services/agentStub.js
import KnowledgeBase from "../models/knowledgeBase.js";
import { v4 as uuidv4 } from "uuid";
import AgentSuggestion from "../models/AgentSuggestion.js";
import AuditLog from "../models/AuditLog.js";
import Ticket from "../models/Ticket.js";
import Config from "../models/Config.js";

export async function runAgentTriage(ticketId) {
  let traceId; // Declare traceId at function scope
  
  try {
    traceId = uuidv4(); // Assign value

    // Fetch ticket to get title and description
    const ticket = await Ticket.findById(ticketId).select("title description _id status createdBy");
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // ---- Step 1: Classify ----
    let predictedCategory = "other";
    let confidence = 0.5;
    const text = (ticket.title + " " + (ticket.description || "")).toLowerCase();

    if (text.includes("refund") || text.includes("invoice")) {
      predictedCategory = "billing"; confidence = 0.9;
    } else if (text.includes("error") || text.includes("bug") || text.includes("stack")) {
      predictedCategory = "tech"; confidence = 0.9;
    } else if (text.includes("delivery") || text.includes("shipment") || text.includes("package")) {
      predictedCategory = "shipping"; confidence = 0.9;
    }

    await AuditLog.create({
      ticketId: ticket._id,
      traceId,
      actor: "system",
      action: "AGENT_CLASSIFIED",
      meta: { predictedCategory, confidence }
    });

    // ---- Step 2: Retrieve KB ----
    const articles = await KnowledgeBase.find({
      $or: [
        { title: new RegExp(predictedCategory, "i") },
        { tags: predictedCategory }
      ]
    }).limit(3);

    await AuditLog.create({
      ticketId: ticket._id,
      traceId,
      actor: "system",
      action: "KB_RETRIEVED",
      meta: { articleIds: articles.map(a => a._id) }
    });

    // ---- Step 3: Draft reply ----
    const draftReply = `Hello, we think your issue is related to ${predictedCategory}. 
Here are some helpful articles: ${articles.map((a, i) => `[${i+1}] ${a.title}`).join(", ") || "None available"}`;

    await AuditLog.create({
      ticketId: ticket._id,
      traceId,
      actor: "system",
      action: "DRAFT_GENERATED",
      meta: { draftReply }
    });

    // ---- Step 4: Decision ----
    let autoClosed = false;
    let newStatus = "waiting_human";

    const dbConfig = await Config.findOne({});
    const autoCloseEnabled = dbConfig?.autoCloseEnabled ?? (process.env.AUTO_CLOSE_ENABLED === "true");
    const threshold = dbConfig?.confidenceThreshold ?? parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.78");

    const numThreshold = Number(threshold);
    if (autoCloseEnabled && Number(confidence) >= numThreshold) {
      autoClosed = true;
      newStatus = "resolved";
      await AuditLog.create({
        ticketId: ticket._id,
        traceId,
        actor: "system",
        action: "AUTO_CLOSED",
        meta: {}
      });
    } else {
      await AuditLog.create({
        ticketId: ticket._id,
        traceId,
        actor: "system",
        action: "ASSIGNED_TO_HUMAN",
        meta: {}
      });
    }

    ticket.status = newStatus;
    await ticket.save();

    const suggestion = await AgentSuggestion.create({
      ticketId: ticket._id,
      predictedCategory,
      articleIds: articles.map(a => a._id),
      draftReply,
      confidence,
      autoClosed,
      modelInfo: { provider: "stub", version: "v1" }
    });

    return suggestion;
  } catch (error) {
    console.error(`Error in runAgentTriage: ${error.message}`, { traceId: traceId || 'not-set' });
    throw error;
  }
}