import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("life_intelligence.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS body_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    sleep_hours REAL,
    sleep_quality INTEGER,
    training_done INTEGER,
    training_type TEXT,
    energy_level INTEGER,
    activity_level INTEGER
  );

  CREATE TABLE IF NOT EXISTS mind_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    mood INTEGER,
    anxiety INTEGER,
    stress INTEGER,
    focus INTEGER,
    journal TEXT
  );

  CREATE TABLE IF NOT EXISTS finance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    income REAL DEFAULT 0,
    expenses REAL DEFAULT 0,
    debts REAL DEFAULT 0,
    installments REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    weekly_goal_hours REAL,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS discipline_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    project_id INTEGER,
    minutes_invested INTEGER,
    focus_level INTEGER,
    UNIQUE(date, project_id)
  );

  CREATE TABLE IF NOT EXISTS mental_inbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    type TEXT, -- 'idea', 'worry', 'thought', 'task'
    created_at TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // --- Body ---
  app.get("/api/body", (req, res) => {
    const logs = db.prepare("SELECT * FROM body_logs ORDER BY date DESC LIMIT 30").all();
    res.json(logs);
  });

  app.post("/api/body", (req, res) => {
    const { date, sleep_hours, sleep_quality, training_done, training_type, energy_level, activity_level } = req.body;
    const stmt = db.prepare(`
      INSERT INTO body_logs (date, sleep_hours, sleep_quality, training_done, training_type, energy_level, activity_level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        sleep_hours=excluded.sleep_hours,
        sleep_quality=excluded.sleep_quality,
        training_done=excluded.training_done,
        training_type=excluded.training_type,
        energy_level=excluded.energy_level,
        activity_level=excluded.activity_level
    `);
    stmt.run(date, sleep_hours, sleep_quality, training_done ? 1 : 0, training_type, energy_level, activity_level);
    res.json({ success: true });
  });

  // --- Mind ---
  app.get("/api/mind", (req, res) => {
    const logs = db.prepare("SELECT * FROM mind_logs ORDER BY date DESC LIMIT 30").all();
    res.json(logs);
  });

  app.post("/api/mind", (req, res) => {
    const { date, mood, anxiety, stress, focus, journal } = req.body;
    const stmt = db.prepare(`
      INSERT INTO mind_logs (date, mood, anxiety, stress, focus, journal)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        mood=excluded.mood,
        anxiety=excluded.anxiety,
        stress=excluded.stress,
        focus=excluded.focus,
        journal=excluded.journal
    `);
    stmt.run(date, mood, anxiety, stress, focus, journal);
    res.json({ success: true });
  });

  // --- Finance ---
  app.get("/api/finance", (req, res) => {
    const logs = db.prepare("SELECT * FROM finance_logs ORDER BY date DESC LIMIT 30").all();
    res.json(logs);
  });

  app.post("/api/finance", (req, res) => {
    const { date, income, expenses, debts, installments } = req.body;
    const stmt = db.prepare(`
      INSERT INTO finance_logs (date, income, expenses, debts, installments)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        income=excluded.income,
        expenses=excluded.expenses,
        debts=excluded.debts,
        installments=excluded.installments
    `);
    stmt.run(date, income, expenses, debts, installments);
    res.json({ success: true });
  });

  // --- Projects & Discipline ---
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { name, weekly_goal_hours } = req.body;
    const stmt = db.prepare("INSERT INTO projects (name, weekly_goal_hours, created_at) VALUES (?, ?, ?)");
    stmt.run(name, weekly_goal_hours, new Date().toISOString());
    res.json({ success: true });
  });

  app.get("/api/discipline", (req, res) => {
    const logs = db.prepare(`
      SELECT d.*, p.name as project_name 
      FROM discipline_logs d 
      JOIN projects p ON d.project_id = p.id 
      ORDER BY date DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  app.post("/api/discipline", (req, res) => {
    const { date, project_id, minutes_invested, focus_level } = req.body;
    const stmt = db.prepare(`
      INSERT INTO discipline_logs (date, project_id, minutes_invested, focus_level)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date, project_id) DO UPDATE SET
        minutes_invested=excluded.minutes_invested,
        focus_level=excluded.focus_level
    `);
    stmt.run(date, project_id, minutes_invested, focus_level);
    res.json({ success: true });
  });

  // --- Mental Inbox ---
  app.get("/api/inbox", (req, res) => {
    const items = db.prepare("SELECT * FROM mental_inbox ORDER BY created_at DESC").all();
    res.json(items);
  });

  app.post("/api/inbox", (req, res) => {
    const { content, type } = req.body;
    const stmt = db.prepare("INSERT INTO mental_inbox (content, type, created_at) VALUES (?, ?, ?)");
    stmt.run(content, type, new Date().toISOString());
    res.json({ success: true });
  });

  app.delete("/api/inbox/:id", (req, res) => {
    db.prepare("DELETE FROM mental_inbox WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Dashboard & Insights ---
  app.get("/api/dashboard", (req, res) => {
    // Get last 30 days of all data for correlation
    const body = db.prepare("SELECT * FROM body_logs ORDER BY date DESC LIMIT 30").all();
    const mind = db.prepare("SELECT * FROM mind_logs ORDER BY date DESC LIMIT 30").all();
    const finance = db.prepare("SELECT * FROM finance_logs ORDER BY date DESC LIMIT 30").all();
    const discipline = db.prepare(`
      SELECT date, SUM(minutes_invested) as total_minutes, AVG(focus_level) as avg_focus
      FROM discipline_logs 
      GROUP BY date 
      ORDER BY date DESC LIMIT 30
    `).all();

    res.json({ body, mind, finance, discipline });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
