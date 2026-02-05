const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("resultsList");
const resultsMeta = document.getElementById("resultsMeta");
const searchHint = document.getElementById("searchHint");

const API_URL = "http://localhost:3000/search";
let debounceTimer;

function buildGroupedResults(items) {
  const categoryOrder = [];
  const grouped = new Map();

  items.forEach((item) => {
    const category = item.category || "Senza categoria";
    const productName = item.name || "";

    if (!grouped.has(category)) {
      grouped.set(category, new Map());
      categoryOrder.push(category);
    }

    const productMap = grouped.get(category);
    if (!productMap.has(productName)) {
      productMap.set(productName, []);
    }

    productMap.get(productName).push(item);
  });

  return { categoryOrder, grouped };
}

function renderResults(items) {
  resultsList.innerHTML = "";

  if (!items.length) {
    resultsMeta.textContent = "Nessun risultato";
    return;
  }

  resultsMeta.textContent = `${items.length} risultati`;

  const { categoryOrder, grouped } = buildGroupedResults(items);

  categoryOrder.forEach((category) => {
    const categoryItem = document.createElement("li");
    categoryItem.className = "category-block";

    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.textContent = category;

    categoryItem.appendChild(categoryHeader);

    const productMap = grouped.get(category);
    productMap.forEach((rows, productName) => {
      const productBlock = document.createElement("div");
      productBlock.className = "product-block";

      const productTitle = document.createElement("div");
      productTitle.className = "product-title";
      productTitle.textContent = productName;

      const productList = document.createElement("div");
      productList.className = "product-rows";

      rows.forEach((row) => {
        const rowEl = document.createElement("div");
        rowEl.className = "product-row";
        rowEl.innerHTML = `
          <span class="row-code">${row.code || ""}</span>
          <span class="row-desc">${row.name || ""}</span>
          <span class="row-serial">${row.serial || ""}</span>
          <span class="row-price">${row.price || ""}</span>
        `;
        productList.appendChild(rowEl);
      });

      productBlock.appendChild(productTitle);
      productBlock.appendChild(productList);
      categoryItem.appendChild(productBlock);
    });

    resultsList.appendChild(categoryItem);
  });
}

async function performSearch(query) {
  if (query.length < 2) {
    resultsList.innerHTML = "";
    resultsMeta.textContent = "Nessun risultato";
    searchHint.textContent = "Digita almeno 2 caratteri";
    return;
  }

  searchHint.textContent = "Ricerca in corso...";

  try {
    const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    renderResults(data.results || []);
    searchHint.textContent = "";
  } catch (error) {
    resultsMeta.textContent = "Errore di connessione";
    searchHint.textContent = "";
  }
}

searchInput.addEventListener("input", (event) => {
  const value = event.target.value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => performSearch(value), 120);
});
