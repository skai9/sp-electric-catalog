# Smart Search — SP Electric

## Sprint 1 (base tecnica)
- Backend Node.js + Express
- API `/search`
- Motore di ranking `backend/search/searchEngine.js`
- Frontend HTML/CSS/JS
- Barra di ricerca istantanea

## Sprint 2 (integrazione catalogo reale)

### 1) Inserisci i file catalogo
Copia i file reali CSV, XLSX e PDF in `catalog/`.

### 2) Genera products.json
```bash
npm install
npm run build:products
```

Il file aggiornato verrà scritto in `backend/data/products.json`.

### 3) Avvia il backend
```bash
npm start
```

Apri `frontend/index.html` per la UI.

## Note
- Il build effettua un controllo incrociato CSV/XLSX e genera `backend/data/inconsistencies.json` se trova differenze.
- Il PDF viene letto come riferimento descrittivo.
