// DOM Elements
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const resultsList = document.getElementById("resultsList");
const resultsMeta = document.getElementById("resultsMeta");
const searchHint = document.getElementById("searchHint");
const cartToggle = document.getElementById("cartToggle");
const cartPanel = document.getElementById("cartPanel");
const closeCartBtn = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartBadge = document.getElementById("cartBadge");
const cartTotal = document.getElementById("cartTotal");
const totalAmount = document.getElementById("totalAmount");
const sendOrderBtn = document.getElementById("sendOrderBtn");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const clearCartBtn = document.getElementById("clearCart");
const toastContainer = document.getElementById("toastContainer");

const API_URL = window.location.origin + "/search";
const WHATSAPP_NUMBER = "393355994614";
const EMAIL_ADDRESS = "m.ballicu@sp-electric.it";
let debounceTimer;
let cart = loadCartFromStorage();
let currentQuery = "";

// Initialize app
function init() {
  renderCart();
  setupEventListeners();
}

// Local storage
function saveCartToStorage() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Errore salvataggio carrello:", error);
    showToast("Errore salvataggio carrello", "error");
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("cart");
    if (!saved) return [];
    
    const items = JSON.parse(saved);
    
    // Validazione e migrazione dati
    if (!Array.isArray(items)) {
      console.warn("Carrello corrotto, reset");
      return [];
    }
    
    return items.map(item => {
      // Validazione item
      if (!item.code || !item.description) {
        console.warn("Item invalido rimosso:", item);
        return null;
      }
      
      // Aggiungi campi mancanti
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        item.quantity = 1;
      }
      
      if (typeof item.priceValue !== 'number') {
        item.priceValue = parseFloat(item.price?.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      }
      
      return item;
    }).filter(Boolean); // Rimuovi item null
    
  } catch (error) {
    console.error("Errore caricamento carrello:", error);
    showToast("Carrello ripristinato", "warning");
    return [];
  }
}

// Toast notifications
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// Build grouped results
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

