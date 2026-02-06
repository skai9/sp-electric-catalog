# 🔍 SP Electric - Sistema di Ricerca e Ordine Prodotti

Sistema di vendita B2B professionale per SP Electric con ricerca prodotti, carrello e invio ordini via WhatsApp ed Email.

## ✨ Caratteristiche Principali

### 🔍 Ricerca Prodotti
- **Ricerca in tempo reale** con evidenziazione dei risultati
- Ricerca per **codice prodotto** e **descrizione**
- Feedback immediato su risultati trovati/non trovati
- Minimo 2 caratteri per attivare la ricerca

### 🛒 Carrello Intelligente
- Aggiunta prodotti con un click
- **Gestione quantità** (incremento/decremento)
- **Persistenza locale** (localStorage) - il carrello non si perde al refresh
- Rimozione singoli prodotti
- Svuota carrello con conferma
- Badge sempre visibile con numero totale prodotti
- Calcolo totale automatico

### 📱 Invio Ordini

#### WhatsApp
- Numero fisso: **+39 380 366 0767**
- Messaggio professionale pre-formattato:
  ```
  Ciao Marco,
  questi sono i prodotti che desidero ordinare:

  - Codice: XXX | Descrizione: YYY | Q.tà: Z
  - Codice: XXX | Descrizione: YYY | Q.tà: Z

  Grazie.
  ```
- Apertura automatica WhatsApp Web o App

#### Email
- Indirizzo: **m.ballicu@sp-electric.it**
- Oggetto automatico con data: "Ordine prodotti – 06/02/2026"
- Stesso formato del messaggio WhatsApp
- Apertura client email di sistema

### 🎨 UX/UI Professionale
- Design moderno e pulito
- Mobile-first responsive
- Feedback visivi immediati
- Notifiche toast per ogni azione
- Animazioni fluide
- Zero frizioni nel processo d'ordine

### 🛡️ Affidabilità
- **Validazione dati** su input e carrello
- **Gestione errori** robusta (connessione, localStorage)
- **Prevenzione duplicazioni** prodotti
- **Recovery automatico** da dati corrotti
- Codice modulare e manutenibile

## 🚀 Avvio Rapido

### 1. Installazione Dipendenze
```bash
npm install
```

### 2. Avvio Server Backend
```bash
npm start
```
Il server sarà disponibile su **http://localhost:3000**

### 3. Apertura Frontend
Apri `index.html` nel browser o usa un server locale:
```bash
# Opzione 1: Aprire direttamente
open index.html

# Opzione 2: Live Server (se disponibile)
npx live-server .
```

## 📁 Struttura Progetto

```
smart-search/
├── index.html              # Frontend principale
├── package.json            # Dipendenze Node.js
├── README.md              # Documentazione tecnica
├── README-VENDITA.md      # Questa guida commerciale
│
├── frontend/
│   ├── app.js             # Logica JavaScript frontend
│   ├── style.css          # Stili CSS
│   └── index.html         # (legacy, usa root/index.html)
│
├── backend/
│   ├── server.js          # Server Express
│   │
│   ├── data/
│   │   ├── products.json         # Database prodotti
│   │   └── build-products.js     # Script import CSV
│   │
│   └── search/
│       └── searchEngine.js       # Motore di ricerca
│
└── catalog/
    └── Listino SP_electric Febbraio 2026.csv
```

## 🔧 Configurazione

### Modifica Numero WhatsApp
In `frontend/app.js`, linea 19:
```javascript
const WHATSAPP_NUMBER = "393803660767";  // Formato: 39 + numero
```

### Modifica Email Destinatario
In `frontend/app.js`, linea 20:
```javascript
const EMAIL_ADDRESS = "m.ballicu@sp-electric.it";
```

### Modifica Porta Server
In `backend/server.js` o variabile ambiente:
```javascript
const PORT = process.env.PORT || 3000;
```

## 📊 API Endpoints

### `GET /search?q={query}`
Ricerca prodotti per codice o descrizione.

**Esempio:**
```bash
curl "http://localhost:3000/search?q=rele"
```

**Risposta:**
```json
{
  "query": "rele",
  "count": 5,
  "results": [
    {
      "code": "RE-001",
      "name": "Relè temporizzato",
      "category": "Relè",
      "price": "€ 15,50",
      "serial": "..."
    }
  ]
}
```

### `GET /health`
Health check del server.

**Risposta:**
```json
{
  "status": "ok",
  "products": 1234
}
```

## 🛠️ Script NPM

```bash
# Avvia server backend
npm start

# Rigenera products.json da CSV
npm run build:products
```

## 🔄 Aggiornamento Catalogo

1. Sostituisci il CSV in `catalog/Listino SP_electric Febbraio 2026.csv`
2. Rigenera il JSON:
   ```bash
   npm run build:products
   ```
3. Riavvia il server (se in esecuzione)

## 📱 Compatibilità

- ✅ Chrome, Firefox, Safari, Edge (ultime versioni)
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Responsive mobile/tablet/desktop

## 🐛 Troubleshooting

### Il server non si avvia
```bash
# Verifica che la porta 3000 sia libera
lsof -ti:3000 | xargs kill -9

# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

### Ricerca non funziona
1. Verifica che il server backend sia avviato su porta 3000
2. Controlla console browser per errori (F12)
3. Testa endpoint: http://localhost:3000/health

### Carrello non si salva
- Verifica che localStorage sia abilitato nel browser
- Controlla console per errori di quota superata
- Svuota cache e riprova

### WhatsApp non si apre
- Verifica che il numero sia corretto (formato internazionale)
- Su desktop, assicurati che WhatsApp Web sia configurato
- Su mobile, l'app WhatsApp deve essere installata

## 📈 Prossimi Sviluppi (Roadmap)

- [ ] Backend per invio email automatico (SMTP)
- [ ] Export PDF ordine
- [ ] Storico ordini
- [ ] Ricerca avanzata con filtri
- [ ] Immagini prodotti
- [ ] Multi-lingua

## 📄 Licenza

Proprietario: SP Electric  
Uso interno aziendale

## 👨‍💻 Supporto

Per assistenza tecnica:
- Email: m.ballicu@sp-electric.it
- WhatsApp: +39 380 366 0767

---

**Versione:** 2.0 - Production Ready  
**Ultimo aggiornamento:** 6 Febbraio 2026  
**Status:** ✅ PRONTO ALL'USO COMMERCIALE
