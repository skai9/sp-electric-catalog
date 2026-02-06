const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const { searchProducts } = require("./search/searchEngine");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

const dataPath = path.join(__dirname, "data", "products.json");

function loadProducts() {
  const raw = fs.readFileSync(dataPath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("products.json must be an array");
  }
  return data;
}

let products = [];

function refreshProducts() {
  try {
    products = loadProducts();
  } catch (error) {
    console.error("Failed to load products.json:", error.message);
    products = [];
  }
}

refreshProducts();

// Servire i file statici del frontend
app.use(express.static(path.join(__dirname, "..")));

app.get("/search", (req, res) => {
  const query = String(req.query.q || "").trim();
  const results = searchProducts(products, query);
  res.json({ query, count: results.length, results });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", products: products.length });
});

// Servire index.html per tutte le altre route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Smart Search backend listening on http://localhost:${PORT}`);
});