// Evidenziazione testo cercato
function highlightText(text, query) {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Render results
function renderResults(items) {
  resultsList.innerHTML = "";

  if (!items.length) {
    resultsMeta.textContent = "Nessun risultato trovato";
    resultsList.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">🔍</div>
        <p style="color:var(--gray-600);font-size:16px;margin:0;">Nessun prodotto corrisponde alla tua ricerca</p>
        <p style="color:var(--gray-500);font-size:14px;margin-top:8px;">Prova con altri termini</p>
      </div>
    `;
    return;
  }

  resultsMeta.textContent = `${items.length} ${items.length === 1 ? 'prodotto trovato' : 'prodotti trovati'}`;

  const { categoryOrder, grouped } = buildGroupedResults(items);

  categoryOrder.forEach((category) => {
    const categoryItem = document.createElement("div");
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
      productTitle.innerHTML = highlightText(productName, currentQuery);

      const productList = document.createElement("div");
      productList.className = "product-rows";

      rows.forEach((row) => {
        const rowEl = document.createElement("div");
        rowEl.className = "product-row";
        
        // Evidenziazione codice e descrizione
        const highlightedCode = highlightText(row.code || "", currentQuery);
        const highlightedName = highlightText(row.name || "", currentQuery);
        
        rowEl.innerHTML = `
          <span class="row-code">${highlightedCode}</span>
          <span class="row-desc">${highlightedName}</span>
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

// Search
async function performSearch(query) {
  if (query.length < 2) {
    resultsList.innerHTML = "";
    resultsMeta.textContent = "Inizia a cercare";
    searchHint.textContent = "Digita almeno 2 caratteri per cercare";
    clearSearchBtn.style.display = "none";
    currentQuery = "";
    return;
  }

  currentQuery = query;
  clearSearchBtn.style.display = "block";
  searchHint.textContent = "🔍 Ricerca in corso...";
  resultsMeta.textContent = "Caricamento...";

  try {
    const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    renderResults(data.results || []);
    searchHint.textContent = "";
  } catch (error) {
    console.error("Errore di ricerca:", error);
    resultsMeta.textContent = "Errore di connessione";
    searchHint.innerHTML = `<span style="color:var(--danger);">❌ Impossibile connettersi al server. Verifica che il backend sia attivo.</span>`;
    resultsList.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <p style="color:var(--danger);font-size:16px;margin:0;font-weight:600;">Errore di connessione</p>
        <p style="color:var(--gray-600);font-size:14px;margin-top:8px;">Assicurati che il server backend sia avviato</p>
        <button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Riprova</button>
      </div>
    `;
    showToast("Errore di connessione al server", "error");
  }
}

// Cart functions
function addToCart(code, description, price) {
  // Validazione input
  if (!code || !description) {
    showToast("Errore: dati prodotto non validi", "error");
    return;
  }
  
  const existingItem = cart.find(item => item.code === code);
  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`Quantità aggiornata: ${code}`, "success");
  } else {
    // Estrai il prezzo numerico dalla stringa
    const priceValue = parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    cart.push({ 
      code, 
      description, 
      price: price,
      priceValue: priceValue,
      quantity: 1 
    });
    showToast(`Prodotto aggiunto: ${code}`, "success");
  }
  
  saveCartToStorage();
  renderCart();
}

function removeFromCart(index) {
  const removed = cart[index];
  cart.splice(index, 1);
  saveCartToStorage();
  renderCart();
  showToast(`${removed.code} rimosso`, "info");
}

function updateQuantity(index, change) {
  const item = cart[index];
  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(index);
  } else {
    saveCartToStorage();
    renderCart();
  }
}

function calculateTotal() {
  return cart.reduce((total, item) => {
    return total + (item.priceValue * item.quantity);
  }, 0);
}

function renderCart() {
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadge.textContent = totalQuantity;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:12px;opacity:0.3;">🛒</div>
        <p style="color:var(--gray-600);font-size:15px;margin:0;">Il carrello è vuoto</p>
        <p style="color:var(--gray-500);font-size:13px;margin-top:8px;">Aggiungi prodotti per iniziare</p>
      </div>
    `;
    cartTotal.style.display = 'none';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div style="font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; font-size: 13px;">${item.code}</div>
        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 2px;">${item.description}</div>
        <div style="color: #10b981; font-weight: 600; margin-top: 4px; font-size: 14px;">${item.price}</div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-control">
          <button class="qty-btn" onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'title="Rimuovi prodotto"' : ''}>-</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${index})" title="Rimuovi prodotto">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join("");
  
  const total = calculateTotal();
  if (total > 0) {
    totalAmount.textContent = `€ ${total.toFixed(2).replace('.', ',')}`;
    cartTotal.style.display = 'flex';
  } else {
    cartTotal.style.display = 'none';
  }
}

// Toggle cart panel
function openCart() {
  cartPanel.classList.add("open");
}

function closeCart() {
  cartPanel.classList.remove("open");
}

// Send via WhatsApp
function sendOrderViaWhatsApp() {
  if (cart.length === 0) {
    showToast("Il carrello è vuoto", "warning");
    return;
  }

  const items = cart.map((item) => 
    `- Codice: ${item.code} | Descrizione: ${item.description} | Q.tà: ${item.quantity}`
  ).join("\n");
  
  const message = `Ciao Marco,\nquesti sono i prodotti che desidero ordinare:\n\n${items}\n\nGrazie.`;
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

  window.open(url, "_blank");
  showToast("Apertura WhatsApp in corso...", "success");
}

// Send via Email
function sendEmail() {
  if (cart.length === 0) {
    showToast("Il carrello è vuoto", "warning");
    return;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  const items = cart.map((item) => 
    `- Codice: ${item.code} | Descrizione: ${item.description} | Q.tà: ${item.quantity}`
  ).join("\n");
  
  const subject = `Ordine prodotti – ${dateStr}`;
  const body = `Ciao Marco,\nquesti sono i prodotti che desidero ordinare:\n\n${items}\n\nGrazie.`;
  
  const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
  showToast("Apertura email in corso...", "success");
}

// Event Listeners
function setupEventListeners() {
  // Cart toggle
  cartToggle.addEventListener("click", () => {
    openCart();
    if (cart.length === 0) {
      showToast("Aggiungi prodotti per creare un ordine", "info");
    }
  });
  closeCartBtn.addEventListener("click", closeCart);

  // Search
  searchInput.addEventListener("input", (event) => {
    const value = event.target.value.trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(value), 150);
  });

  // Clear search
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentQuery = "";
    resultsList.innerHTML = "";
    resultsMeta.textContent = "Inizia a cercare";
    searchHint.textContent = "Digita almeno 2 caratteri per cercare";
    clearSearchBtn.style.display = "none";
    searchInput.focus();
  });

  // Add to cart
  resultsList.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart-btn")) {
      const code = event.target.dataset.code;
      const desc = event.target.dataset.desc;
      const price = event.target.dataset.price;
      addToCart(code, desc, price);
      
      // Feedback visivo immediato
      const originalText = event.target.innerHTML;
      event.target.innerHTML = "✓ Aggiunto";
      event.target.style.background = "var(--secondary)";
      event.target.disabled = true;
      
      setTimeout(() => {
        event.target.innerHTML = originalText;
        event.target.style.background = "";
        event.target.disabled = false;
      }, 1500);
    }
  });

  // Actions
  sendOrderBtn.addEventListener("click", sendOrderViaWhatsApp);
  sendEmailBtn.addEventListener("click", sendEmail);
  clearCartBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Il carrello è già vuoto", "info");
      return;
    }
    
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    if (confirm(`Vuoi svuotare il carrello?\n${itemCount} ${itemCount === 1 ? 'prodotto' : 'prodotti'} ${itemCount === 1 ? 'sarà rimosso' : 'saranno rimossi'}.`)) {
      cart = [];
      localStorage.removeItem("cart");
      renderCart();
      showToast("Carrello svuotato", "success");
    }
  });
}

// Start app
init();
