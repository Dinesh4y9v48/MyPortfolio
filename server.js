/**
 * Dinesh Portfolio – Express + PostgreSQL Backend
 * ─────────────────────────────────────────────────
 * Serves all portfolio data from a real PostgreSQL database.
 * Every Add / Edit / Delete / Save from the React frontend
 * performs real SQL operations here.
 *
 * SETUP
 * ──────
 * 1. npm install
 * 2. Copy .env.example → .env and fill in your DB credentials
 * 3. psql -U <user> -d <db> -f schema.sql
 * 4. node server.js
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // large – allows base64 PDFs/photos

// ── Database connection ────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
});

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/hero", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM hero WHERE id = 1");
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/hero", async (req, res) => {
  const { name, title, subtitle, tagline, available, photo_b64 } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE hero
         SET name=$1, title=$2, subtitle=$3, tagline=$4,
             available=$5, photo_b64=$6, updated_at=now()
       WHERE id=1
       RETURNING *`,
      [name, title, subtitle, tagline, available, photo_b64]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// ABOUT
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/about", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM about WHERE id = 1");
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/about", async (req, res) => {
  const { bio, bio2, location, email, experience, projects_count, ai_models } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE about
         SET bio=$1, bio2=$2, location=$3, email=$4,
             experience=$5, projects_count=$6, ai_models=$7, updated_at=now()
       WHERE id=1
       RETURNING *`,
      [bio, bio2, location, email, experience, projects_count, ai_models]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// SKILLS
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/skills", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM skills ORDER BY sort_order");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/skills", async (req, res) => {
  const { icon, name, description, tags } = req.body;
  try {
    const order = await pool.query("SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM skills");
    const nextOrder = order.rows[0].next;
    const { rows } = await pool.query(
      `INSERT INTO skills (sort_order, icon, name, description, tags)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nextOrder, icon, name, description, tags]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/skills/:id", async (req, res) => {
  const { id } = req.params;
  const { icon, name, description, tags } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE skills SET icon=$1, name=$2, description=$3, tags=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [icon, name, description, tags, id]
    );
    if (!rows.length) return res.status(404).json({ error: "Skill not found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/skills/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM skills WHERE id=$1", [id]);
    if (!rowCount) return res.status(404).json({ error: "Skill not found" });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/projects", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects ORDER BY sort_order");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/projects", async (req, res) => {
  const { name, type, year, description, tags, link } = req.body;
  try {
    const order = await pool.query("SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM projects");
    const nextOrder = order.rows[0].next;
    const num = String(nextOrder).padStart(2, "0");
    const { rows } = await pool.query(
      `INSERT INTO projects (sort_order, num, name, type, year, description, tags, link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nextOrder, num, name, type, year, description, tags, link || "#"]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, year, description, tags, link } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE projects
         SET name=$1, type=$2, year=$3, description=$4, tags=$5, link=$6, updated_at=now()
       WHERE id=$7 RETURNING *`,
      [name, type, year, description, tags, link || "#", id]
    );
    if (!rows.length) return res.status(404).json({ error: "Project not found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM projects WHERE id=$1", [id]);
    if (!rowCount) return res.status(404).json({ error: "Project not found" });
    // Re-number remaining projects
    await pool.query(`
      UPDATE projects p
      SET num = lpad(r.rn::text, 2, '0'),
          sort_order = r.rn
      FROM (
        SELECT id, row_number() OVER (ORDER BY sort_order) AS rn
        FROM projects
      ) r
      WHERE p.id = r.id
    `);
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// CERTIFICATES
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/certificates", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM certificates ORDER BY sort_order");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/certificates", async (req, res) => {
  const { name, issuer, year, badge } = req.body;
  try {
    const order = await pool.query("SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM certificates");
    const { rows } = await pool.query(
      `INSERT INTO certificates (sort_order, name, issuer, year, badge)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [order.rows[0].next, name, issuer, year, badge]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/certificates/:id", async (req, res) => {
  const { id } = req.params;
  const { name, issuer, year, badge } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE certificates SET name=$1, issuer=$2, year=$3, badge=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [name, issuer, year, badge, id]
    );
    if (!rows.length) return res.status(404).json({ error: "Certificate not found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/certificates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM certificates WHERE id=$1", [id]);
    if (!rowCount) return res.status(404).json({ error: "Certificate not found" });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// RESUME
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/resume", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM resume WHERE id = 1");
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/resume", async (req, res) => {
  const {
    file_name, file_data,
    education, education_years,
    experience, experience_years,
    certifications, cert_years,
    open_source, open_source_years
  } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE resume
         SET file_name=$1, file_data=$2,
             education=$3, education_years=$4,
             experience=$5, experience_years=$6,
             certifications=$7, cert_years=$8,
             open_source=$9, open_source_years=$10,
             updated_at=now()
       WHERE id=1 RETURNING *`,
      [
        file_name, file_data,
        education, education_years,
        experience, experience_years,
        certifications, cert_years,
        open_source, open_source_years
      ]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// CONTACT INFO
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/contact", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM contact WHERE id = 1");
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/contact", async (req, res) => {
  const { email, linkedin, github, twitter } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE contact SET email=$1, linkedin=$2, github=$3, twitter=$4, updated_at=now()
       WHERE id=1 RETURNING *`,
      [email, linkedin, github, twitter]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// CONTACT MESSAGES (public form submissions)
// ══════════════════════════════════════════════════════════════════════════
app.post("/api/contact/message", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (name, email, message)
       VALUES ($1,$2,$3) RETURNING *`,
      [name, email, message]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: list all received messages
app.get("/api/contact/messages", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════
// BULK LOAD – fetch ALL sections in one round-trip (used on initial load)
// ══════════════════════════════════════════════════════════════════════════
app.get("/api/portfolio", async (_req, res) => {
  try {
    const [hero, about, skills, projects, certificates, resume, contact] =
      await Promise.all([
        pool.query("SELECT * FROM hero         WHERE id=1"),
        pool.query("SELECT * FROM about        WHERE id=1"),
        pool.query("SELECT * FROM skills       ORDER BY sort_order"),
        pool.query("SELECT * FROM projects     ORDER BY sort_order"),
        pool.query("SELECT * FROM certificates ORDER BY sort_order"),
        pool.query("SELECT * FROM resume       WHERE id=1"),
        pool.query("SELECT * FROM contact      WHERE id=1"),
      ]);

    res.json({
      hero:         hero.rows[0]         || {},
      about:        about.rows[0]        || {},
      skills:       skills.rows          || [],
      projects:     projects.rows        || [],
      certificates: certificates.rows    || [],
      resume:       resume.rows[0]       || {},
      contact:      contact.rows[0]      || {},
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Portfolio API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
