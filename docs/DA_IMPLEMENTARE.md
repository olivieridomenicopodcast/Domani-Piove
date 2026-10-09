# Da implementare — idee decise ma non ancora fatte

| Stato | Cosa | Note |
|---|---|---|
| ✅ fatto | Motore di gioco (round, lavoratori, azioni, Eventi, punteggio) | `js/engine.js`, `js/data.js` |
| ✅ fatto | Test: regole, determinismo/replay, fuzz con invarianti, regolamento sincronizzato | `tests/` |
| ✅ fatto | Interfaccia da tavolo: carte SVG 100×140, plancia, legenda, messaggi grandi con clic, anteprima e conferme, zoom, cronaca e note | tappa 3 |
| ✅ fatto | Modalità: contro l'AI, passa il telefono, AI contro AI (velocità regolabile), salvataggio con ripresa, «Rivedi» | tappa 3 |
| ✅ fatto | Sprite esportati come file SVG (`assets/sprites/`) | pronti anche per il kit stampabile |
| ✅ fatto | Suggerimento dell'AI facoltativo (💡, evidenzia la mossa) e anteprima delle conseguenze prima di confermare | tappa 4 |
| ✅ fatto | AI a 3 livelli (facile < media < difficile), informazione nascosta rispettata (test che fallisce se l'AI sbircia) | tappa 4 |
| ✅ fatto | Simulatore da riga di comando: vittorie con intervallo di confidenza, posti, chi inizia, durata, medie per profilo | `tools/sim.js`, tappa 4 |
| ✅ fatto | Simulatore nell'app e da riga di comando: tornei con intervalli di confidenza, esperimenti sulle regole, 5 strategie estreme (casuale, solo fedeltà, solo pattern, solo PM, passivo), analisi «forzata» di Eventi / Carte Regione / Previsioni a parità di seed, andamento nel tempo, durata e distacco, elenco partite con «Rivedi», export .md/.csv/.json | tappa 5 |
| ✅ fatto | Decisioni di Niky applicate: scala di Accuratezza «1-2 / 3-4 / 5-6 / 7+» e segnalino «Protezione Civile» che passa di mano per gli Eventi | regolamento, dati, test |
| ✅ fatto | Regole nell'app generate da `docs/REGOLAMENTO.md`, con test che controllano che quantità, prezzi, scala, fusioni e pattern citati coincidano col codice | tappa 6 |
| ✅ fatto | PWA offline provata nel browser (`tools/offline-check.js`), versione del service worker aggiornata in automatico (`tools/bump-sw.js`, con test); contrasti WCAG AA verificati da test; tastiera (salta al contenuto, focus sul pannello della mossa, Esc nelle finestre), nomi accessibili, bersagli di tocco da 44 px, schermi da 320 px, movimento ridotto (`tools/a11y-check.js`) | tappa 6 |
| ⏳ da fare | Prova su un telefono vero, installazione come app e lettore di schermo reale (finora solo emulazione nel browser) | con Niky |
| ⏳ da fare | Kit stampabile per giocare con carte e segnalini veri (istruzioni nel repo `stampa-gioco`); gli sprite SVG 100×140 sono già esportati in `assets/sprites/` | dopo la stabilizzazione del digitale |
| 💬 da scrivere con Niky | **Mazzo degli Obiettivi Segreti** (pesca 2 / tieni 1 / punti a fine partita). Hook già pronto nel motore (`objective`, punteggio = 0). Non usare gli esempi in `docs/materiali/Obiettivi-Segreti-ESEMPI-NON-APPROVATI.md`. | Evento #67 (scarta e ripesca) già collegato all'hook |
| ✅ fatto | Compensazione dell'ordine di turno: chi non inizia parte con 3 PM (verificata: 48,8% / 31,8% / 22,9% per chi inizia a 2 / 3 / 4 giocatori) | tappa 6 |
| ✅ deciso | Evento #74 «Potenziamento del centro operativo» (3° lavoratore gratis, ≈ +5,7 punti a chi lo pesca): **lasciato com'è** (decisione di Niky). Da riguardare al playtest | DA_RICORDARE |
| ⏳ da fare | Tarare le singole Carte Regione con più partite per carta (con 60 coppie quasi tutte restano nel rumore) | simulatore, `--forced regione --games 300` |
| 📦 varianti spente | `sez2OccupiesSez1`, `requireAdjacentPlacement`, `thirdWorkerNextRound`, `maxSymbolsPerCard`, `poolPerSymbol`, `coerCap`, `startPMBonus`, `eventDrawer: 'first'` | parametri in `FF.DEFAULT_RULES` |
