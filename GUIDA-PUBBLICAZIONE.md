# 🚀 GUIDA PUBBLICAZIONE - Livello Principiante

## 📋 OPZIONE 1: RENDER (CONSIGLIATA - GRATIS E SEMPLICE)

### Passo 1: Creare Account su Render
1. Vai su **https://render.com**
2. Clicca **"Get Started for Free"**
3. Registrati con Google/GitHub/Email (gratis al 100%)

### Passo 2: Preparare il Codice su GitHub

#### 2A: Creare Repository GitHub
1. Vai su **https://github.com**
2. Se non hai account, registrati (gratis)
3. Clicca **"+"** in alto a destra → **"New repository"**
4. Nome: `sp-electric-catalog`
5. Lascia **Public** (o Private se preferisci)
6. Clicca **"Create repository"**

#### 2B: Caricare il Codice
Apri il terminale nella cartella del progetto e digita:

```bash
cd "/Users/eyo/Desktop/preventiv-ai code /preventiv-ai code /smart-search"

# Inizializza Git
git init

# Aggiungi tutti i file
git add .

# Primo commit
git commit -m "Prima versione sistema vendita SP Electric"

# Collega a GitHub (SOSTITUISCI 'tuousername' con il tuo username GitHub)
git remote add origin https://github.com/tuousername/sp-electric-catalog.git

# Carica su GitHub
git branch -M main
git push -u origin main
```

### Passo 3: Deploy su Render

1. Torna su **https://render.com** e fai login
2. Clicca **"New +"** → **"Web Service"**
3. Clicca **"Connect GitHub"** e autorizza
4. Seleziona il repository **sp-electric-catalog**
5. Clicca **"Connect"**

**Configurazione:**
- **Name**: `sp-electric-catalog` (o quello che vuoi)
- **Region**: Frankfurt (più vicina all'Italia)
- **Branch**: main
- **Root Directory**: lascia vuoto
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

6. Clicca **"Create Web Service"**

### Passo 4: Aspettare
- Render inizierà a costruire e pubblicare l'app
- Ci vorranno 2-3 minuti
- Vedrai i log in tempo reale

### Passo 5: Il Tuo Sito è Online! 🎉
- URL tipo: `https://sp-electric-catalog.onrender.com`
- Copia questo URL e condividilo con i clienti
- L'app è accessibile da qualsiasi dispositivo

---

## 📋 OPZIONE 2: RAILWAY (ALTERNATIVA SEMPLICE)

### Passo 1: Creare Account
1. Vai su **https://railway.app**
2. Clicca **"Start a New Project"**
3. Login con GitHub

### Passo 2: Deploy
1. Clicca **"Deploy from GitHub repo"**
2. Seleziona il tuo repository
3. Railway rileva automaticamente Node.js
4. Clicca **"Deploy"**

### Passo 3: Configurare Dominio
1. Vai su **Settings** → **Networking**
2. Clicca **"Generate Domain"**
3. Ottieni URL tipo: `https://sp-electric.up.railway.app`

---

## 📋 OPZIONE 3: VERCEL (ALTERNATIVA)

⚠️ **NOTA**: Vercel è ottimo ma richiede configurazione aggiuntiva per il backend Node.js

1. Vai su **https://vercel.com**
2. Login con GitHub
3. Clicca **"Add New..."** → **"Project"**
4. Seleziona repository
5. Deploy

---

## 🔧 CONFIGURAZIONE DOMINIO PERSONALIZZATO (OPZIONALE)

### Se vuoi un dominio tipo `catalogo.sp-electric.it`:

1. **Acquista dominio** (su Namecheap, GoDaddy, Aruba.it, ecc.)
2. **Su Render/Railway**:
   - Vai su Settings → Custom Domains
   - Aggiungi il tuo dominio
   - Copia i record DNS forniti
3. **Sul tuo provider di domini**:
   - Aggiungi i record DNS copiati
   - Aspetta 10-30 minuti per propagazione

---

## ✅ DOPO LA PUBBLICAZIONE

### Controlla che Funzioni:
1. Apri il tuo URL pubblico
2. Prova a cercare un prodotto
3. Aggiungi al carrello
4. Prova invio WhatsApp (NON inviare veramente, solo testa che si apra)
5. Testa su cellulare

### Condividi con i Clienti:
```
🔗 Catalogo SP Electric
https://tuourl.onrender.com

Cerca prodotti, aggiungi al carrello e invia ordine via WhatsApp!
```

---

## 🆘 PROBLEMI COMUNI

### "Cannot GET /" o pagina bianca
- Assicurati che `index.html` sia nella root del progetto
- Riavvia il servizio su Render

### Ricerca non funziona
- Controlla che il file `products.json` esista in `backend/data/`
- Guarda i log su Render per errori

### L'app si "addormenta" dopo un po'
- **Normale su piano Free** di Render
- L'app si riattiva automaticamente alla prima visita (10-20 secondi)
- Per evitarlo: upgrading a piano a pagamento ($7/mese)

### Come aggiornare il sito dopo modifiche
```bash
git add .
git commit -m "Aggiornamento"
git push
```
Render aggiornerà automaticamente il sito!

---

## 💰 COSTI

- **Render Free**: 0€ (750 ore/mese gratis, sufficiente)
- **Railway Free**: 0€ (500 ore/mese gratis + $5 credito)
- **Vercel**: 0€ (illimitato per hobby)

**Tutti gratuiti per iniziare! 🎉**

---

## 📞 HAI BISOGNO DI AIUTO?

Scrivi qui quale passaggio non è chiaro e ti guiderò passo passo.

---

**INIZIA CON RENDER - È IL PIÙ SEMPLICE! 🚀**
