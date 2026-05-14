const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM lessons");
    res.json({ status: "ok", lessons: rows[0].total });
  } catch (err) {
    res.status(500).json({ status: "db_error", error: err.message });
  }
});

// ── REGISTER — save new user to MySQL ────────────────────────
// POST /api/register
// Body: { name, email, password }
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // ── Basic validation ──
  if (!name || name.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Name must be at least 2 characters." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // ── Check if email already exists ──
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      normalizedEmail,
    ]);
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    // ── Hash password ──
    const password_hash = await bcrypt.hash(password, 10);

    // ── Insert into users table ──
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'client')",
      [name.trim(), normalizedEmail, password_hash],
    );

    res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role: "client",
      },
    });
  } catch (err) {
    console.error("❌ /api/register error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── LOGIN — verify credentials against MySQL ─────────────────
// POST /api/login
// Body: { email, password }
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please enter your email and password." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const [rows] = await db.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [normalizedEmail],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ /api/login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── GET all users (admin dashboard) ─────────────────────────
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at AS joinDate FROM users ORDER BY id DESC",
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/users error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE a user ─────────────────────────────────────────────
app.delete("/api/users/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/users error:", err.message);
    res.status(500).json({ error: err.message });
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

// ── GET all projects ───────────────────────────────────────
app.get("/api/projects", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM projects ORDER BY id DESC");

    // convert tags string to array
    const projects = rows.map((project) => ({
      ...project,
      tags: project.tags ? project.tags.split(", ") : [],
    }));

    res.json(projects);
  } catch (err) {
    console.error("❌ /api/projects error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// ── GET all years (for dropdowns) ─────────────────────────────
app.get("/api/years", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM years ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/years error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET semesters by year (for dynamic dropdown) ──────────────
app.get("/api/years/:yearId/semesters", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM semesters WHERE year_id = ? ORDER BY id",
      [req.params.yearId],
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/years/:yearId/semesters error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET all semesters (for dropdowns) ─────────────────────────
app.get("/api/semesters", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.name, y.name as year_name 
      FROM semesters s
      LEFT JOIN years y ON y.id = s.year_id
      ORDER BY y.id, s.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/semesters error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET all categories (for dropdowns) ────────────────────────
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM categories ORDER BY name",
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/categories error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── CREATE a new lesson (with year, semester, category) ───────
app.post("/api/lessons", async (req, res) => {
  const {
    title,
    description,
    category_id,
    semester_id,
    level,
    hours,
    credit,
    color,
    option,
  } = req.body;

  // Validation
  if (!title || title.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters." });
  }
  if (!semester_id) {
    return res.status(400).json({ error: "Semester is required." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO lessons 
       (title, description, category_id, semester_id, level, hours, credit, color, \`option\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,
        category_id || null,
        semester_id,
        level || null,
        hours || null,
        credit || 0,
        color || "#6366f1",
        option || null,
      ],
    );

    // Fetch the newly created lesson with category and semester info
    const [newLesson] = await db.query(
      `SELECT l.id, l.title, l.description, 
              c.name AS category, 
              s.name AS semester,
              l.level, l.hours, l.credit, l.color, l.\`option\`
       FROM lessons l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN semesters s ON s.id = l.semester_id
       WHERE l.id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      lesson: newLesson[0],
    });
  } catch (err) {
    console.error("❌ POST /api/lessons error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to create lesson. Please try again." });
  }
});

// ── UPDATE a lesson ───────────────────────────────────────────
app.put("/api/lessons/:id", async (req, res) => {
  const {
    title,
    description,
    category_id,
    semester_id,
    level,
    hours,
    credit,
    color,
    option,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE lessons SET 
        title = ?, description = ?, category_id = ?, semester_id = ?,
        level = ?, hours = ?, credit = ?, color = ?, \`option\` = ?
       WHERE id = ?`,
      [
        title.trim(),
        description || null,
        category_id || null,
        semester_id,
        level || null,
        hours || null,
        credit || 0,
        color || null,
        option || null,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ PUT /api/lessons error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE a lesson ───────────────────────────────────────────
app.delete("/api/lessons/:id", async (req, res) => {
  try {
    // First check if lesson has any videos
    const [videos] = await db.query(
      "SELECT COUNT(*) as count FROM videos WHERE lesson_id = ?",
      [req.params.id],
    );
    if (videos[0].count > 0) {
      return res
        .status(400)
        .json({
          error:
            "Cannot delete lesson with existing videos. Delete videos first.",
        });
    }

    const [result] = await db.query("DELETE FROM lessons WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lesson not found." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/lessons error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── CREATE a video (for TeacherDashboard) ─────────────────────
app.post("/api/videos", async (req, res) => {
  const {
    lesson_id,
    title,
    link,
    duration_minutes,
    description,
    is_free,
    order_index,
  } = req.body;

  // Validation
  if (!lesson_id) {
    return res.status(400).json({ error: "Lesson ID is required." });
  }
  if (!title || title.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters." });
  }
  if (!link || !link.trim()) {
    return res.status(400).json({ error: "YouTube URL is required." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO videos 
       (lesson_id, title, link, duration_minutes, description, is_free, order_index) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lesson_id,
        title.trim(),
        link.trim(),
        duration_minutes || null,
        description || null,
        is_free ? 1 : 0,
        order_index || 1,
      ],
    );

    const [newVideo] = await db.query("SELECT * FROM videos WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json({
      success: true,
      video: newVideo[0],
    });
  } catch (err) {
    console.error("❌ POST /api/videos error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to create video. Please try again." });
  }
});

// ── UPDATE a video ───────────────────────────────────────────
app.put("/api/videos/:id", async (req, res) => {
  const {
    lesson_id,
    title,
    link,
    duration_minutes,
    description,
    is_free,
    order_index,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE videos SET 
        lesson_id = ?, title = ?, link = ?, duration_minutes = ?,
        description = ?, is_free = ?, order_index = ?
       WHERE id = ?`,
      [
        lesson_id,
        title.trim(),
        link.trim(),
        duration_minutes || null,
        description || null,
        is_free ? 1 : 0,
        order_index || 1,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Video not found." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ PUT /api/videos error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE a video ───────────────────────────────────────────
app.delete("/api/videos/:id", async (req, res) => {
  try {
    // First delete any video progress records
    await db.query("DELETE FROM video_progress WHERE video_id = ?", [
      req.params.id,
    ]);

    const [result] = await db.query("DELETE FROM videos WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Video not found." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/videos error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET lesson with its videos (detailed view) ───────────────
app.get("/api/lessons/:id", async (req, res) => {
  try {
    // Get lesson details
    const [lessons] = await db.query(
      `SELECT l.id, l.title, l.description, 
              c.name AS category, c.id as category_id,
              s.name AS semester, s.id as semester_id,
              y.id as year_id, y.name as year_name,
              l.level, l.hours, l.credit, l.color, l.\`option\`
       FROM lessons l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN semesters s ON s.id = l.semester_id
       LEFT JOIN years y ON y.id = s.year_id
       WHERE l.id = ?`,
      [req.params.id],
    );

    if (lessons.length === 0) {
      return res.status(404).json({ error: "Lesson not found." });
    }

    // Get videos for this lesson
    const [videos] = await db.query(
      "SELECT * FROM videos WHERE lesson_id = ? ORDER BY order_index",
      [req.params.id],
    );

    res.json({
      ...lessons[0],
      videos,
    });
  } catch (err) {
    console.error("❌ GET /api/lessons/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET lessons filtered by year/semester ─────────────────────
app.get("/api/lessons/filter", async (req, res) => {
  const { year_id, semester_id } = req.query;

  let sql = `
    SELECT l.id, l.title, l.description, 
           c.name AS category, 
           s.name AS semester,
           l.level, l.hours, l.credit, l.color, l.\`option\`
    FROM lessons l
    LEFT JOIN categories c ON c.id = l.category_id
    LEFT JOIN semesters s ON s.id = l.semester_id
    WHERE 1=1
  `;
  const params = [];

  if (semester_id) {
    sql += " AND l.semester_id = ?";
    params.push(semester_id);
  } else if (year_id) {
    sql += " AND s.year_id = ?";
    params.push(year_id);
  }

  sql += " ORDER BY s.id, l.id";

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/lessons/filter error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
