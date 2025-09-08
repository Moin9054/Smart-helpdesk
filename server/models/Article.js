// server/models/Article.js
import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: String,
  body: String,
  tags: [String],
  status: { 
    type: String, 
    enum: ["draft", "published"], 
    default: "published"  // ✅ Changed from "draft" to "published"
  }
}, { timestamps: true });

export default mongoose.model("Article", articleSchema, "articles");