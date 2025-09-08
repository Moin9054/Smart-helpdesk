// server/routes/kbRoutes.js
import express from "express";
import KnowledgeBase from "../models/knowledgeBase.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/kb?query=...
 * Simple search (uses text index if present, otherwise regex fallback)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const q = String(req.query.query || "").trim();
    if (!q) return res.json([]);

    let items = [];
    try {
      // prefer text index
      items = await KnowledgeBase
        .find({ $text: { $search: q }, status: "published" })
        .select("_id title body tags")
        .limit(10);
    } catch {
      // fallback to regex if no text index
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      items = await KnowledgeBase
        .find({ status: "published", $or: [{ title: rx }, { body: rx }, { tags: rx }] })
        .select("_id title body tags")
        .limit(10);
    }

    res.json(items.map(d => ({
      id: d._id,
      title: d.title,
      snippet: (d.body || "").slice(0, 160),
      tags: d.tags || []
    })));
  } catch (e) {
    console.error("KB search error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/kb/batch?ids=a,b,c
 * Hydrate article IDs to { id, title, snippet, tags }
 */
router.get("/batch", verifyToken, async (req, res) => {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (!ids.length) return res.json([]);

    const docs = await KnowledgeBase
      .find({ _id: { $in: ids }, status: "published" })
      .select("_id title body tags")
      .limit(20);

    res.json(docs.map(d => ({
      id: d._id,
      title: d.title,
      snippet: (d.body || "").slice(0, 160),
      tags: d.tags || []
    })));
  } catch (e) {
    console.error("KB batch error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/kb/:id
 * Return one published article
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const art = await KnowledgeBase
      .findById(req.params.id)
      .select("_id title body tags status createdAt updatedAt");

    if (!art || art.status !== "published") {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
      id: art._id,
      title: art.title,
      body: art.body,
      tags: art.tags || [],
      createdAt: art.createdAt,
      updatedAt: art.updatedAt
    });
  } catch (e) {
    res.status(400).json({ message: "Invalid id" });
  }
});

export default router;
