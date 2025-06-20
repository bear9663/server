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

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

app.get("/api/products", (req, res) => {
  const stmt = db.prepare("SELECT * FROM products ORDER BY id");
  const products = stmt.all();
  res.json(products);
}
);

app.post("/api/products", (req, res) => {
  const { name, price } = req.body;
  if (!name || typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "Invalid product data." });
  }
  const stmt = db.prepare(`
    INSERT INTO products (name, price)
    VALUES (?, ?)
  `);
  const info = stmt.run(name, price);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  if (!name || typeof price !== "number" || price < 0) {
    return res.json({ error: "Invalid product data." });
  }

  db.prepare(`
    UPDATE products
    SET name = ?, price = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, price, id);
  res.json({ success: true });
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
  res.json({ success: true});
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
