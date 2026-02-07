// ==========================================
// ULTRA-FAST SEARCH ENGINE (Google/Apple Style)
// ==========================================

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s\-_.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Tolleranza errori di battitura (Levenshtein semplificato)
function fuzzyMatch(str, pattern) {
  if (str.includes(pattern)) return true;
  if (pattern.length < 3) return false;
  
  // Controllo sotto-stringhe con 1 carattere di differenza
  for (let i = 0; i <= str.length - pattern.length; i++) {
    let diff = 0;
    for (let j = 0; j < pattern.length; j++) {
      if (str[i + j] !== pattern[j]) diff++;
      if (diff > 1) break;
    }
    if (diff <= 1) return true;
  }
  return false;
}

// Scoring aggressivo con priorità commerciale
function scoreProduct(product, query, tokens) {
  const code = normalize(product.code);
  const name = normalize(product.name);
  const description = normalize(product.description || "");
  
  let score = 0;
  
  // FASE 1: Codici prodotto (priorità MASSIMA)
  if (code === query) return 10000; // Match perfetto → stop
  if (code.startsWith(query)) score += 5000;
  if (code.includes(query)) score += 2500;
  if (fuzzyMatch(code, query)) score += 1200;
  
  // FASE 2: Nomi prodotto
  if (name === query) score += 3000;
  if (name.startsWith(query)) score += 1500;
  if (name.includes(query)) score += 800;
  if (fuzzyMatch(name, query)) score += 400;
  
  // FASE 3: Matching multi-token (query lunghe)
  if (tokens.length > 1) {
    let tokenScore = 0;
    let tokenMatches = 0;
    
    tokens.forEach((token) => {
      if (code.includes(token)) {
        tokenMatches++;
        tokenScore += 300;
      } else if (name.includes(token)) {
        tokenMatches++;
        tokenScore += 150;
      } else if (description.includes(token)) {
        tokenMatches++;
        tokenScore += 50;
      }
    });
    
    // Bonus se tutti i token matchano
    if (tokenMatches === tokens.length) {
      tokenScore *= 2;
    }
    
    score += tokenScore;
  }
  
  // FASE 4: Descrizioni (solo se non ci sono match forti)
  if (score < 500 && description.includes(query)) {
    score += 200;
  }
  
  return score;
}

// Ricerca predittiva ultra-rapida con filtri progressivi
function searchProducts(products, rawQuery) {
  const query = normalize(rawQuery);
  if (!query) return [];
  
  const tokens = query.split(" ").filter(Boolean);
  const results = [];
  
  // STRATEGIA DI SCALABILITÀ: Filtri progressivi
  
  // FASE 1: Cerca codici esatti o quasi-esatti (early stop)
  for (const product of products) {
    const code = normalize(product.code);
    
    if (code === query) {
      // Match perfetto al 100% → mostra SOLO questo
      return [product];
    }
    
    if (code.startsWith(query) || code.includes(query)) {
      const score = scoreProduct(product, query, tokens);
      results.push({ product, score });
      
      // Se trovi match molto forti nei codici, limita subito
      if (results.length >= 3 && score >= 2500) break;
    }
  }
  
  // Se abbiamo già risultati forti (90%+ confidence), fermiamoci
  if (results.length > 0 && results[0].score >= 5000) {
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 1)
      .map(item => item.product);
  }
  
  // FASE 2: Cerca nei nomi prodotto
  if (results.length < 5) {
    for (const product of products) {
      const name = normalize(product.name);
      
      if (name.includes(query) || fuzzyMatch(name, query)) {
        const score = scoreProduct(product, query, tokens);
        if (score > 0) {
          results.push({ product, score });
        }
        
        // Limita ricerca appena hai match decenti
        if (results.length >= 10) break;
      }
    }
  }
  
  // FASE 3: Ricerca multi-token più ampia (solo se serve)
  if (results.length < 5 && tokens.length > 1) {
    for (const product of products) {
      // Controlla se già presente
      if (results.some(r => r.product.code === product.code)) continue;
      
      const score = scoreProduct(product, query, tokens);
      if (score >= 400) { // Threshold per match multi-token
        results.push({ product, score });
      }
      
      if (results.length >= 15) break;
    }
  }
  
  // FASE 4: Descrizioni (ultima risorsa, solo se non abbiamo abbastanza)
  if (results.length < 3 && query.length > 4) {
    for (const product of products) {
      if (results.some(r => r.product.code === product.code)) continue;
      
      const description = normalize(product.description || "");
      if (description.includes(query)) {
        const score = scoreProduct(product, query, tokens);
        if (score > 0) {
          results.push({ product, score });
        }
      }
      
      if (results.length >= 10) break;
    }
  }
  
  // OUTPUT: Massimo 5 risultati, ordinati per rilevanza commerciale
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.product);
}

module.exports = { searchProducts };
