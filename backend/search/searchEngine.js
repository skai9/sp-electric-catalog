function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s\-_.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreProduct(product, query) {
  if (!query) return 0;
  const code = normalize(product.code);
  const name = normalize(product.name);
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory || "");

  let score = 0;

  if (code === query) score += 1000;
  if (code.startsWith(query)) score += 500;
  if (code.includes(query)) score += 250;

  if (name === query) score += 400;
  if (name.startsWith(query)) score += 200;
  if (name.includes(query)) score += 120;

  if (category.includes(query)) score += 40;
  if (subcategory.includes(query)) score += 30;

  const tokens = query.split(" ").filter(Boolean);
  if (tokens.length > 1) {
    let tokenHits = 0;
    tokens.forEach((token) => {
      if (name.includes(token) || code.includes(token)) tokenHits += 1;
    });
    score += tokenHits * 25;
  }

  return score;
}

function searchProducts(products, rawQuery) {
  const query = normalize(rawQuery);
  if (!query) return [];

  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((item) => item.product);

  return scored;
}

module.exports = { searchProducts };
