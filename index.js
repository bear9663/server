import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const db = new Database("orders.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    child_name TEXT,
    furigana TEXT,
    parent_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    height TEXT,
    weight TEXT,
    items TEXT
  )
`);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/order", (req, res) => {
  const {
    childName, furigana, parentName, phone,
    email, address, height, weight, items
  } = req.body;

  db.prepare(`
    INSERT INTO orders (
      child_name, furigana, parent_name, phone,
      email, address, height, weight, items
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    childName, furigana, parentName, phone,
    email, address, height, weight,
    JSON.stringify(items)
  );

  res.status(201).send("Order saved.");
});

app.get("/api/orders", (req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
  rows.forEach(r => r.items = JSON.parse(r.items));
  res.json(rows);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
