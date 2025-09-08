import express from "express";
import Article from "../models/Article.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Search KB
router.get("/", async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { title: new RegExp(query, "i") },
          { body: new RegExp(query, "i") },
          { tags: { $in: [new RegExp(query, "i")] } }
        ]
      };
    }
    const articles = await Article.find(filter);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create KB (Admin only)
router.post("/", authMiddleware(["admin"]), async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update KB (Admin only)
router.put("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete KB (Admin only)
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
