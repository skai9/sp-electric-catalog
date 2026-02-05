const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("resultsList");
const resultsMeta = document.getElementById("resultsMeta");
const searchHint = document.getElementById("searchHint");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const sendOrderBtn = document.getElementById("sendOrderBtn");
const cartSection = document.getElementById("cartSection");

const API_URL = "http://localhost:3000/search";
let debounceTimer;
let cart = [];

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
          <button class="add-to-cart-btn" data-code="${row.code}" data-desc="${row.name}" data-price="${row.price}">➕ Aggiungi</button>
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

function addToCart(code, description, price) {
  cart.push({ code, description, price });
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  cartList.innerHTML = "";
  cartCount.textContent = cart.length === 1 ? "1 prodotto" : `${cart.length} prodotti`;

  if (cart.length === 0) {
    cartSection.style.display = "none";
    return;
  }

  cartSection.style.display = "block";

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span class="cart-item-code">${item.code}</span>
      <span class="cart-item-desc">${item.description}</span>
      <span class="cart-item-price">${item.price}</span>
      <button class="remove-btn" data-index="${index}">✕</button>
    `;
    cartList.appendChild(li);
  });
}

function sendOrderViaWhatsApp() {
  if (cart.length === 0) {
    alert("Il carrello è vuoto.");
    return;
  }

  const items = cart.map((item) => `- ${item.code} – ${item.description}`).join("\n");
  const message = `Ciao Marco, questi sono i prodotti che desidero ordinare:\n\n${items}`;
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/393803660767?text=${encoded}`;

  window.open(url, "_blank");
}

resultsList.addEventListener("click", (event) => {
  if (event.target.classList.contains("add-to-cart-btn")) {
    const code = event.target.dataset.code;
    const desc = event.target.dataset.desc;
    const price = event.target.dataset.price;
    addToCart(code, desc, price);
    event.target.textContent = "✓ Aggiunto";
    event.target.disabled = true;
    setTimeout(() => {
      event.target.textContent = "➕ Aggiungi";
      event.target.disabled = false;
    }, 1000);
  }
});

cartList.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-btn")) {
    const index = parseInt(event.target.dataset.index, 10);
    removeFromCart(index);
  }
});

sendOrderBtn.addEventListener("click", sendOrderViaWhatsApp);
