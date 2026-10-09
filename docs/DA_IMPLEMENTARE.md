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
| ⏳ da fare | Simulatore nell'app, esperimenti sulle regole in blocco, strategie estreme come profili, analisi di ogni carta/Evento «forzato», elenco partite con «Rivedi» dal seed, export .md/.csv/.json | tappa 5 |
| 💬 da decidere con Niky | Fedeltà contro Pattern (vedi DA_RICORDARE) e chi pesca l'Evento a 3 giocatori | prima di ritarare l'AI |
| ⏳ da fare | Regole nell'app: già mostrate da `docs/REGOLAMENTO.md`; manca un controllo che il testo mostrato sia aggiornato dopo ogni tarare | tappa 6 |
| ⏳ da fare | Test di accessibilità (tastiera, contrasto) e prova su telefono reale | tappa 6 |
| 💬 da scrivere con Niky | **Mazzo degli Obiettivi Segreti** (pesca 2 / tieni 1 / punti a fine partita). Hook già pronto nel motore (`objective`, punteggio = 0). Non usare gli esempi in `docs/materiali/Obiettivi-Segreti-ESEMPI-NON-APPROVATI.md`. | Evento #67 (scarta e ripesca) già collegato all'hook |
| 📦 varianti spente | `sez2OccupiesSez1`, `requireAdjacentPlacement`, `thirdWorkerNextRound`, `maxSymbolsPerCard`, `poolPerSymbol` | parametri in `FF.DEFAULT_RULES` |
