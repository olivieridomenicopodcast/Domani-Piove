# DOMANI PIOVE — Playtest

Versione digitale per il playtest del gioco da tavolo **Domani Piove** (2–4 giocatori, piazzamento lavoratori, set collection e una previsione meteo condivisa che cambia durante la giornata).
Nessuna build: HTML/CSS/JS vanilla con script classici, funziona aprendo `index.html` e anche in Node.

**Stato: tappa 2 — motore di gioco e test completi.** Interfaccia, AI e simulatore: in arrivo (vedi `docs/DA_IMPLEMENTARE.md`).

## Comandi
```
npm test                    # test sulle regole, determinismo/replay, fuzz, regolamento sincronizzato (node:test)
node tools/build-data.js    # rigenera js/cards.js dopo una modifica ai JSON in data/
node tools/build-rules.js   # rigenera js/rulebook.js dopo una modifica a docs/REGOLAMENTO.md
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
| `tests/` | regole, determinismo/replay, fuzz con invarianti, regolamento sincronizzato |
