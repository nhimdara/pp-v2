const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
// Open http://localhost:5000/api/health to verify DB connection
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM lessons");
    res.json({ status: "ok", lessons: rows[0].total });
  } catch (err) {
    res.status(500).json({ status: "db_error", error: err.message });
  }
});

// ── GET all lessons ──────────────────────────────────────────
app.get("/api/lessons", async (req, res) => {
  try {
    const sql =
      "SELECT l.id, l.title, l.description, " +
      "c.name AS category, " +
      "s.name AS semester, " +
      "l.level, l.hours, l.credit, l.rating, l.students, l.color, " +
      "l.`option` " +
      "FROM lessons l " +
      "LEFT JOIN categories c ON c.id = l.category_id " +
      "LEFT JOIN semesters  s ON s.id = l.semester_id " +
      "ORDER BY l.id";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/lessons error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET all videos ───────────────────────────────────────────
app.get("/api/videos", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, lesson_id, title, link, " +
        "duration_minutes, description, is_free, order_index " +
        "FROM videos ORDER BY lesson_id, order_index",
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/videos error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET videos for a specific lesson ────────────────────────
app.get("/api/lessons/:id/videos", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM videos WHERE lesson_id = ? ORDER BY order_index",
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
