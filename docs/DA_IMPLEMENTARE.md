# Da implementare — idee decise ma non ancora fatte

| Stato | Cosa | Note |
|---|---|---|
| ✅ fatto | Motore di gioco (round, lavoratori, azioni, Eventi, punteggio) | `js/engine.js`, `js/data.js` |
| ✅ fatto | Test: regole, determinismo/replay, fuzz con invarianti, regolamento sincronizzato | `tests/` |
| ⏳ da fare | Interfaccia da tavolo (carte SVG 100×140, plancia, legenda, messaggi grandi con clic) | tappa 3 |
| ⏳ da fare | Modalità: contro l'AI, passa il telefono, AI contro AI, simulazione veloce | tappa 3-5 |
| ⏳ da fare | AI a 3 livelli (facile < media < difficile) con informazione nascosta rispettata | tappa 4 |
| ⏳ da fare | Simulatore (CLI + in app), strategie estreme, analisi carte forzate | tappa 5 |
| ⏳ da fare | PWA offline, salvataggio con ripresa, cronaca esportabile, note di playtest | tappa 6 |
| 💬 da scrivere con Niky | **Mazzo degli Obiettivi Segreti** (pesca 2 / tieni 1 / punti a fine partita). Hook già pronto nel motore (`objective`, punteggio = 0). Non usare gli esempi in `docs/materiali/Obiettivi-Segreti-ESEMPI-NON-APPROVATI.md`. | Evento #67 (scarta e ripesca) già collegato all'hook |
| 📦 varianti spente | `sez2OccupiesSez1`, `requireAdjacentPlacement`, `thirdWorkerNextRound`, `maxSymbolsPerCard`, `poolPerSymbol` | parametri in `FF.DEFAULT_RULES` |
