# Da implementare — idee decise ma non ancora fatte

| Stato | Cosa | Note |
|---|---|---|
| ✅ fatto | Motore di gioco (round, lavoratori, azioni, Eventi, punteggio) | `js/engine.js`, `js/data.js` |
| ✅ fatto | Test: regole, determinismo/replay, fuzz con invarianti, regolamento sincronizzato | `tests/` |
| ✅ fatto | Interfaccia da tavolo: carte SVG 100×140, plancia, legenda, messaggi grandi con clic, anteprima e conferme, zoom, cronaca e note | tappa 3 |
| ✅ fatto | Modalità: contro l'AI, passa il telefono, AI contro AI (velocità regolabile), salvataggio con ripresa, «Rivedi» | tappa 3 |
| ✅ fatto | Sprite esportati come file SVG (`assets/sprites/`) | pronti anche per il kit stampabile |
| ✅ fatto | Suggerimento dell'AI facoltativo (💡, evidenzia la mossa) e anteprima delle conseguenze prima di confermare | tappa 4 |
| ⏳ da fare | Simulazione veloce nell'app | tappa 5 |
| ✅ fatto | AI a 3 livelli (facile < media < difficile), informazione nascosta rispettata (test che fallisce se l'AI sbircia) | tappa 4 |
| ✅ fatto | Simulatore da riga di comando: vittorie con intervallo di confidenza, posti, chi inizia, durata, medie per profilo | `tools/sim.js`, tappa 4 |
| ✅ fatto | Simulatore nell'app e da riga di comando: tornei con intervalli di confidenza, esperimenti sulle regole, 5 strategie estreme (casuale, solo fedeltà, solo pattern, solo PM, passivo), analisi «forzata» di Eventi / Carte Regione / Previsioni a parità di seed, andamento nel tempo, durata e distacco, elenco partite con «Rivedi», export .md/.csv/.json | tappa 5 |
| ✅ fatto | Decisioni di Niky applicate: scala di Accuratezza «1-2 / 3-4 / 5-6 / 7+» e segnalino «Protezione Civile» che passa di mano per gli Eventi | regolamento, dati, test |
| ⏳ da fare | Regole nell'app: già mostrate da `docs/REGOLAMENTO.md`; manca un controllo che il testo mostrato sia aggiornato dopo ogni tarare | tappa 6 |
| ⏳ da fare | Test di accessibilità (tastiera, contrasto) e prova su telefono reale | tappa 6 |
| 💬 da scrivere con Niky | **Mazzo degli Obiettivi Segreti** (pesca 2 / tieni 1 / punti a fine partita). Hook già pronto nel motore (`objective`, punteggio = 0). Non usare gli esempi in `docs/materiali/Obiettivi-Segreti-ESEMPI-NON-APPROVATI.md`. | Evento #67 (scarta e ripesca) già collegato all'hook |
| 💬 da decidere con Niky | Compensare l'ordine di turno (+1 PM iniziale a chi non inizia?) e la forza dell'Evento #74 (3° lavoratore gratis ≈ +5,7 punti) | misure in DA_RICORDARE |
| 📦 varianti spente | `sez2OccupiesSez1`, `requireAdjacentPlacement`, `thirdWorkerNextRound`, `maxSymbolsPerCard`, `poolPerSymbol`, `coerCap`, `startPMBonus`, `eventDrawer: 'first'` | parametri in `FF.DEFAULT_RULES` |
