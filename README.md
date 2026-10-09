# DOMANI PIOVE — Playtest

Versione digitale per il playtest del gioco da tavolo **Domani Piove** (2–4 giocatori, piazzamento lavoratori, set collection e una previsione meteo condivisa che cambia durante la giornata).
Nessuna build: HTML/CSS/JS vanilla con script classici, funziona aprendo `index.html` e anche in Node.

**Stato: tappa 3 — motore, test e interfaccia da tavolo.** Giocabile in 3 modalità (contro l'AI, passa il telefono, AI contro AI). **Le AI sono provvisorie (scelgono a caso)**: i tre livelli e il simulatore arrivano nelle prossime tappe (vedi `docs/DA_IMPLEMENTARE.md`).

## Comandi
```
npm test                    # test sulle regole, determinismo/replay, fuzz, regolamento sincronizzato (node:test)
node tools/build-data.js    # rigenera js/cards.js dopo una modifica ai JSON in data/
node tools/build-rules.js   # rigenera js/rulebook.js dopo una modifica a docs/REGOLAMENTO.md
node tools/serve.js         # server locale → http://localhost:8080 (oppure apri index.html)
node tools/export-sprites.js   # esporta gli sprite SVG in assets/sprites/*.svg e crea sprites.html
NODE_PATH=/opt/node-tools/node_modules node tools/e2e.js --mode ai|hotseat|watch [--mobile] [--players 2|3|4] [--vp]   # partita completa nel browser (Playwright) con screenshot
```

| File | Ruolo |
|---|---|
| `docs/REGOLAMENTO.md` | regolamento unico (fonte), con **[chiarito]** / **[interpretazione]** e tabella delle differenze dal Concept v9 |
| `docs/DA_RICORDARE.md` | misure e punti di bilanciamento da riprendere al playtest |
| `docs/DA_IMPLEMENTARE.md` | idee decise ma non ancora fatte, con lo stato |
| `docs/materiali/` | i materiali originali del progetto (Concept, Milestone, carte…) |
| `data/*.json` | dati delle carte e costanti, esportati dal progetto |
| `js/data.js` | simboli, fusioni, parametri delle regole (`DEFAULT_RULES`), punteggio |
| `js/engine.js` | motore: partita come generatore di decisioni, RNG con seed, stato clonabile, replay |
| `js/ui/*` | sprite SVG (carte 100×140, simboli, fusioni), tavolo, sessione di gioco e pannelli, regole, avvio |
| `js/ai.js` | AI (per ora provvisoria: casuale) |
| `sw.js`, `manifest.json` | PWA installabile e offline (a ogni modifica ai file in cache incrementa `VERSION` in `sw.js`) |
| `tests/` | regole, determinismo/replay, fuzz con invarianti, regolamento sincronizzato |
